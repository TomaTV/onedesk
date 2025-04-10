import { executeQuery } from "./db";

// Récupère tous les channels d'un workspace
export async function getWorkspaceChannels(workspaceId) {
  const query = `
    SELECT * 
    FROM channels 
    WHERE workspace_id = ?
    ORDER BY position, created_at
  `;

  return executeQuery({
    query,
    values: [workspaceId],
  });
}

// Récupère les détails d'un channel
export async function getChannelById(channelId) {
  const query = `
    SELECT * 
    FROM channels 
    WHERE id = ?
  `;

  const results = await executeQuery({
    query,
    values: [channelId],
  });

  return results[0];
}

// Crée un nouveau channel avec une transaction
export async function createChannel({
  name,
  type,
  emoji,
  workspaceId,
  createdBy,
  keepConnectionOpen = false
}) {
  // Valider les données avant de commencer
  if (!name || !workspaceId || !createdBy) {
    throw new Error("Missing required channel data");
  }

  try {
    // Utiliser une transaction pour s'assurer que toutes les opérations réussissent ou échouent ensemble
    const operations = [
      // 1. Récupérer la position maximale pour ce workspace
      async (db) => {
        const positionQuery = `
          SELECT COALESCE(MAX(position), 0) as maxPosition
          FROM channels
          WHERE workspace_id = ?
        `;

        const [positionResult] = await db.query(positionQuery, [workspaceId]);
        return positionResult.maxPosition || 0;
      },
      
      // 2. Créer le channel avec la position suivante
      async (db, results) => {
        // S'assurer que le résultat précédent existe
        if (!results || results.length === 0 || results[0] === undefined) {
          throw new Error("Failed to get position information");
        }
        
        const nextPosition = results[0] + 1;
        
        const query = `
          INSERT INTO channels (
            name, 
            type, 
            emoji, 
            workspace_id, 
            position,
            created_by
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        const result = await db.query(query, [
          name, 
          type || "discussion", // Valeur par défaut si non fournie
          emoji || null, 
          workspaceId, 
          nextPosition, 
          createdBy
        ]);
        
        return result.insertId;
      },
      
      // 3. Récupérer les détails complets du channel créé
      async (db, results) => {
        // Vérifier que le résultat précédent existe
        if (!results || results.length < 2 || results[1] === undefined) {
          throw new Error("Failed to get channel ID");
        }
        
        const channelId = results[1]; // L'ID du channel est retourné par l'opération précédente
        
        const query = `
          SELECT * 
          FROM channels 
          WHERE id = ?
        `;

        const [channelDetails] = await db.query(query, [channelId]);
        return channelDetails;
      }
    ];

    // Exécuter la transaction
    const { executeTransaction } = require('./db');
    const results = await executeTransaction(operations, keepConnectionOpen);
    
    // Retourner les détails du channel créé
    return results[2]; // Le channel complet est retourné par la troisième opération
  } catch (error) {
    console.error("Error creating channel:", error);
    throw new Error(`Failed to create channel: ${error.message}`);
  }
}

// Met à jour un channel avec transaction
export async function updateChannel(channelId, { name, type, emoji }) {
  // Valider les données avant de commencer
  if (!channelId) {
    throw new Error("Channel ID is required");
  }

  try {
    // Utiliser une transaction pour s'assurer que toutes les opérations réussissent ou échouent ensemble
    const operations = [
      // 1. Vérifier si le channel existe
      async (db) => {
        const query = `
          SELECT * 
          FROM channels 
          WHERE id = ?
        `;

        const [channel] = await db.query(query, [channelId]);
        
        if (!channel) {
          throw new Error("Channel not found");
        }
        
        return channel;
      },
      
      // 2. Mettre à jour le channel
      async (db, results) => {
        // Vérifier que le résultat précédent existe
        if (!results || results.length === 0 || !results[0]) {
          throw new Error("Failed to get channel information");
        }
        
        const channel = results[0];
        
        // Utiliser les valeurs existantes comme valeurs par défaut
        const updatedName = name || channel.name;
        const updatedType = type || channel.type;
        const updatedEmoji = emoji !== undefined ? emoji : channel.emoji;
        
        const query = `
          UPDATE channels
          SET 
            name = ?,
            type = ?,
            emoji = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;

        await db.query(query, [updatedName, updatedType, updatedEmoji, channelId]);
        return channelId;
      },
      
      // 3. Récupérer les détails complets du channel mis à jour
      async (db, results) => {
        const query = `
          SELECT * 
          FROM channels 
          WHERE id = ?
        `;

        const [updatedChannel] = await db.query(query, [channelId]);
        return updatedChannel;
      }
    ];

    // Exécuter la transaction
    const { executeTransaction } = require('./db');
    const results = await executeTransaction(operations);
    
    // Retourner les détails du channel mis à jour
    return results[2]; // Le channel mis à jour est retourné par la troisième opération
  } catch (error) {
    console.error("Error updating channel:", error);
    throw new Error(`Failed to update channel: ${error.message}`);
  }
}

// Met à jour la position d'un channel avec transaction
export async function updateChannelPosition(channelId, newPosition) {
  // Valider les données avant de commencer
  if (!channelId || newPosition === undefined || newPosition < 0) {
    throw new Error("Valid channelId and newPosition are required");
  }

  try {
    // Utiliser une transaction pour s'assurer que toutes les opérations réussissent ou échouent ensemble
    const operations = [
      // 1. Obtenir les informations du channel actuel
      async (db) => {
        const query = `
          SELECT * 
          FROM channels 
          WHERE id = ?
        `;

        const [channel] = await db.query(query, [channelId]);
        
        if (!channel) {
          throw new Error("Channel not found");
        }
        
        return channel;
      },
      
      // 2. Mettre à jour les positions des autres channels affectés
      async (db, results) => {
        const channel = results[0];
        const workspaceId = channel.workspace_id;
        const currentPosition = channel.position;
        
        // Si la position ne change pas, rien à faire
        if (newPosition === currentPosition) {
          return { channel, unchanged: true };
        }
        
        // Mettre à jour toutes les positions affectées
        if (newPosition > currentPosition) {
          // Déplacer vers le bas - décaler les channels intermédiaires vers le haut
          const updateQuery = `
            UPDATE channels
            SET position = position - 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE workspace_id = ?
              AND position > ?
              AND position <= ?
          `;

          await db.query(updateQuery, [workspaceId, currentPosition, newPosition]);
        } else if (newPosition < currentPosition) {
          // Déplacer vers le haut - décaler les channels intermédiaires vers le bas
          const updateQuery = `
            UPDATE channels
            SET position = position + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE workspace_id = ?
              AND position >= ?
              AND position < ?
          `;

          await db.query(updateQuery, [workspaceId, newPosition, currentPosition]);
        }
        
        return { channel, unchanged: false };
      },
      
      // 3. Mettre à jour la position du channel cible
      async (db, results) => {
        // Vérifier que le résultat précédent existe
        if (!results || results.length < 2 || !results[1]) {
          throw new Error("Failed to get position change status");
        }
        
        const { channel, unchanged } = results[1];
        
        // Si la position n'a pas changé, retourner le channel sans modification
        if (unchanged) {
          return channel;
        }
        
        const setPositionQuery = `
          UPDATE channels
          SET position = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;

        await db.query(setPositionQuery, [newPosition, channelId]);
        
        // Récupérer le channel mis à jour
        const query = `
          SELECT * 
          FROM channels 
          WHERE id = ?
        `;

        const [updatedChannel] = await db.query(query, [channelId]);
        return updatedChannel;
      }
    ];

    // Exécuter la transaction
    const { executeTransaction } = require('./db');
    const results = await executeTransaction(operations);
    
    // Retourner les détails du channel mis à jour
    return results[2]; // Le channel mis à jour est retourné par la troisième opération
  } catch (error) {
    console.error("Error updating channel position:", error);
    throw new Error(`Failed to update channel position: ${error.message}`);
  }
}

// Supprime un channel de façon sécurisée avec transaction
export async function deleteChannel(channelId) {
  if (!channelId) {
    throw new Error("Channel ID is required");
  }

  try {
    // Utiliser une transaction pour s'assurer que toutes les opérations réussissent ou échouent ensemble
    const operations = [
      // 1. Obtenir les informations du channel pour la réorganisation
      async (db) => {
        const query = `
          SELECT * 
          FROM channels 
          WHERE id = ?
        `;

        const [channel] = await db.query(query, [channelId]);
        
        if (!channel) {
          throw new Error("Channel not found");
        }
        
        return channel;
      },
      
      // 2. Supprimer le channel
      async (db, results) => {
        const channel = results[0];
        const deleteQuery = `DELETE FROM channels WHERE id = ?`;

        const result = await db.query(deleteQuery, [channelId]);
        return { 
          channel, 
          deleted: result.affectedRows > 0 
        };
      },
      
      // 3. Réorganiser les positions des autres channels si nécessaire
      async (db, results) => {
        // Vérifier que le résultat précédent existe
        if (!results || results.length < 2 || !results[1]) {
          throw new Error("Failed to get deletion status");
        }
        
        const { channel, deleted } = results[1];
        
        // Si la suppression a échoué ou s'il n'y a pas de channel, terminer
        if (!deleted || !channel) {
          return false;
        }
        
        // Réorganiser les positions
        const reorderQuery = `
          UPDATE channels
          SET position = position - 1,
              updated_at = CURRENT_TIMESTAMP
          WHERE workspace_id = ? AND position > ?
        `;

        await db.query(reorderQuery, [channel.workspace_id, channel.position]);
        
        // Compter combien de channels restants
        const countQuery = `
          SELECT COUNT(*) AS count 
          FROM channels 
          WHERE workspace_id = ?
        `;
        
        const [countResult] = await db.query(countQuery, [channel.workspace_id]);
        
        return {
          success: true,
          remainingChannels: countResult.count || 0,
          workspaceId: channel.workspace_id
        };
      }
    ];

    // Exécuter la transaction
    const { executeTransaction } = require('./db');
    const results = await executeTransaction(operations);
    const finalResult = results[2]; // Le résultat de la troisième opération
    
    return finalResult || false;
  } catch (error) {
    console.error("Error deleting channel:", error);
    throw new Error(`Failed to delete channel: ${error.message}`);
  }
}
