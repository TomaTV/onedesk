"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const WorkspaceModal = ({ workspace, isOpen, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("from-blue-500 to-blue-600");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Liste des couleurs disponibles
  const colorOptions = [
    { value: "from-blue-500 to-blue-600", label: "Bleu" },
    { value: "from-purple-500 to-purple-600", label: "Violet" },
    { value: "from-green-500 to-green-600", label: "Vert" },
    { value: "from-red-500 to-red-600", label: "Rouge" },
    { value: "from-yellow-500 to-yellow-600", label: "Jaune" },
    { value: "from-indigo-500 to-indigo-600", label: "Indigo" },
    { value: "from-pink-500 to-pink-600", label: "Rose" },
    { value: "from-teal-500 to-teal-600", label: "Turquoise" },
  ];

  // Initialiser les champs si on modifie un workspace existant
  useEffect(() => {
    if (workspace) {
      setName(workspace.name || "");
      setColor(workspace.color || "from-blue-500 to-blue-600");
    } else {
      setName("");
      setColor("from-blue-500 to-blue-600");
    }
  }, [workspace, isOpen]);

  // Valider le formulaire et envoyer les données
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation de base
    if (!name.trim()) {
      setError("Le nom est requis");
      return;
    }

    // Déterminer la lettre à partir du nom
    const letter = name.charAt(0).toUpperCase();

    try {
      setIsSubmitting(true);

      await onSave({
        ...workspace,
        name,
        letter,
        color,
      });

      onClose();
    } catch (err) {
      console.error("Error saving workspace:", err);
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
            {workspace ? "Modifier l'espace" : "Nouvel espace"}
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
              className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Nom de l'espace"
              required
            />
            <p className="text-xs text-gray-600 mt-1">
              La première lettre sera utilisée comme icône par défaut
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Couleur
            </label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => setColor(option.value)}
                  className={`${
                    color === option.value
                      ? "ring-2 ring-offset-2 ring-indigo-500"
                      : "hover:opacity-80"
                  } cursor-pointer rounded-md overflow-hidden h-8 transition-all`}
                >
                  <div
                    className={`w-full h-full bg-gradient-to-br ${option.value}`}
                  ></div>
                </div>
              ))}
            </div>
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

export default WorkspaceModal;
