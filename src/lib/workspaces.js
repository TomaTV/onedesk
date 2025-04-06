import { executeQuery } from "./db";

// Récupère tous les workspaces d'un utilisateur

export async function getUserWorkspaces(userId, keepConnectionOpen = false) {
  const query = `
    SELECT w.* 
    FROM workspaces w
    INNER JOIN workspace_members wm ON w.id = wm.workspace_id
    WHERE wm.user_id = ?
    ORDER BY w.name
  `;

  return executeQuery({
    query,
    values: [userId],
    keepConnectionOpen
  });
}

// Récupère les détails d'un workspace par son ID
export async function getWorkspaceById(workspaceId, keepConnectionOpen = false) {
  const query = `
    SELECT * 
    FROM workspaces 
    WHERE id = ?
  `;

  const results = await executeQuery({
    query,
    values: [workspaceId],
    keepConnectionOpen
  });

  return results[0];
}

// Récupère les détails d'un workspace par son nom
export async function getWorkspaceByName(workspaceName, keepConnectionOpen = false) {
  const query = `
    SELECT * 
    FROM workspaces 
    WHERE name = ?
  `;

  const results = await executeQuery({
    query,
    values: [workspaceName],
    keepConnectionOpen
  });

  return results[0];
}

// Crée un nouveau workspace avec transaction
export async function createWorkspace({ name, letter, color }, userId, keepConnectionOpen = false) {
  // Valider les données avant de commencer
  if (!name || !letter || !color || !userId) {
    throw new Error("Missing required workspace data");
  }

  try {
    // Utiliser une transaction pour s'assurer que toutes les opérations réussissent ou échouent ensemble
    const operations = [
      // 1. Créer le workspace
      async (db) => {
        const insertWorkspaceQuery = `
          INSERT INTO workspaces (name, letter, color, created_by)
          VALUES (?, ?, ?, ?)
        `;

        const result = await db.query(insertWorkspaceQuery, [name, letter, color, userId]);
        return result.insertId;
      },
      
      // 2. Ajouter le créateur comme membre avec rôle admin
      async (db, results) => {
        // Vérifier que le résultat précédent existe
        if (!results || results.length === 0 || results[0] === undefined) {
          throw new Error("Failed to get workspace ID");
        }
        
        const workspaceId = results[0]; // Obtenir l'ID du workspace de la première opération
        const insertMemberQuery = `
          INSERT INTO workspace_members (workspace_id, user_id, role)
          VALUES (?, ?, 'admin')
        `;

        await db.query(insertMemberQuery, [workspaceId, userId]);
        return workspaceId;
      }
    ];

    // Exécuter la transaction
    const { executeTransaction } = require('./db');
    const results = await executeTransaction(operations, keepConnectionOpen);
    const workspaceId = results[1]; // L'ID du workspace est retourné par la seconde opération

    // Retourner les détails complets du workspace créé
    return getWorkspaceById(workspaceId, keepConnectionOpen);
  } catch (error) {
    console.error("Error creating workspace:", error);
    throw new Error(`Failed to create workspace: ${error.message}`);
  }
}

// Met à jour un workspace avec transaction
export async function updateWorkspace(workspaceId, { name, letter, color }) {
  // Valider les données avant de commencer
  if (!workspaceId) {
    throw new Error("Workspace ID is required");
  }

  try {
    // Utiliser une transaction pour s'assurer que l'opération est atomique
    const operations = [
      // 1. Vérifier si le workspace existe
      async (db) => {
        const query = `
          SELECT * 
          FROM workspaces 
          WHERE id = ?
        `;

        const [workspace] = await db.query(query, [workspaceId]);
        
        if (!workspace) {
          throw new Error("Workspace not found");
        }
        
        return workspace;
      },
      
      // 2. Mettre à jour le workspace
      async (db, results) => {
        // Vérifier que le résultat précédent existe
        if (!results || results.length === 0 || !results[0]) {
          throw new Error("Failed to get workspace information");
        }
        
        const workspace = results[0];
        
        // Utiliser les valeurs existantes comme valeurs par défaut
        const updatedName = name !== undefined ? name : workspace.name;
        const updatedLetter = letter !== undefined ? letter : workspace.letter;
        const updatedColor = color !== undefined ? color : workspace.color;
        
        const query = `
          UPDATE workspaces
          SET 
            name = ?,
            letter = ?,
            color = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;

        await db.query(query, [updatedName, updatedLetter, updatedColor, workspaceId]);
        return workspaceId;
      },
      
      // 3. Récupérer les détails complets du workspace mis à jour
      async (db, results) => {
        // Vérifier que le résultat précédent existe
        if (!results || results.length < 2 || results[1] === undefined) {
          throw new Error("Failed to update workspace");
        }
        
        const query = `
          SELECT * 
          FROM workspaces 
          WHERE id = ?
        `;

        const [updatedWorkspace] = await db.query(query, [workspaceId]);
        return updatedWorkspace;
      }
    ];

    // Exécuter la transaction
    const { executeTransaction } = require('./db');
    const results = await executeTransaction(operations);
    
    // Retourner les détails du workspace mis à jour
    return results[2]; // Le workspace mis à jour est retourné par la troisième opération
  } catch (error) {
    console.error("Error updating workspace:", error);
    throw new Error(`Failed to update workspace: ${error.message}`);
  }
}

// Supprime un workspace avec transaction
export async function deleteWorkspace(workspaceId) {
  // Valider les données avant de commencer
  if (!workspaceId) {
    throw new Error("Workspace ID is required");
  }

  try {
    // Utiliser une transaction pour s'assurer que l'opération est atomique
    const operations = [
      // 1. Vérifier si le workspace existe
      async (db) => {
        const query = `
          SELECT * 
          FROM workspaces 
          WHERE id = ?
        `;

        const [workspace] = await db.query(query, [workspaceId]);
        
        if (!workspace) {
          throw new Error("Workspace not found");
        }
        
        return workspace;
      },
      
      // 2. Supprimer le workspace
      async (db, results) => {
        // Vérifier que le résultat précédent existe
        if (!results || results.length === 0 || !results[0]) {
          throw new Error("Failed to get workspace information");
        }
        
        // MySQL va automatiquement supprimer tous les members et channels associés grâce aux contraintes ON DELETE CASCADE
        const query = `DELETE FROM workspaces WHERE id = ?`;

        const result = await db.query(query, [workspaceId]);
        return { 
          success: result.affectedRows > 0,
          workspaceName: results[0].name 
        };
      }
    ];

    // Exécuter la transaction
    const { executeTransaction } = require('./db');
    const results = await executeTransaction(operations);
    
    // Retourner le résultat de la suppression
    return results[1].success;
  } catch (error) {
    console.error("Error deleting workspace:", error);
    throw new Error(`Failed to delete workspace: ${error.message}`);
  }
}

// Ajoute un membre à un workspace
export async function addWorkspaceMember(workspaceId, userId, role = "member") {
  const query = `
    INSERT INTO workspace_members (workspace_id, user_id, role)
    VALUES (?, ?, ?)
  `;

  return executeQuery({
    query,
    values: [workspaceId, userId, role],
  });
}

//  Supprime un membre d'un workspace
export async function removeWorkspaceMember(workspaceId, userId) {
  const query = `
    DELETE FROM workspace_members 
    WHERE workspace_id = ? AND user_id = ?
  `;

  const result = await executeQuery({
    query,
    values: [workspaceId, userId],
  });

  return result.affectedRows > 0;
}

// Met à jour le rôle d'un membre du workspace
export async function updateWorkspaceMemberRole(workspaceId, userId, role) {
  const query = `
    UPDATE workspace_members
    SET role = ?
    WHERE workspace_id = ? AND user_id = ?
  `;

  const result = await executeQuery({
    query,
    values: [role, workspaceId, userId],
  });

  return result.affectedRows > 0;
}

// Vérifie et corrige le rôle administrateur pour le créateur du workspace
export async function ensureWorkspaceCreatorIsAdmin(workspaceId, userId) {
  try {
    // Vérifier si l'utilisateur est déjà admin
    const query = `
      SELECT role 
      FROM workspace_members 
      WHERE workspace_id = ? AND user_id = ?
    `;

    const results = await executeQuery({
      query,
      values: [workspaceId, userId],
    });

    // Si l'utilisateur n'est pas déjà membre, l'ajouter comme admin
    if (results.length === 0) {
      await addWorkspaceMember(workspaceId, userId, 'admin');
      return true;
    }
    
    // Si l'utilisateur est membre mais pas admin, mettre à jour son rôle
    if (results[0].role !== 'admin') {
      await updateWorkspaceMemberRole(workspaceId, userId, 'admin');
      return true;
    }
    
    return true; // Déjà admin
  } catch (error) {
    console.error("Error ensuring workspace creator is admin:", error);
    return false;
  }
}
