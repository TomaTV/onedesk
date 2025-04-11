"use client";

import { useState, useRef } from "react";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import { fr } from "date-fns/locale";
import { MoreVertical, Trash2, Edit, Check, X } from "lucide-react";

export default function ChatMessage({
  message,
  currentUserId,
  onDelete,
  onUpdate,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const menuRef = useRef(null);
  const textareaRef = useRef(null);
  
  // Vérifier si c'est le message de l'utilisateur actuel
  const isOwnMessage = currentUserId === message.user_id;
  
  // Formater la date de création
  const messageDate = new Date(message.created_at);
  const formattedDate = isToday(messageDate)
    ? format(messageDate, "HH:mm")
    : format(messageDate, "dd/MM/yyyy HH:mm");
  
  // Ouvrir/fermer le menu
  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };
  
  // Démarrer l'édition du message
  const startEditing = (e) => {
    e.stopPropagation();
    setIsEditing(true);
    setIsMenuOpen(false);
    
    // Focus sur le textarea après le rendu
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          textareaRef.current.value.length,
          textareaRef.current.value.length
        );
      }
    }, 10);
  };
  
  // Annuler l'édition
  const cancelEditing = () => {
    setIsEditing(false);
    setEditedContent(message.content);
  };
  
  // Sauvegarder les modifications
  const saveEditing = () => {
    if (editedContent.trim() !== "") {
      onUpdate(message.id, editedContent);
      setIsEditing(false);
    }
  };
  
  // Gérer la touche Entrée pour sauvegarder
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveEditing();
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };
  
  // Supprimer le message
  const handleDelete = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) {
      onDelete(message.id);
    }
  };
  
  // Ajuster automatiquement la hauteur du textarea
  const adjustTextareaHeight = (e) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  };
  
  return (
    <div
      className={`group p-2 hover:bg-gray-50 rounded-lg transition-colors ${
        isOwnMessage ? "ml-auto" : ""
      }`}
    >
      <div className="flex items-start gap-3 max-w-[80%]">
        {/* Avatar */}
        {message.user_avatar ? (
          <img
            src={message.user_avatar}
            alt={message.user_name}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {message.user_name?.charAt(0).toUpperCase() || "?"}
            </span>
          </div>
        )}
        
        {/* Contenu du message */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{message.user_name}</span>
            <span className="text-xs text-gray-500">{formattedDate}</span>
            
            {/* Menu d'actions (visible seulement pour ses propres messages) */}
            {isOwnMessage && !isEditing && (
              <div className="relative ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={toggleMenu}
                  className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                >
                  <MoreVertical size={16} />
                </button>
                
                {isMenuOpen && (
                  <div
                    ref={menuRef}
                    className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-md py-1 z-10 w-32"
                  >
                    <button
                      onClick={startEditing}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Edit size={14} />
                      <span>Modifier</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <Trash2 size={14} />
                      <span>Supprimer</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Mode édition */}
          {isEditing ? (
            <div className="mt-1">
              <textarea
                ref={textareaRef}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                onKeyDown={handleKeyDown}
                onInput={adjustTextareaHeight}
                className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                rows={1}
              />
              <div className="flex justify-end gap-2 mt-1">
                <button
                  onClick={cancelEditing}
                  className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                >
                  <X size={16} />
                </button>
                <button
                  onClick={saveEditing}
                  className="p-1 text-green-500 hover:text-green-700 rounded-full hover:bg-gray-100"
                >
                  <Check size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-1 text-gray-800 whitespace-pre-wrap break-words">
              {message.content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
