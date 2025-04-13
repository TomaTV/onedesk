import { Server } from 'socket.io';
import { executeQuery } from '@/lib/db';
import { addMessage, deleteMessage, updateMessage } from '@/lib/messages';

// Singleton pour l'instance Socket.IO
let io;

/**
 * Initialiser le serveur Socket.IO
 * @param {any} res - Response object ou HTTPServer
 * @returns {Server} Instance Socket.IO
 */
export function initSocketServer(res) {
  if (!io) {
    // Créer une nouvelle instance
    io = new Server({
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
      path: '/api/socket',
    });

    // Configurer l'authentification
    io.use(async (socket, next) => {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error("Authentification requise"));
      }
      
      try {
        // Vérifier l'email/token (simplifié)
        const [user] = await executeQuery({
          query: "SELECT id, name, email, avatar FROM users WHERE email = ?",
          values: [token],
        });
        
        if (!user) {
          return next(new Error("Utilisateur non trouvé"));
        }
        
        // Stocker les informations de l'utilisateur dans l'objet socket
        socket.user = user;
        next();
      } catch (error) {
        console.error("Erreur d'authentification socket:", error);
        next(new Error("Erreur d'authentification"));
      }
    });

    // Configuration des événements Socket.IO
    io.on("connection", async (socket) => {
      console.log(`Client connecté: ${socket.id}, utilisateur: ${socket.user.email}`);
      
      // Rejoindre une room personnelle basée sur l'email de l'utilisateur pour les notifications
      if (socket.user && socket.user.email) {
        const userRoom = `user:${socket.user.email}`;
        socket.join(userRoom);
        console.log(`Client ${socket.id} a rejoint sa room personnelle ${userRoom}`);
        
        // Pour faciliter le débogage, envoyons une notification de test 5 secondes après la connexion
        setTimeout(() => {
          // Envoyer une notification de connexion pour confirmer que tout fonctionne
          socket.emit('debug', { message: 'Votre client est correctement connecté et peut recevoir des notifications' });
          
          // Commentez la ligne suivante en production
          // socket.emit('notification', { type: 'test', workspaceName: 'Test Workspace', from: 'Système', message: 'Test de notification', token: 'test-token' });
        }, 5000);
      }
      
      // Envoyer un événement de confirmation de connexion
      if (socket.user && socket.user.email) {
        const userRoom = `user:${socket.user.email}`;
        socket.emit('connected', { 
          userRoom,
          message: 'Connecté au système de notification en temps réel'
        });
      }
      
      // Tester la notification - décommenter pour tester
      // setTimeout(() => {
      //   socket.emit('notification', { type: 'test', message: 'Test notification' });
      //   console.log(`Test notification envoyé à ${socket.id}`);
      // }, 5000);
      
      // Rejoindre un channel
      socket.on("join", (channelId) => {
        const roomName = `channel:${channelId}`;
        socket.join(roomName);
        console.log(`Client ${socket.id} a rejoint ${roomName}`);
      });
      
      // Quitter un channel
      socket.on("leave", (channelId) => {
        const roomName = `channel:${channelId}`;
        socket.leave(roomName);
        console.log(`Client ${socket.id} a quitté ${roomName}`);
      });
      
      // Envoyer un message
      socket.on("message", async ({ channelId, content }) => {
        try {
          // Vérifier l'accès de l'utilisateur au channel
          const [userAccess] = await executeQuery({
            query: `
              SELECT 1 FROM channels c
              JOIN workspace_members wm ON c.workspace_id = wm.workspace_id
              WHERE c.id = ? AND wm.user_id = ?
            `,
            values: [channelId, socket.user.id],
          });

          if (!userAccess) {
            socket.emit("error", "Vous n'avez pas accès à ce channel");
            return;
          }

          // Ajouter le message en base de données
          const message = await addMessage(channelId, socket.user.id, content);
          
          // S'assurer que les données utilisateur sont incluses
          message.user_name = socket.user.name;
          message.user_avatar = socket.user.avatar;
          
          // Diffuser le message à tous les utilisateurs dans ce channel
          const roomName = `channel:${channelId}`;
          io.to(roomName).emit("message", message);
        } catch (error) {
          console.error("Erreur d'envoi de message:", error);
          socket.emit("error", "Erreur d'envoi de message: " + error.message);
        }
      });
      
      // Notification de suppression de message
      socket.on("deleteMessage", async ({ channelId, messageId }) => {
        try {
          await deleteMessage(messageId, socket.user.id);
          const roomName = `channel:${channelId}`;
          io.to(roomName).emit("messageDeleted", { id: messageId });
        } catch (error) {
          socket.emit("error", "Erreur de suppression: " + error.message);
        }
      });
      
      // Notification de mise à jour de message
      socket.on("updateMessage", async ({ channelId, messageId, content }) => {
        try {
          const updatedMessage = await updateMessage(messageId, socket.user.id, content);
          updatedMessage.user_name = socket.user.name;
          updatedMessage.user_avatar = socket.user.avatar;
          
          const roomName = `channel:${channelId}`;
          io.to(roomName).emit("messageUpdated", updatedMessage);
        } catch (error) {
          socket.emit("error", "Erreur de mise à jour: " + error.message);
        }
      });
      
      // Déconnexion
      socket.on("disconnect", () => {
        console.log(`Client déconnecté: ${socket.id}`);
      });
    });
    
    // Attacher au serveur HTTP si disponible
    if (res && res.socket && res.socket.server) {
      res.socket.server.io = io;
      console.log("Socket.IO attaché au serveur HTTP");
    }
    
    // Ajouter une méthode d'envoi de notification à l'instance Socket.IO
    io.sendNotification = (email, notificationData) => {
      try {
        const userRoom = `user:${email}`;
        
        // S'assurer que les données de notification ont un timestamp
        if (!notificationData.timestamp) {
          notificationData.timestamp = new Date().toISOString();
        }
        
        // Envoyer la notification sur plusieurs canaux pour assurer la compatibilité
        io.to(userRoom).emit('notification', notificationData);
        io.to(userRoom).emit('invitation', notificationData);
        io.to(userRoom).emit('global_invitation', notificationData);
        
        console.log(`Notification envoyée à ${userRoom}:`, notificationData);
        return true;
      } catch (error) {
        console.error(`Erreur d'envoi de notification à ${email}:`, error);
        return false;
      }
    };
  }
  
  return io;
}

/**
 * Obtenir l'instance Socket.IO existante
 * @returns {Server|null} Instance Socket.IO ou null si non initialisée
 */
export function getSocketInstance() {
  return io || null;
}
