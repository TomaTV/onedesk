"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function SignIn() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError("");

      await signIn("google", {
        callbackUrl: "/",
        prompt: "consent select_account",
      });
    } catch (err) {
      console.error("Sign in error:", err);
      setError("Une erreur est survenue lors de la connexion");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gray-50 opacity-50 pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 z-10 relative">
        <div className="flex justify-center">
          <Image
            src="/1desk-title.svg"
            alt="OneDesk"
            width={480}
            height={48}
            className="max-w-full h-auto"
          />
        </div>

        {/* Error message with improved styling */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-md shadow-sm animate-pulse">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 
                border border-transparent 
                text-sm font-medium rounded-lg 
                text-gray-700 bg-white 
                hover:bg-gray-50 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                shadow-md hover:shadow-lg 
                transition-all duration-300"
            >
              <span className="flex items-center">
                {isLoading ? (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <Image
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google Logo"
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                )}
                Se connecter avec Google
              </span>
            </button>
          </div>

          {/* Subtle note with reduced opacity */}
          <div className="mt-4 text-center text-sm">
            <p className="text-gray-500/60 italic">
              (Uniquement pour les étudiants Web School Factory)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
