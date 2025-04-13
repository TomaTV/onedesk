"use client";

import { useState, useRef } from "react";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import { fr } from "date-fns/locale";
import {
  MoreVertical,
  Trash2,
  Edit,
  Check,
  X,
  Image as ImageIcon,
} from "lucide-react";

// Fonction pour parser le Markdown basique
const renderMarkdown = (text) => {
  if (!text) return "";

  // Remplacement pour le gras: **texte** ou __texte__
  let formattedText = text.replace(
    /\*\*(.*?)\*\*|__(.*?)__/g,
    "<strong>$1$2</strong>"
  );

  // Remplacement pour l'italique: *texte* ou _texte_
  formattedText = formattedText.replace(/\*(.*?)\*|_(.*?)_/g, "<em>$1$2</em>");

  // Remplacement pour le code: `texte`
  formattedText = formattedText.replace(
    /`(.*?)`/g,
    '<code class="bg-gray-100 px-1 py-0.5 rounded text-red-600">$1</code>'
  );

  // Remplacement pour les liens: [texte](url)
  formattedText = formattedText.replace(
    /\[(.*?)\]\((.*?)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>'
  );

  // Remplacement pour le barré: ~~texte~~
  formattedText = formattedText.replace(/~~(.*?)~~/g, "<del>$1</del>");

  // Remplacement pour les titres: # Texte, ## Texte, ### Texte
  formattedText = formattedText.replace(
    /^# (.*$)/gm,
    '<h1 class="text-xl font-bold my-1">$1</h1>'
  );
  formattedText = formattedText.replace(
    /^## (.*$)/gm,
    '<h2 class="text-lg font-bold my-1">$1</h2>'
  );
  formattedText = formattedText.replace(
    /^### (.*$)/gm,
    '<h3 class="text-md font-bold my-1">$1</h3>'
  );

  // Remplacement pour les listes: - item, * item
  formattedText = formattedText.replace(
    /^- (.*$)/gm,
    '<li class="ml-5">$1</li>'
  );
  formattedText = formattedText.replace(
    /^\* (.*$)/gm,
    '<li class="ml-5">$1</li>'
  );

  // Remplacement pour les citations: > texte
  formattedText = formattedText.replace(
    /^> (.*$)/gm,
    '<blockquote class="border-l-4 border-gray-300 pl-2 py-1 my-1 text-gray-700">$1</blockquote>'
  );

  // Conversion des sauts de ligne
  formattedText = formattedText.replace(/\n/g, "<br/>");

  return formattedText;
};

export default function ChatMessage({
  message,
  currentUserId,
  onDelete,
  onUpdate,
}) {
  // Vérifie si le message contient une/des image(s)
  const hasImage =
    message.image_url || (message.image_urls && message.image_urls.length > 0);
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
            <span className="font-medium text-gray-900">
              {message.user_name}
            </span>
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
            <div className="mt-1">
              {/* Affichage du contenu avec Markdown */}
              <div
                className="text-gray-800 whitespace-pre-wrap break-words"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(message.content),
                }}
              />

              {/* Affichage de l'image si présente */}
              {message.image_url && (
                <div className="mt-2">
                  <img
                    src={message.image_url}
                    alt="Image jointe"
                    className="max-w-xs max-h-60 object-cover rounded-md border border-gray-200 hover:opacity-90 cursor-pointer"
                    onClick={() => window.open(message.image_url, "_blank")}
                  />
                </div>
              )}

              {/* Affichage des images multiples si présentes */}
              {message.image_urls && message.image_urls.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {message.image_urls.map((imgUrl, index) => (
                    <div
                      key={index}
                      className="relative w-36 h-36 overflow-hidden"
                    >
                      <img
                        src={imgUrl}
                        alt={`Image jointe ${index + 1}`}
                        className="absolute inset-0 w-full h-full object-cover rounded-md border border-gray-200 hover:opacity-90 cursor-pointer"
                        onClick={() => window.open(imgUrl, "_blank")}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
