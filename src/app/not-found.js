"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-lg w-full text-center">
        <div className="mb-6">
          <div className="mx-auto w-24 h-24 relative mb-4">
            <Image
              src="/1desk.svg"
              alt="OneDesk Logo"
              fill
              className="text-indigo-600"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">404</h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Page non trouvée
          </h2>
          <p className="text-gray-600 mb-8">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Retour
          </button>

          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Home size={16} className="mr-2" />
            Accueil
          </button>
        </div>
      </div>
    </div>
  );
}
