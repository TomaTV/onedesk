"use client";
import React, { useState, useEffect, useRef } from "react";
import { X, Smile, MessageSquare, Layout, Calendar } from "lucide-react";
import EmojiPicker from "@/components/EmojiPicker";

const ChannelModal = ({ channel, workspaceId, isOpen, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [type, setType] = useState("discussion");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

  // Initialiser les champs si on modifie un channel existant
  useEffect(() => {
    if (channel) {
      setName(channel.name || "");
      setIcon(channel.emoji || "");
      setType(channel.type || "discussion");
    } else {
      setName("");
      setIcon("");
      setType("discussion");
    }
  }, [channel, isOpen]);

  // Fermer le picker d'emoji lorsqu'on clique en dehors
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

  // Sélectionner un emoji du picker
  const handleSelectEmoji = (emoji) => {
    setIcon(emoji);
    setShowEmojiPicker(false);
  };

  // Valider le formulaire et envoyer les données
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation de base
    if (!name.trim()) {
      setError("Le nom est requis");
      return;
    }

    try {
      setIsSubmitting(true);

      // Utiliser le type sélectionné

      await onSave({
        ...channel,
        name,
        type,
        emoji: icon || null,
        workspaceId,
      });

      onClose();
    } catch (err) {
      console.error("Error saving channel:", err);
      setError("Erreur lors de la sauvegarde");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ne pas rendre si le modal n'est pas ouvert
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 mx-4 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {channel
              ? "Modifier l'espace de travail"
              : "Nouvel espace de travail"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-800 mb-1"
            >
              Nom
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
              placeholder="Nom de l'espace de travail"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Type d'espace
            </label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setType("discussion")}
                className={`flex flex-col items-center p-3 rounded-md border ${type === "discussion" ? "border-indigo-500 bg-indigo-50" : "border-gray-300"}`}
              >
                <MessageSquare className={`h-5 w-5 mb-1 ${type === "discussion" ? "text-indigo-600" : "text-gray-500"}`} />
                <span className={`text-sm ${type === "discussion" ? "text-indigo-600 font-medium" : "text-gray-700"}`}>Discussion</span>
              </button>
              
              <button
                type="button"
                onClick={() => setType("tableau")}
                className={`flex flex-col items-center p-3 rounded-md border ${type === "tableau" ? "border-indigo-500 bg-indigo-50" : "border-gray-300"}`}
              >
                <Layout className={`h-5 w-5 mb-1 ${type === "tableau" ? "text-indigo-600" : "text-gray-500"}`} />
                <span className={`text-sm ${type === "tableau" ? "text-indigo-600 font-medium" : "text-gray-700"}`}>Tableau blanc</span>
              </button>
              
              <button
                type="button"
                onClick={() => setType("projet")}
                className={`flex flex-col items-center p-3 rounded-md border ${type === "projet" ? "border-indigo-500 bg-indigo-50" : "border-gray-300"}`}
              >
                <Calendar className={`h-5 w-5 mb-1 ${type === "projet" ? "text-indigo-600" : "text-gray-500"}`} />
                <span className={`text-sm ${type === "projet" ? "text-indigo-600 font-medium" : "text-gray-700"}`}>Projet</span>
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <label
              htmlFor="icon"
              className="block text-sm font-medium text-gray-800 mb-1"
            >
              Icône (optionnel)
            </label>
            <div className="flex items-center mb-2">
              <div className="flex-grow flex space-x-2">
                <input
                  type="text"
                  id="icon"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value.charAt(0))}
                  maxLength={2}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-lg text-black"
                  placeholder="📝"
                />

                <button
                  type="button"
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-100"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Sélecteur d'emoji */}
            {showEmojiPicker && (
              <div className="relative" ref={emojiPickerRef}>
                <div className="absolute z-20 mt-1">
                  <EmojiPicker
                    onSelect={handleSelectEmoji}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                </div>
              </div>
            )}

            <p className="text-xs text-gray-600">
              Ajoutez un emoji pour personnaliser votre espace de travail
            </p>
          </div>

          <div className="flex justify-end">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
              >
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChannelModal;
