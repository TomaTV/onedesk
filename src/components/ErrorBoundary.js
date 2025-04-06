"use client";
 
import { useEffect, useState } from "react";
import ErrorMessage from "./ErrorMessage";

/**
 * Composant qui capture les erreurs et affiche un message d'erreur convivial
 * au lieu de planter l'application
 */
export default function ErrorBoundary({ children }) {
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Gestionnaire d'erreurs globales
    const handleError = (event) => {
      // Empêcher l'erreur d'apparaître dans la console
      event.preventDefault();
      
      // Journaliser l'erreur de façon contrôlée
      console.warn("Erreur capturée par ErrorBoundary:", event.error?.message || "Erreur inconnue");
      
      // Mettre à jour l'état pour afficher le message d'erreur
      setError(event.error);
    };
    
    // Écouter les erreurs non gérées
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", (event) => {
      console.warn("Promesse rejetée non gérée:", event.reason);
    });
    
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleError);
    };
  }, []);
  
  // Afficher le message d'erreur si une erreur a été capturée
  if (error) {
    return (
      <ErrorMessage
        title="Quelque chose s'est mal passé"
        message="Une erreur inattendue s'est produite. Veuillez réessayer ou contacter l'assistance si le problème persiste."
      />
    );
  }
  
  // Afficher le contenu normal si aucune erreur
  return children;
}
