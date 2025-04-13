"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";

/**
 * Hook personnalisé pour gérer la communication chat
 * @param {number} channelId - ID du channel
 * @param {number} initialLimit - Nombre initial de messages à charger (défaut: 25)
 * @returns {Object} - État et fonctions pour interagir avec le chat
 */
export default function useChat(channelId, initialLimit = 25) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false); // Pour charger plus de messages
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(true);
  const [hasMore, setHasMore] = useState(true); // Indique s'il y a plus de messages à charger
  const [currentPage, setCurrentPage] = useState(0); // Pour gérer la pagination
  const limitRef = useRef(initialLimit); // Utiliser une réf pour ne pas déclencher useEffect

  // Charger les messages initiaux
  useEffect(() => {
    if (!channelId) return;

    setMessages([]);
    setCurrentPage(0);
    setHasMore(true);
    setLoading(true);
    setError(null);

    const fetchInitialMessages = async () => {
      try {
        const response = await fetch(
          `/api/channels/${channelId}/messages?limit=${limitRef.current}`
        );

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setMessages(data || []);
        setConnected(true);

        // Si on reçoit moins de messages que demandé, il n'y en a probablement plus
        if (data.length < limitRef.current) {
          setHasMore(false);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des messages:", err);
        setError(`Impossible de charger les messages: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialMessages();

    // Rafraîchir les messages toutes les 10 secondes (moins fréquent)
    const intervalId = setInterval(fetchLatestMessages, 10000);

    return () => clearInterval(intervalId);
  }, [channelId]);

  // Fonction pour charger uniquement les nouveaux messages (rafraîchissements périodiques)
  const fetchLatestMessages = useCallback(async () => {
    if (!channelId || messages.length === 0) return;

    try {
      // Ne récupérer que les messages plus récents que notre dernier message
      const lastMessageTimestamp = messages[messages.length - 1]?.created_at;

      // Si le timestamp n'existe pas, charger tous les messages
      if (!lastMessageTimestamp) {
        const response = await fetch(
          `/api/channels/${channelId}/messages?limit=${limitRef.current}`
        );
        if (!response.ok) throw new Error(`Erreur ${response.status}`);
        const data = await response.json();
        setMessages(data || []);
        return;
      }

      // Ajouter un paramètre pour ne récupérer que les nouveaux messages
      const url = `/api/channels/${channelId}/messages?after=${encodeURIComponent(
        lastMessageTimestamp
      )}&limit=50`;
      const response = await fetch(url);

      if (!response.ok) throw new Error(`Erreur ${response.status}`);

      const newMessages = await response.json();
      if (newMessages && newMessages.length > 0) {
        // Ajouter uniquement les messages qui ne sont pas déjà présents
        const existingIds = new Set(messages.map((m) => m.id));
        const messagesToAdd = newMessages.filter((m) => !existingIds.has(m.id));

        if (messagesToAdd.length > 0) {
          setMessages((prev) => [...prev, ...messagesToAdd]);
        }
      }
    } catch (err) {
      console.error("Erreur lors du rafraichissement des messages:", err);
      // Ne pas modifier l'erreur principale pour ne pas impacter l'UI
    }
  }, [channelId, messages]);

  // Fonction pour charger plus de messages anciens (infinite scroll)
  const loadMoreMessages = useCallback(async () => {
    if (!channelId || loading || loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const offset = nextPage * limitRef.current;

      const response = await fetch(
        `/api/channels/${channelId}/messages?limit=${limitRef.current}&offset=${offset}`
      );

      if (!response.ok) throw new Error(`Erreur ${response.status}`);

      const olderMessages = await response.json();

      if (olderMessages.length === 0) {
        // Plus de messages à charger
        setHasMore(false);
      } else {
        // Prépend les messages plus anciens au début de la liste
        setMessages((prev) => [...olderMessages, ...prev]);
        setCurrentPage(nextPage);

        // Si moins de messages que demandé, on a probablement tout chargé
        if (olderMessages.length < limitRef.current) {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error("Erreur lors du chargement des messages anciens:", err);
      setError(
        `Erreur lors du chargement des messages anciens: ${err.message}`
      );
    } finally {
      setLoadingMore(false);
    }
  }, [channelId, currentPage, hasMore, loading, loadingMore]);

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
          formData.append("content", content.trim());

          // Ajouter chaque image comme un fichier séparé
          imageFiles.forEach((file, index) => {
            formData.append(`image_${index}`, file);
          });

          requestOptions = {
            method: "POST",
            body: formData,
          };
        } else {
          // Sinon, envoi JSON classique
          requestOptions = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: content.trim() }),
          };
        }

        const response = await fetch(
          `/api/channels/${channelId}/messages`,
          requestOptions
        );

        if (!response.ok) {
          throw new Error(
            `Erreur lors de l'envoi du message: ${response.status}`
          );
        }

        const newMessage = await response.json();
        setMessages((prev) => [...prev, newMessage]);

        // Ajouter un petit délai pour laisser le temps au serveur de traiter l'image
        if (imageFiles && imageFiles.length > 0) {
          setTimeout(() => {
            // Refetch messages pour obtenir l'URL de l'image
            fetch(
              `/api/channels/${channelId}/messages?limit=${limitRef.current}`
            )
              .then((res) => res.json())
              .then((data) => setMessages(data || []))
              .catch((err) =>
                console.error("Erreur rafraîchissement après upload:", err)
              );
          }, 1000);
        }
      } catch (err) {
        console.error("Erreur lors de l'envoi du message:", err);
        setError(`Erreur lors de l'envoi du message: ${err.message}`);
      }
    },
    [channelId, limitRef.current]
  );

  // Fonction pour supprimer un message
  const deleteMessage = useCallback(
    async (messageId) => {
      if (!channelId || !messageId) return;

      try {
        const response = await fetch(
          `/api/channels/${channelId}/messages/${messageId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Erreur lors de la suppression du message: ${response.status}`
          );
        }

        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
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
        const response = await fetch(
          `/api/channels/${channelId}/messages/${messageId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: content.trim() }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Erreur lors de la mise à jour du message: ${response.status}`
          );
        }

        const updatedMessage = await response.json();
        setMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? updatedMessage : msg))
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
    loadingMore,
    error,
    connected,
    hasMore,
    loadMoreMessages,
    sendMessage,
    deleteMessage,
    updateMessage,
  };
}
