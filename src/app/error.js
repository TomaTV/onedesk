"use client";
 
import { useEffect } from "react";
import { ArrowLeft, AlertCircle } from "lucide-react";
 
export default function Error({
  error,
  reset,
}) {
  useEffect(() => {
    // Journalisation de l'erreur côté client
    console.error("Application error:", error);
  }, [error]);
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle size={48} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Une erreur s'est produite
        </h2>
        <p className="text-gray-600 mb-6">
          {error?.message || "Nous sommes désolés, quelque chose s'est mal passé."}
        </p>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Retour
          </button>
          
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    </div>
  );
}
