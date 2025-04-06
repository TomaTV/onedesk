import { executeQuery } from "./db";

// Récupère tous les workspaces d'un utilisateur

export async function getUserWorkspaces(userId) {
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
  });
}

// Récupère les détails d'un workspace
export async function getWorkspaceById(workspaceId) {
  const query = `
    SELECT * 
    FROM workspaces 
    WHERE id = ?
  `;

  const results = await executeQuery({
    query,
    values: [workspaceId],
  });

  return results[0];
}

// Crée un nouveau workspace
export async function createWorkspace({ name, letter, color }, userId) {
  // 1. Créer le workspace
  const insertWorkspaceQuery = `
    INSERT INTO workspaces (name, letter, color, created_by)
    VALUES (?, ?, ?, ?)
  `;

  const workspaceResult = await executeQuery({
    query: insertWorkspaceQuery,
    values: [name, letter, color, userId],
  });

  const workspaceId = workspaceResult.insertId;

  // 2. Ajouter le créateur comme membre avec rôle admin
  const insertMemberQuery = `
    INSERT INTO workspace_members (workspace_id, user_id, role)
    VALUES (?, ?, 'admin')
  `;

  await executeQuery({
    query: insertMemberQuery,
    values: [workspaceId, userId],
  });

  return getWorkspaceById(workspaceId);
}

// Met à jour un workspace
export async function updateWorkspace(workspaceId, { name, letter, color }) {
  const query = `
    UPDATE workspaces
    SET 
      name = ?,
      letter = ?,
      color = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  await executeQuery({
    query,
    values: [name, letter, color, workspaceId],
  });

  return getWorkspaceById(workspaceId);
}

// Supprime un workspace
export async function deleteWorkspace(workspaceId) {
  const query = `DELETE FROM workspaces WHERE id = ?`;

  const result = await executeQuery({
    query,
    values: [workspaceId],
  });

  return result.affectedRows > 0;
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
