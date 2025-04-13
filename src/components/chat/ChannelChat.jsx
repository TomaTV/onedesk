"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import useChat from "@/lib/hooks/useChat";

export default function ChannelChat({ channel, workspace }) {
  const { data: session } = useSession();
  const [userId, setUserId] = useState(null);
  // Références pour le défilement
  const messagesEndRef = useRef(null);
  const firstLoadRef = useRef(true);
  const messagesContainerRef = useRef(null);

  // Utiliser notre hook personnalisé pour la gestion du chat
  const {
    messages,
    loading,
    error,
    loadMoreMessages,
    hasMore,
    loadingMore,
    sendMessage,
    deleteMessage,
    updateMessage,
  } = useChat(channel?.id);

  // Récupérer l'ID de l'utilisateur courant
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await fetch("/api/users/me");
        const userData = await response.json();
        setUserId(userData.id);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de l'ID utilisateur",
          error
        );
      }
    };

    if (session?.user) {
      fetchUserId();
    }
  }, [session]);

  // Faire défiler automatiquement vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    if (
      messagesEndRef.current &&
      (firstLoadRef.current || messages.length > 0)
    ) {
      messagesEndRef.current.scrollIntoView({
        behavior: firstLoadRef.current ? "auto" : "smooth",
      });

      // Réinitialiser le flag après le premier chargement
      if (firstLoadRef.current) {
        firstLoadRef.current = false;
      }
    }
  }, [messages]);

  // Gestionnaires d'événements simplifiés avec notre hook useChat
  const handleSendMessage = (content, imageFile) => {
    if (!userId) return;

    if (imageFile) {
      // Si une image est jointe, l'envoyer avec le message
      sendMessage(content, imageFile);
    } else {
      // Sinon, envoyer juste le texte
      sendMessage(content);
    }
  };

  const handleDeleteMessage = (messageId) => {
    if (!userId) return;
    deleteMessage(messageId);
  };

  const handleUpdateMessage = (messageId, newContent) => {
    if (!userId) return;
    updateMessage(messageId, newContent);
  };

  // Gestionnaire de défilement pour charger des messages plus anciens
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;

    const { scrollTop } = messagesContainerRef.current;

    // Si l'utilisateur a atteint le haut (ou presque), charger plus de messages
    if (scrollTop < 50 && !loading && !loadingMore && hasMore) {
      // Sauvegarder la position et la hauteur du conteneur
      const container = messagesContainerRef.current;
      const scrollHeight = container.scrollHeight;

      loadMoreMessages().then(() => {
        // Après le chargement, maintenir la même position de défilement relative
        if (container) {
          // Calculer la nouvelle position pour garder le même message visible
          const newScrollHeight = container.scrollHeight;
          const newScrollPosition = newScrollHeight - scrollHeight + 100; // +100px pour une meilleure expérience
          container.scrollTop = newScrollPosition;
        }
      });
    }
  }, [loading, loadingMore, hasMore, loadMoreMessages]);

  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Chargement des messages...</span>
        </div>
      </div>
    );
  }

  // Afficher un message d'erreur
  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-red-500">
            <p className="text-lg mb-2">Oups, une erreur est survenue.</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white shadow-sm">
      {/* En-tête du chat */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-gray-50 text-black">
        <div className="font-bold text-xl text-gray-800"># {channel?.name}</div>
        <div className="ml-3 text-sm text-gray-600">{channel?.emoji}</div>
      </div>
      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50"
        onScroll={handleScroll}
      >
        {loadingMore && hasMore && (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">
              Chargement de messages plus anciens...
            </span>
          </div>
        )}
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-center font-medium">
              Aucun message pour le moment.
            </p>
            <p className="text-center mt-2 text-sm text-gray-600">
              Soyez le premier à envoyer un message dans ce canal !
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                currentUserId={userId}
                onDelete={handleDeleteMessage}
                onUpdate={handleUpdateMessage}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      {/* Zone de saisie */}
      <ChatInput onSendMessage={handleSendMessage} isDisabled={!userId} />
    </div>
  );
}
