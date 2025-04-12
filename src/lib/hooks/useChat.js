"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";

/**
 * Hook personnalisé pour gérer la communication chat
 * @param {number} channelId - ID du channel
 * @param {number} limit - Nombre de messages à charger (défaut: 50)
 * @returns {Object} - État et fonctions pour interagir avec le chat
 */
export default function useChat(channelId, limit = 50) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(true); // Simplifié pour résoudre le problème
  
  // Charger les messages initiaux et configurer le rafraîchissement
  useEffect(() => {
    if (!channelId) return;

    setLoading(true);
    setError(null);

    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/channels/${channelId}/messages?limit=${limit}`);
        
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setMessages(data || []);
        setConnected(true); // Toujours activer l'interface
      } catch (err) {
        console.error("Erreur lors du chargement des messages:", err);
        setError(`Impossible de charger les messages: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Rafraîchir les messages toutes les 5 secondes
    const intervalId = setInterval(fetchMessages, 5000);
    
    return () => clearInterval(intervalId);
  }, [channelId, limit]);

  // Fonction pour envoyer un message (version REST API)
  const sendMessage = useCallback(
    async (content, imageFiles = []) => {
      // Permettre l'envoi d'un message avec seulement des images (sans texte)
      if (!channelId || (!content.trim() && imageFiles.length === 0)) return;

      try {
        let requestOptions;
        
        if (imageFiles && imageFiles.length > 0) {
          // Si au moins une image est jointe, utiliser FormData pour l'upload multipart
          const formData = new FormData();
          formData.append('content', content.trim());
          
          // Ajouter chaque image comme un fichier séparé
          imageFiles.forEach((file, index) => {
            formData.append(`image_${index}`, file);
          });
          
          requestOptions = {
            method: 'POST',
            body: formData
          };
        } else {
          // Sinon, envoi JSON classique
          requestOptions = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: content.trim() }),
          };
        }

        const response = await fetch(`/api/channels/${channelId}/messages`, requestOptions);

        if (!response.ok) {
          throw new Error(`Erreur lors de l'envoi du message: ${response.status}`);
        }

        const newMessage = await response.json();
        setMessages(prev => [...prev, newMessage]);
        
        // Ajouter un petit délai pour laisser le temps au serveur de traiter l'image
        if (imageFiles && imageFiles.length > 0) {
          setTimeout(() => {
            // Refetch messages pour obtenir l'URL de l'image
            fetch(`/api/channels/${channelId}/messages?limit=${limit}`)
              .then(res => res.json())
              .then(data => setMessages(data || []))
              .catch(err => console.error("Erreur rafraîchissement après upload:", err));
          }, 1000);
        }
      } catch (err) {
        console.error("Erreur lors de l'envoi du message:", err);
        setError(`Erreur lors de l'envoi du message: ${err.message}`);
      }
    },
    [channelId, limit]
  );

  // Fonction pour supprimer un message
  const deleteMessage = useCallback(
    async (messageId) => {
      if (!channelId || !messageId) return;

      try {
        const response = await fetch(`/api/channels/${channelId}/messages/${messageId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`Erreur lors de la suppression du message: ${response.status}`);
        }

        setMessages(prev => prev.filter(msg => msg.id !== messageId));
      } catch (err) {
        console.error("Erreur lors de la suppression du message:", err);
        setError(`Erreur lors de la suppression du message: ${err.message}`);
      }
    },
    [channelId]
  );

  // Fonction pour mettre à jour un message
  const updateMessage = useCallback(
    async (messageId, content) => {
      if (!channelId || !messageId || !content.trim()) return;

      try {
        const response = await fetch(`/api/channels/${channelId}/messages/${messageId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: content.trim() }),
        });

        if (!response.ok) {
          throw new Error(`Erreur lors de la mise à jour du message: ${response.status}`);
        }

        const updatedMessage = await response.json();
        setMessages(prev => 
          prev.map(msg => msg.id === messageId ? updatedMessage : msg)
        );
      } catch (err) {
        console.error("Erreur lors de la mise à jour du message:", err);
        setError(`Erreur lors de la mise à jour du message: ${err.message}`);
      }
    },
    [channelId]
  );

  return {
    messages,
    loading,
    error,
    connected,
    sendMessage,
    deleteMessage,
    updateMessage,
  };
}
