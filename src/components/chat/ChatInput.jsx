"use client";

import { useState, useRef, useEffect } from "react";
import { Send, PlusCircle, Smile, X, Image } from "lucide-react";
import EmojiPicker from "../EmojiPicker";

export default function ChatInput({ onSendMessage, isDisabled }) {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji);
    if (textareaRef.current) {
      adjustTextareaHeight({ target: textareaRef.current });
      textareaRef.current.focus();
    }
    setShowEmojiPicker(false);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const remainingSlots = 5 - uploadedImages.length;
    if (remainingSlots <= 0) {
      alert("Vous ne pouvez pas ajouter plus de 5 images par message.");
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    const validFiles = [];
    const validPreviews = [];

    filesToProcess.forEach((file) => {
      if (file && file.type.startsWith("image/")) {
        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
          alert(
            `L'image ${file.name} est trop volumineuse. Taille maximale autorisée: 5 Mo`
          );
          return;
        }

        validFiles.push(file);
        const reader = new FileReader();
        reader.onload = (event) => {
          validPreviews.push({
            file: file,
            preview: event.target.result,
          });

          if (validPreviews.length === validFiles.length) {
            setUploadedImages((prev) => [...prev, ...validFiles]);
            setImagePreview((prev) => [...prev, ...validPreviews]);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeUploadedImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  const removeAllUploadedImages = () => {
    setUploadedImages([]);
    setImagePreview([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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

  const handleSendMessage = () => {
    if ((message.trim() !== "" || uploadedImages.length > 0) && !isDisabled) {
      onSendMessage(message, uploadedImages);
      setMessage("");
      setUploadedImages([]);
      setImagePreview([]);

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const adjustTextareaHeight = (e) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + "px";
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <div className="border-t border-gray-200 p-4 bg-white/95 shadow-sm">
      {isDisabled && (
        <div className="text-center text-xs font-medium text-gray-500 mb-3 py-2 bg-gray-100 rounded-lg animate-pulse">
          La saisie de message est désactivée
        </div>
      )}

      {imagePreview.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-3">
          {imagePreview.map((img, index) => (
            <div key={index} className="relative group">
              <img
                src={img.preview}
                alt={`Aperçu ${index + 1}`}
                className="h-44 w-auto object-cover rounded-xl border border-gray-200 shadow-md transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-lg"
              />
              <button
                onClick={() => removeUploadedImage(index)}
                className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                aria-label="Supprimer l'image"
              >
                <X
                  size={16}
                  className="text-gray-600 hover:text-red-500 transition-colors"
                />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center space-x-3 w-full justify-center">
        {/* Bouton pour ajouter une image */}
        <label
          className={`cursor-pointer text-gray-400 hover:text-blue-500 transition-all duration-300 hover:scale-110 active:scale-95 ${
            uploadedImages.length >= 5 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <PlusCircle size={24} />
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

        {/* Zone de texte */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={adjustTextareaHeight}
            placeholder="Écrivez un message..."
            className="w-full px-4 py-2.5 pl-8 pr-24 border border-gray-300 rounded-2xl resize-none max-h-[160px] min-h-[52px] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none text-gray-800 shadow-sm transition-all duration-300 hover:shadow-md font-medium placeholder:text-gray-400 text-sm overflow-hidden"
            disabled={isDisabled}
            rows={1}
          />

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-16 right-0 z-20 shadow-xl rounded-xl overflow-hidden animate-fade-in"
            >
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            </div>
          )}
        </div>

        {/* Emoji Picker Button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="text-gray-400 hover:text-yellow-500 transition-all duration-300 hover:scale-110 active:scale-95"
          disabled={isDisabled}
          aria-label="Ajouter un emoji"
        >
          <Smile size={24} />
        </button>

        {/* Bouton d'envoi */}
        <button
          onClick={handleSendMessage}
          disabled={
            isDisabled || (message.trim() === "" && uploadedImages.length === 0)
          }
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
            isDisabled || (message.trim() === "" && uploadedImages.length === 0)
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg active:scale-90"
          } shadow-sm`}
          aria-label="Envoyer le message"
        >
          <Send size={20} />
        </button>
      </div>

      {uploadedImages.length > 0 && (
        <div className="text-xs text-right mt-2 text-gray-500 pr-2">
          {uploadedImages.length}/5 images
        </div>
      )}
    </div>
  );
}
