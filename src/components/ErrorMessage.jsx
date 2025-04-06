"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";

/**
 * Composant qui affiche un message d'erreur avec une option pour retourner en arrière
 * 
 * @param {Object} props - Propriétés du composant
 * @param {string} props.title - Titre de l'erreur
 * @param {string} props.message - Message d'erreur détaillé
 * @param {boolean} props.showBackButton - Afficher le bouton retour (défaut: true)
 * @param {string} props.backButtonText - Texte du bouton retour (défaut: "Retour")
 * @param {string} props.backUrl - URL de retour (défaut: navigation en arrière)
 */
const ErrorMessage = ({ 
  title = "Erreur", 
  message = "Une erreur s'est produite.", 
  showBackButton = true,
  backButtonText = "Retour",
  backUrl = null
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle size={48} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        
        {showBackButton && (
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            {backButtonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
