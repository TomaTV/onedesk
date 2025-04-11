"use client";

import { io } from "socket.io-client";
import { useEffect, useState, useRef } from "react";

// Instance Socket.IO partagée
let socketInstance = null;

/**
 * Initialise une connexion Socket.IO
 * @returns {Object} Instance Socket.IO
 */
export function initializeSocket() {
  if (!socketInstance) {
    const socketUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    socketInstance = io(socketUrl, {
      path: "/api/socket",
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    // Écouteurs d'événements de base
    socketInstance.on("connect", () => {
      console.log("Connecté au serveur Socket.IO");
    });
    
    socketInstance.on("disconnect", (reason) => {
      console.log(`Déconnecté du serveur Socket.IO: ${reason}`);
    });
    
    socketInstance.on("error", (error) => {
      console.error("Erreur Socket.IO:", error);
    });
    
    socketInstance.on("reconnect", (attemptNumber) => {
      console.log(`Reconnecté au serveur Socket.IO (tentative ${attemptNumber})`);
    });
    
    socketInstance.on("reconnect_error", (error) => {
      console.error("Erreur de reconnexion Socket.IO:", error);
    });
  }
  
  return socketInstance;
}

/**
 * Authentifie l'utilisateur auprès du serveur Socket.IO
 * @param {string} token - Token d'authentification (ID de session ou autre)
 * @returns {Promise} Promesse résolue après authentification réussie
 */
export function authenticateSocket(token) {
  const socket = initializeSocket();
  
  return new Promise((resolve, reject) => {
    socket.emit("authenticate", token);
    
    socket.once("authenticated", () => {
      resolve();
    });
    
    socket.once("error", (error) => {
      reject(new Error(error));
    });
    
    // Timeout après 5 secondes
    setTimeout(() => {
      reject(new Error("Timeout d'authentification"));
    }, 5000);
  });
}

/**
 * Hook React pour utiliser Socket.IO dans un composant
 * @param {string} token - Token d'authentification
 * @returns {Object} Objet contenant l'instance Socket.IO et des méthodes utilitaires
 */
export function useSocket(token) {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const socket = useRef(null);
  
  useEffect(() => {
    // Initialiser Socket.IO
    socket.current = initializeSocket();
    
    // Gérer les événements de connexion
    const onConnect = () => {
      setIsConnected(true);
      setError(null);
      
      // Authentifier automatiquement
      if (token) {
        socket.current.emit("authenticate", token);
      }
    };
    
    const onDisconnect = () => {
      setIsConnected(false);
      setIsAuthenticated(false);
    };
    
    const onAuthenticated = () => {
      setIsAuthenticated(true);
      setError(null);
    };
    
    const onError = (err) => {
      setError(err);
    };
    
    // S'abonner aux événements
    socket.current.on("connect", onConnect);
    socket.current.on("disconnect", onDisconnect);
    socket.current.on("authenticated", onAuthenticated);
    socket.current.on("error", onError);
    
    // Si déjà connecté, s'authentifier immédiatement
    if (socket.current.connected && token) {
      socket.current.emit("authenticate", token);
    }
    
    // Nettoyage
    return () => {
      socket.current.off("connect", onConnect);
      socket.current.off("disconnect", onDisconnect);
      socket.current.off("authenticated", onAuthenticated);
      socket.current.off("error", onError);
    };
  }, [token]);
  
  /**
   * Rejoint un channel pour recevoir ses messages
   * @param {number} channelId - ID du channel à rejoindre
   */
  const joinChannel = (channelId) => {
    if (socket.current && isAuthenticated) {
      socket.current.emit("join", channelId);
    } else {
      console.warn("Socket non authentifié, impossible de rejoindre le channel");
    }
  };
  
  /**
   * Quitte un channel
   * @param {number} channelId - ID du channel à quitter
   */
  const leaveChannel = (channelId) => {
    if (socket.current && isAuthenticated) {
      socket.current.emit("leave", channelId);
    }
  };
  
  /**
   * Envoie un message dans un channel
   * @param {object} messageData - Données du message
   */
  const sendMessage = (messageData) => {
    if (socket.current && isAuthenticated) {
      socket.current.emit("message", messageData);
    } else {
      console.warn("Socket non authentifié, impossible d'envoyer le message");
    }
  };
  
  /**
   * Notifie la suppression d'un message
   * @param {number} channelId - ID du channel
   * @param {number} messageId - ID du message supprimé
   */
  const notifyMessageDeleted = (channelId, messageId) => {
    if (socket.current && isAuthenticated) {
      socket.current.emit("deleteMessage", { channelId, messageId });
    }
  };
  
  /**
   * Notifie la mise à jour d'un message
   * @param {number} channelId - ID du channel
   * @param {object} message - Message mis à jour
   */
  const notifyMessageUpdated = (channelId, message) => {
    if (socket.current && isAuthenticated) {
      socket.current.emit("updateMessage", { channelId, message });
    }
  };
  
  return {
    socket: socket.current,
    isConnected,
    isAuthenticated,
    error,
    joinChannel,
    leaveChannel,
    sendMessage,
    notifyMessageDeleted,
    notifyMessageUpdated,
  };
}
