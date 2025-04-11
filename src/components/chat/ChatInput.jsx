"use client";

import { useState, useRef, useEffect } from "react";
import { Send, PaperclipIcon } from "lucide-react";

export default function ChatInput({ onSendMessage, isDisabled }) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);

  // Gérer l'envoi du message
  const handleSendMessage = () => {
    if (message.trim() !== "" && !isDisabled) {
      onSendMessage(message);
      setMessage("");
      
      // Réinitialiser la hauteur du textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  // Gérer la touche Entrée pour envoyer le message
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Ajuster automatiquement la hauteur du textarea
  const adjustTextareaHeight = (e) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + "px";
  };

  // Focus sur le textarea au montage du composant
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      {isDisabled && (
        <div className="text-center text-xs text-gray-500 mb-2">
          La saisie de message est désactivée
        </div>
      )}
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={adjustTextareaHeight}
            placeholder="Écrivez un message..."
            className="w-full p-3 pr-10 border border-gray-300 rounded-lg resize-none max-h-[150px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            disabled={isDisabled}
            rows={1}
          />
        </div>
        <button
          onClick={handleSendMessage}
          disabled={isDisabled || message.trim() === ""}
          className={`p-3 rounded-full ${
            isDisabled || message.trim() === ""
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          } transition-colors`}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
