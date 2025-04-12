"use client";

import { useState, useRef, useEffect } from "react";
import { Send, PaperclipIcon, Smile, X, Image } from "lucide-react";
import EmojiPicker from "../EmojiPicker";

export default function ChatInput({ onSendMessage, isDisabled }) {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Gérer l'ajout d'emoji au message
  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji);
    if (textareaRef.current) {
      // Ajuster la hauteur après ajout d'emoji
      adjustTextareaHeight({ target: textareaRef.current });
      textareaRef.current.focus();
    }
    setShowEmojiPicker(false);
  };

  // Gérer l'upload d'image
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Limiter le nombre total d'images à 5
    const remainingSlots = 5 - uploadedImages.length;
    if (remainingSlots <= 0) {
      alert("Vous ne pouvez pas ajouter plus de 5 images par message.");
      return;
    }

    // Traiter uniquement le nombre d'images que nous pouvons encore ajouter
    const filesToProcess = files.slice(0, remainingSlots);

    // Filtrer et valider chaque fichier
    const validFiles = [];
    const validPreviews = [];

    // Traiter chaque fichier
    filesToProcess.forEach((file) => {
      if (file && file.type.startsWith("image/")) {
        // Vérifier la taille du fichier (limite à 5 Mo)
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo en octets
        if (file.size > MAX_FILE_SIZE) {
          alert(
            `L'image ${file.name} est trop volumineuse. Taille maximale autorisée: 5 Mo`
          );
          return;
        }

        validFiles.push(file);

        // Créer un aperçu pour chaque fichier valide
        const reader = new FileReader();
        reader.onload = (event) => {
          validPreviews.push({
            file: file,
            preview: event.target.result,
          });

          // Une fois que tous les fichiers sont traités, mettre à jour l'état
          if (validPreviews.length === validFiles.length) {
            setUploadedImages((prev) => [...prev, ...validFiles]);
            setImagePreview((prev) => [...prev, ...validPreviews]);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    // Réinitialiser l'input file pour permettre de sélectionner à nouveau les mêmes fichiers
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Supprimer une image téléchargée spécifique
  const removeUploadedImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  // Supprimer toutes les images téléchargées
  const removeAllUploadedImages = () => {
    setUploadedImages([]);
    setImagePreview([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Gérer les clics en dehors du emoji picker pour le fermer
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Gérer l'envoi du message
  const handleSendMessage = () => {
    if ((message.trim() !== "" || uploadedImages.length > 0) && !isDisabled) {
      onSendMessage(message, uploadedImages);
      setMessage("");
      setUploadedImages([]);
      setImagePreview([]);

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

      {/* Prévisualisation des images téléchargées */}
      {imagePreview.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {imagePreview.map((img, index) => (
            <div key={index} className="relative inline-block">
              <img
                src={img.preview}
                alt={`Aperçu ${index + 1}`}
                className="max-h-40 max-w-full rounded-md border border-gray-300"
              />
              <button
                onClick={() => removeUploadedImage(index)}
                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
              >
                <X size={16} className="text-gray-700" />
              </button>
            </div>
          ))}
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
            className="w-full p-3 pl-10 pr-10 border border-gray-300 rounded-lg resize-none max-h-[150px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-black"
            disabled={isDisabled}
            rows={1}
          />

          {/* Bouton emoji picker */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute left-2 bottom-3 text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isDisabled}
          >
            <Smile size={20} />
          </button>

          {/* Bouton upload image */}
          <label className="absolute right-2 bottom-3 cursor-pointer text-gray-500 hover:text-gray-700 transition-colors">
            <Image size={20} />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
              accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
              disabled={isDisabled || uploadedImages.length >= 5}
              multiple
            />
          </label>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div ref={emojiPickerRef} className="absolute bottom-12 left-0">
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            </div>
          )}
        </div>

        <button
          onClick={handleSendMessage}
          disabled={
            isDisabled || (message.trim() === "" && uploadedImages.length === 0)
          }
          className={`p-3 rounded-full ${
            isDisabled || (message.trim() === "" && uploadedImages.length === 0)
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
