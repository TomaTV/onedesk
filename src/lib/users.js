import { executeQuery } from "./db";

// Récupère un utilisateur par son ID
export async function getUserById(userId) {
  const query = `
    SELECT id, name, email, avatar, created_at, updated_at
    FROM users
    WHERE id = ?
  `;

  const results = await executeQuery({
    query,
    values: [userId],
  });

  return results[0];
}

// Récupère un utilisateur par son email
export async function getUserByEmail(email) {
  const query = `
    SELECT id, name, email, avatar, created_at, updated_at
    FROM users
    WHERE email = ?
  `;

  const results = await executeQuery({
    query,
    values: [email],
  });

  return results[0];
}

// Crée un nouvel utilisateur
export async function createUser({ name, email, password, avatar }) {
// Vérifier si l'utilisateur existe déjà
const existingUser = await getUserByEmail(email);
if (existingUser) {
return existingUser;
}

let query;
let values;

// Si l'utilisateur utilise OAuth (Google), le mot de passe peut être null
if (!password) {
  query = `
    INSERT INTO users (name, email, avatar)
      VALUES (?, ?, ?)
    `;
    values = [name, email, avatar];
  } else {
    // Cas avec mot de passe (peu probable avec l'authentification Google)
    // Dans une application réelle, il faudrait hasher le mot de passe
    query = `
      INSERT INTO users (name, email, password_hash, avatar)
      VALUES (?, ?, ?, ?)
    `;
    values = [name, email, password, avatar];
  }
  
  const result = await executeQuery({
    query,
    values,
  });
  
  return getUserById(result.insertId);
}

// Met à jour un utilisateur
export async function updateUser(userId, { name, email, avatar }) {
  const query = `
    UPDATE users
    SET 
      name = ?,
      email = ?,
      avatar = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  await executeQuery({
    query,
    values: [name, email, avatar, userId],
  });

  return getUserById(userId);
}

// Récupère tous les membres d'un workspace
export async function getWorkspaceMembers(workspaceId) {
  const query = `
    SELECT 
      u.id, 
      u.name, 
      u.email, 
      u.avatar, 
      wm.role,
      wm.joined_at
    FROM users u
    INNER JOIN workspace_members wm ON u.id = wm.user_id
    WHERE wm.workspace_id = ?
    ORDER BY u.name
  `;

  return executeQuery({
    query,
    values: [workspaceId],
  });
}

// Vérifie si un utilisateur est membre d'un workspace
export async function isWorkspaceMember(userId, workspaceId) {
  const query = `
    SELECT COUNT(*) as count
    FROM workspace_members
    WHERE user_id = ? AND workspace_id = ?
  `;

  const result = await executeQuery({
    query,
    values: [userId, workspaceId],
  });

  return result[0].count > 0;
}

// Vérifie si un utilisateur est admin d'un workspace
export async function isWorkspaceAdmin(userId, workspaceId) {
  const query = `
    SELECT COUNT(*) as count
    FROM workspace_members
    WHERE user_id = ? AND workspace_id = ? AND role = 'admin'
  `;

  const result = await executeQuery({
    query,
    values: [userId, workspaceId],
  });

  return result[0].count > 0;
}
