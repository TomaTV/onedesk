"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const errorParam = searchParams.get("error");
    
    if (errorParam === "AccessDenied") {
      setError("Vous devez utiliser une adresse email @etu-webschoolfactory.fr pour vous connecter");
    } else if (errorParam === "Configuration") {
      setError("Il y a un problème de configuration avec le serveur d'authentification");
    } else if (errorParam === "OAuthSignin" || errorParam === "OAuthCallback") {
      setError("Un problème est survenu avec la connexion Google");
    } else {
      setError("Une erreur est survenue lors de la tentative de connexion");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Image 
              src="/1desk.svg" 
              alt="OneDesk" 
              width={48} 
              height={48}
              className="mb-2"
            />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Erreur d'authentification
          </h2>
          <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Link
              href="/auth/signin"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Retour à la page de connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
