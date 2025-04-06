"use client";
import React, { useState, useEffect, useRef } from "react";
import { X, Upload } from "lucide-react";
import Image from "next/image";

const UserProfileModal = ({ user, isOpen, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Initialiser les champs avec les données de l'utilisateur
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setAvatar(user.image || user.avatar || "");
      setAvatarPreview(user.image || user.avatar || "");
    }
  }, [user, isOpen]);

  // Gérer la sélection d'un fichier d'avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);

      // Créer une URL pour la prévisualisation
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fonction pour compresser une image
  const compressImage = (
    file,
    maxWidth = 200,
    maxHeight = 200,
    quality = 0.7
  ) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          // Calculer les dimensions proportionnelles
          let width = img.width;
          let height = img.height;

          // Redimensionnement
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          // Créer un canvas pour la compression
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          // Dessiner l'image sur le canvas
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Convertir en base64 avec une qualité réduite
          const compressedBase64 = canvas.toDataURL("image/jpeg", quality);

          resolve(compressedBase64);
        };

        img.onerror = () => {
          console.error("Erreur de chargement de l'image");
          reject(new Error("Impossible de charger l'image"));
        };
      };

      reader.onerror = () => {
        console.error("Erreur de lecture du fichier");
        reject(new Error("Erreur de lecture du fichier"));
      };
    });
  };

  // Déclencher le sélecteur de fichier
  const triggerFileInput = () => {
    fileInputRef.current.click();
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

    if (!email.trim()) {
      setError("L'email est requis");
      return;
    }

    try {
      setIsSubmitting(true);

      // Traiter d'abord les informations de base (nom, email)
      const baseInfoResult = await onSave({
        name,
        email,
      });

      // Traiter l'avatar séparément si modifié
      if (avatarFile) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Image = reader.result;

          const avatarResponse = await fetch("/api/users/avatar", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              image: base64Image,
            }),
          });

          if (!avatarResponse.ok) {
            console.error("Erreur lors de la mise à jour de l'avatar");
          }
        };

        reader.readAsDataURL(avatarFile);
      }

      // Fermer le modal
      onClose();
    } catch (err) {
      console.error("Error saving user profile:", err);
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
            Modifier mon profil
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
          <div className="mb-4 flex justify-center">
            <div
              className="relative group cursor-pointer"
              onClick={triggerFileInput}
            >
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 relative">
                {avatarPreview ? (
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url("${avatarPreview}")` }}
                    title="Avatar"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                    {name
                      ? name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : "?"}
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload size={24} className="text-white" />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-800 mb-1"
            >
              Nom complet
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Votre nom"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-800 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Votre email"
              required
            />
            <p className="text-xs text-gray-600 mt-1">
              Cet email est utilisé pour vous connecter à l'application
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

export default UserProfileModal;
