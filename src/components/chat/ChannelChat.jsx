"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import useChat from "@/lib/hooks/useChat";

export default function ChannelChat({ channel, workspace }) {
  const { data: session } = useSession();
  const [userId, setUserId] = useState(null);
  const messagesEndRef = useRef(null);
  const firstLoadRef = useRef(true);

  // Utiliser notre hook personnalisé pour la gestion du chat
  const {
    messages,
    loading,
    error,
    connected,
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
    if (!userId || !connected) return;

    if (imageFile) {
      // Si une image est jointe, l'envoyer avec le message
      sendMessage(content, imageFile);
    } else {
      // Sinon, envoyer juste le texte
      sendMessage(content);
    }
  };

  const handleDeleteMessage = (messageId) => {
    if (!userId || !connected) return;
    deleteMessage(messageId);
  };

  const handleUpdateMessage = (messageId, newContent) => {
    if (!userId || !connected) return;
    updateMessage(messageId, newContent);
  };

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
    <div className="flex flex-col h-full">
      {/* En-tête du chat */}
      <div className="flex items-center p-4 border-b border-gray-200 text-black">
        <div className="font-semibold text-lg"># {channel?.name}</div>
        <div className="ml-2 text-sm text-gray-500">{channel?.emoji}</div>
        <div className="ml-auto flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              connected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-xs text-gray-500">
            {connected ? "Connecté" : "Déconnecté"}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-center">Aucun message pour le moment.</p>
            <p className="text-center mt-2">
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
      <ChatInput
        onSendMessage={handleSendMessage}
        isDisabled={!connected || !userId}
      />
    </div>
  );
}
