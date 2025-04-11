import { executeQuery } from "./db";

/**
 * Récupère tous les messages d'un channel spécifique
 * @param {number} channelId - ID du channel
 * @param {number} limit - Nombre de messages à récupérer (optionnel, par défaut 50)
 * @param {number} offset - Offset pour la pagination (optionnel, par défaut 0)
 * @returns {Promise<Array>} Liste des messages avec informations sur l'utilisateur
 */
export async function getChannelMessages(channelId, limit = 50, offset = 0) {
  try {
    const messages = await executeQuery({
      query: `
        SELECT m.*, u.name as user_name, u.avatar as user_avatar 
        FROM messages m
        JOIN users u ON m.user_id = u.id
        WHERE m.channel_id = ?
        ORDER BY m.created_at DESC
        LIMIT ? OFFSET ?
      `,
      values: [channelId, limit, offset],
    });

    return messages.reverse(); // Renvoyer dans l'ordre chronologique
  } catch (error) {
    console.error("Error fetching channel messages:", error);
    throw new Error(`Failed to fetch messages: ${error.message}`);
  }
}

/**
 * Ajoute un nouveau message dans un channel
 * @param {number} channelId - ID du channel
 * @param {number} userId - ID de l'utilisateur
 * @param {string} content - Contenu du message
 * @returns {Promise<Object>} Le message créé avec ID
 */
export async function addMessage(channelId, userId, content) {
  try {
    // Vérifier que le contenu n'est pas vide
    if (!content || content.trim() === '') {
      throw new Error("Message content cannot be empty");
    }

    // Insérer le message
    const result = await executeQuery({
      query: `
        INSERT INTO messages (channel_id, user_id, content)
        VALUES (?, ?, ?)
      `,
      values: [channelId, userId, content.trim()],
    });

    if (!result.insertId) {
      throw new Error("Failed to insert message");
    }

    // Récupérer le message complet avec les infos utilisateur
    const [message] = await executeQuery({
      query: `
        SELECT m.*, u.name as user_name, u.avatar as user_avatar 
        FROM messages m
        JOIN users u ON m.user_id = u.id
        WHERE m.id = ?
      `,
      values: [result.insertId],
    });

    return message;
  } catch (error) {
    console.error("Error adding message:", error);
    throw new Error(`Failed to add message: ${error.message}`);
  }
}

/**
 * Supprime un message
 * @param {number} messageId - ID du message
 * @param {number} userId - ID de l'utilisateur (pour vérification)
 * @returns {Promise<boolean>} Succès de la suppression
 */
export async function deleteMessage(messageId, userId) {
  try {
    // Vérifier que l'utilisateur est bien l'auteur du message
    const [message] = await executeQuery({
      query: "SELECT user_id FROM messages WHERE id = ?",
      values: [messageId],
    });

    if (!message) {
      throw new Error("Message not found");
    }

    if (message.user_id !== userId) {
      throw new Error("You can only delete your own messages");
    }

    // Supprimer le message
    const result = await executeQuery({
      query: "DELETE FROM messages WHERE id = ?",
      values: [messageId],
    });

    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error deleting message:", error);
    throw new Error(`Failed to delete message: ${error.message}`);
  }
}

/**
 * Modifie un message
 * @param {number} messageId - ID du message
 * @param {number} userId - ID de l'utilisateur (pour vérification)
 * @param {string} newContent - Nouveau contenu du message
 * @returns {Promise<Object>} Le message modifié
 */
export async function updateMessage(messageId, userId, newContent) {
  try {
    // Vérifier que le contenu n'est pas vide
    if (!newContent || newContent.trim() === '') {
      throw new Error("Message content cannot be empty");
    }

    // Vérifier que l'utilisateur est bien l'auteur du message
    const [message] = await executeQuery({
      query: "SELECT user_id FROM messages WHERE id = ?",
      values: [messageId],
    });

    if (!message) {
      throw new Error("Message not found");
    }

    if (message.user_id !== userId) {
      throw new Error("You can only edit your own messages");
    }

    // Mettre à jour le message
    await executeQuery({
      query: "UPDATE messages SET content = ? WHERE id = ?",
      values: [newContent.trim(), messageId],
    });

    // Récupérer le message mis à jour
    const [updatedMessage] = await executeQuery({
      query: `
        SELECT m.*, u.name as user_name, u.avatar as user_avatar 
        FROM messages m
        JOIN users u ON m.user_id = u.id
        WHERE m.id = ?
      `,
      values: [messageId],
    });

    return updatedMessage;
  } catch (error) {
    console.error("Error updating message:", error);
    throw new Error(`Failed to update message: ${error.message}`);
  }
}