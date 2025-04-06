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

// Crée un nouveau channel
export async function createChannel({
  name,
  type,
  emoji,
  workspaceId,
  createdBy,
}) {
  // Récupérer la position maximale pour ce workspace
  const positionQuery = `
    SELECT COALESCE(MAX(position), 0) as maxPosition
    FROM channels
    WHERE workspace_id = ?
  `;

  const positionResult = await executeQuery({
    query: positionQuery,
    values: [workspaceId],
  });

  const nextPosition = (positionResult[0]?.maxPosition || 0) + 1;

  // Créer le channel
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

  const result = await executeQuery({
    query,
    values: [name, type, emoji, workspaceId, nextPosition, createdBy],
  });

  return getChannelById(result.insertId);
}

// Met à jour un channel
export async function updateChannel(channelId, { name, type, emoji }) {
  const query = `
    UPDATE channels
    SET 
      name = ?,
      type = ?,
      emoji = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  await executeQuery({
    query,
    values: [name, type, emoji, channelId],
  });

  return getChannelById(channelId);
}

// Met à jour la position d'un channel
export async function updateChannelPosition(channelId, newPosition) {
  // D'abord, obtenir les informations du channel actuel
  const channel = await getChannelById(channelId);
  if (!channel) throw new Error("Channel not found");

  const workspaceId = channel.workspace_id;
  const currentPosition = channel.position;

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

    await executeQuery({
      query: updateQuery,
      values: [workspaceId, currentPosition, newPosition],
    });
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

    await executeQuery({
      query: updateQuery,
      values: [workspaceId, newPosition, currentPosition],
    });
  }

  // Mettre à jour la position du channel cible
  const setPositionQuery = `
    UPDATE channels
    SET position = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  await executeQuery({
    query: setPositionQuery,
    values: [newPosition, channelId],
  });

  return getChannelById(channelId);
}

// Supprime un channel
export async function deleteChannel(channelId) {
  // D'abord, obtenir les informations du channel pour la réorganisation
  const channel = await getChannelById(channelId);
  if (!channel) return false;

  const workspaceId = channel.workspace_id;
  const position = channel.position;

  // Supprimer le channel
  const deleteQuery = `DELETE FROM channels WHERE id = ?`;

  const result = await executeQuery({
    query: deleteQuery,
    values: [channelId],
  });

  if (result.affectedRows > 0) {
    // Réorganiser les positions
    const reorderQuery = `
      UPDATE channels
      SET position = position - 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE workspace_id = ? AND position > ?
    `;

    await executeQuery({
      query: reorderQuery,
      values: [workspaceId, position],
    });

    return true;
  }

  return false;
}
