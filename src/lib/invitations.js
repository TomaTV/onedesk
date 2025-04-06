import { executeQuery } from "./db";
import { randomUUID } from "crypto";

// Crée une nouvelle invitation
export async function createInvitation(workspaceId, email) {
  // Générer un token unique
  const token = randomUUID();
  
  const query = `
    INSERT INTO workspace_invitations (token, workspace_id, email)
    VALUES (?, ?, ?)
  `;

  await executeQuery({
    query,
    values: [token, workspaceId, email],
  });
  
  return token;
}

// Récupère une invitation par son token
export async function getInvitationByToken(token) {
  const query = `
    SELECT wi.*, w.name as workspace_name, w.letter as workspace_letter, w.color as workspace_color
    FROM workspace_invitations wi
    JOIN workspaces w ON wi.workspace_id = w.id
    WHERE wi.token = ? AND wi.expires_at > CURRENT_TIMESTAMP
  `;

  const results = await executeQuery({
    query,
    values: [token],
  });

  return results[0];
}

// Vérifie si une invitation est valide et n'a pas expiré
export async function isInvitationValid(token) {
  const query = `
    SELECT COUNT(*) as count
    FROM workspace_invitations
    WHERE token = ? AND expires_at > CURRENT_TIMESTAMP
  `;

  const result = await executeQuery({
    query,
    values: [token],
  });

  return result[0].count > 0;
}

// Supprime une invitation après qu'elle ait été utilisée
export async function deleteInvitation(token) {
  const query = `
    DELETE FROM workspace_invitations
    WHERE token = ?
  `;

  const result = await executeQuery({
    query,
    values: [token],
  });

  return result.affectedRows > 0;
}

// Vérifie si un email a déjà une invitation pour un workspace spécifique
export async function hasExistingInvitation(workspaceId, email) {
  const query = `
    SELECT COUNT(*) as count
    FROM workspace_invitations
    WHERE workspace_id = ? AND email = ? AND expires_at > CURRENT_TIMESTAMP
  `;

  const result = await executeQuery({
    query,
    values: [workspaceId, email],
  });

  return result[0].count > 0;
}

// Récupère toutes les invitations actives pour un workspace
export async function getWorkspaceInvitations(workspaceId) {
  const query = `
    SELECT *
    FROM workspace_invitations
    WHERE workspace_id = ? AND expires_at > CURRENT_TIMESTAMP
    ORDER BY created_at DESC
  `;

  return executeQuery({
    query,
    values: [workspaceId],
  });
}
