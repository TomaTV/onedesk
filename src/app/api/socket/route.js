import { NextResponse } from "next/server";
import { Server } from "socket.io";
import { getServerSession } from "next-auth";
import { addMessage } from "@/lib/messages";
import { executeQuery } from "@/lib/db";

// Stockage des instances Socket.IO par requête
let io;

export async function GET(req) {
  if (!io) {
    // Créer une nouvelle instance de Socket.IO si elle n'existe pas encore
    io = new Server({
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    // Configuration des événements Socket.IO
    io.on("connection", async (socket) => {
      console.log(`Client connecté: ${socket.id}`);
      
      // Authentification
      socket.on("authenticate", async (token) => {
        try {
          // Vérification simplifiée du token pour l'exemple
          // Dans un cas réel, il faudrait utiliser une méthode plus sécurisée
          if (!token || token.trim() === "") {
            socket.emit("error", "Non authentifié");
            return;
          }
          
          socket.auth = true;
          socket.emit("authenticated");
        } catch (error) {
          console.error("Erreur d'authentification:", error);
          socket.emit("error", "Erreur d'authentification");
        }
      });

      // Rejoindre un channel
      socket.on("join", (channelId) => {
        if (!socket.auth) {
          socket.emit("error", "Non authentifié");
          return;
        }
        
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
      socket.on("message", async ({ channelId, content, userId, userName, userAvatar }) => {
        if (!socket.auth) {
          socket.emit("error", "Non authentifié");
          return;
        }
        
        try {
          // Vérifier l'accès de l'utilisateur au channel
          const [userAccess] = await executeQuery({
            query: `
              SELECT 1 FROM channels c
              JOIN workspace_members wm ON c.workspace_id = wm.workspace_id
              WHERE c.id = ? AND wm.user_id = ?
            `,
            values: [channelId, userId],
          });

          if (!userAccess) {
            socket.emit("error", "Vous n'avez pas accès à ce channel");
            return;
          }

          // Ajouter le message en base de données
          const message = await addMessage(channelId, userId, content);
          
          // Enrichir le message avec les infos utilisateur (si non présentes)
          if (!message.user_name) {
            message.user_name = userName;
          }
          if (!message.user_avatar) {
            message.user_avatar = userAvatar;
          }
          
          // Diffuser le message à tous les utilisateurs dans ce channel
          const roomName = `channel:${channelId}`;
          io.to(roomName).emit("message", message);
        } catch (error) {
          console.error("Erreur d'envoi de message:", error);
          socket.emit("error", "Erreur d'envoi de message: " + error.message);
        }
      });
      
      // Notification de suppression de message
      socket.on("deleteMessage", ({ channelId, messageId }) => {
        if (!socket.auth) {
          socket.emit("error", "Non authentifié");
          return;
        }
        
        const roomName = `channel:${channelId}`;
        io.to(roomName).emit("messageDeleted", { id: messageId });
      });
      
      // Notification de mise à jour de message
      socket.on("updateMessage", ({ channelId, message }) => {
        if (!socket.auth) {
          socket.emit("error", "Non authentifié");
          return;
        }
        
        const roomName = `channel:${channelId}`;
        io.to(roomName).emit("messageUpdated", message);
      });
      
      // Déconnexion
      socket.on("disconnect", () => {
        console.log(`Client déconnecté: ${socket.id}`);
      });
    });
    
    // Ne pas démarrer un serveur séparé, utiliser le serveur HTTP de Next.js
    // L'adaptateur sera géré par le client Socket.IO via le chemin /api/socket
  }
  
  return NextResponse.json({ message: "Socket.IO server running" });
}

export const dynamic = "force-dynamic";
