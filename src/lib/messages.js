import { executeQuery } from "./db";
import fs from "fs";
import path from "path";

/**
 * Récupère tous les messages d'un channel spécifique
 * @param {number} channelId - ID du channel
 * @param {number} limit - Nombre de messages à récupérer (optionnel, par défaut 25)
 * @param {number} offset - Offset pour la pagination (optionnel, par défaut 0)
 * @returns {Promise<Array>} Liste des messages avec informations sur l'utilisateur
 */
export async function getChannelMessages(channelId, limit = 25, offset = 0) {
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
    
    // Traiter les images JSON pour chaque message
    for (const message of messages) {
      // Si le message a des images au format JSON, les parser
      if (message.images) {
        try {
          message.image_urls = JSON.parse(message.images);
        } catch (jsonError) {
          console.error("Erreur lors du parsing des images JSON:", jsonError);
          message.image_urls = [];
        }
      } else {
        message.image_urls = [];
      }
      
      // Si l'ancienne colonne image_url est utilisée, l'ajouter au tableau image_urls
      if (message.image_url && !message.image_urls.includes(message.image_url)) {
        message.image_urls.push(message.image_url);
      }
    }

    return messages.reverse(); // Renvoyer dans l'ordre chronologique
  } catch (error) {
    console.error("Error fetching channel messages:", error);
    throw new Error(`Failed to fetch messages: ${error.message}`);
  }
}

/**
 * Récupère les messages après un timestamp donné
 * @param {number} channelId - ID du channel
 * @param {string} timestamp - Timestamp ISO pour filtrer les messages plus récents
 * @returns {Promise<Array>} Liste des messages après le timestamp donné
 */
export async function getMessagesSince(channelId, timestamp) {
  try {
    const messages = await executeQuery({
      query: `
        SELECT m.*, u.name as user_name, u.avatar as user_avatar 
        FROM messages m
        JOIN users u ON m.user_id = u.id
        WHERE m.channel_id = ? AND m.created_at > ?
        ORDER BY m.created_at ASC
      `,
      values: [channelId, timestamp],
    });
    
    // Traiter les images JSON pour chaque message
    for (const message of messages) {
      // Si le message a des images au format JSON, les parser
      if (message.images) {
        try {
          message.image_urls = JSON.parse(message.images);
        } catch (jsonError) {
          console.error("Erreur lors du parsing des images JSON:", jsonError);
          message.image_urls = [];
        }
      } else {
        message.image_urls = [];
      }
      
      // Si l'ancienne colonne image_url est utilisée, l'ajouter au tableau image_urls
      if (message.image_url && !message.image_urls.includes(message.image_url)) {
        message.image_urls.push(message.image_url);
      }
    }

    return messages; // Déjà dans l'ordre chronologique
  } catch (error) {
    console.error("Error fetching messages since timestamp:", error);
    throw new Error(`Failed to fetch recent messages: ${error.message}`);
  }
}

/**
 * Ajoute un nouveau message dans un channel, avec ou sans image
 * @param {number} channelId - ID du channel
 * @param {number} userId - ID de l'utilisateur
 * @param {string} content - Contenu du message
 * @param {string|null} imageUrl - URL de l'image (optionnel)
 * @returns {Promise<Object>} Le message créé avec ID
 */
export async function addMessage(channelId, userId, content, imageUrl = null) {
  try {
    // Vérifier que le contenu n'est pas vide, sauf si une image est fournie
    if ((!content || content.trim() === "") && !imageUrl) {
      throw new Error("Message content cannot be empty");
    }

    // Insérer le message avec ou sans image
    const result = await executeQuery({
      query: `
        INSERT INTO messages (channel_id, user_id, content, image_url)
        VALUES (?, ?, ?, ?)
      `,
      values: [channelId, userId, content.trim(), imageUrl],
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
      query: "SELECT user_id, image_url, images FROM messages WHERE id = ?",
      values: [messageId],
    });

    if (!message) {
      throw new Error("Message not found");
    }

    if (message.user_id !== userId) {
      throw new Error("You can only delete your own messages");
    }

    // Supprimer l'image unique du message principal si elle existe (ancien format)
    if (message.image_url) {
      try {
        const imagePath = message.image_url;
        // Vérifier si l'image est stockée localement (commence par /uploads/)
        if (imagePath.startsWith("/uploads/")) {
          const filePath = path.join(process.cwd(), "public", imagePath);
          // Vérifier si le fichier existe avant de le supprimer
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Image supprimée: ${filePath}`);
          }
        }
      } catch (imageError) {
        console.error(
          "Erreur lors de la suppression de l'image:",
          imageError
        );
        // Continuer malgré l'erreur (ne pas bloquer la suppression du message)
      }
    }

    // Supprimer les images multiples (nouveau format)
    if (message.images) {
      try {
        const imageUrls = JSON.parse(message.images);
        
        for (const imagePath of imageUrls) {
          if (imagePath && imagePath.startsWith("/uploads/")) {
            try {
              const filePath = path.join(process.cwd(), "public", imagePath);
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`Image multiple supprimée: ${filePath}`);
              }
            } catch (imgError) {
              console.error("Erreur lors de la suppression d'une image:", imgError);
              // Continuer avec les autres images
            }
          }
        }
      } catch (jsonError) {
        console.error("Erreur lors du parsing JSON des images:", jsonError);
      }
    }

    // Supprimer le message (et tous ses enfants grâce à ON DELETE CASCADE)
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
    if (!newContent || newContent.trim() === "") {
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
