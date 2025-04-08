"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="w-full bg-white pt-16 pb-20">
      <div className="container mx-auto px-4 text-center">
        {/* Texte principal */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
          Simplifiez votre travail avec OneDesk
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Collaborez. Créez. Organisez. Tout dans une plateforme alimentée par
          l'IA.
        </p>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
          <Link
            href="#"
            className="px-6 py-3 bg-black text-white rounded-md font-medium hover:bg-gray-900 transition-colors text-center text-lg"
          >
            Commencer l'essai gratuit
          </Link>
          <Link
            href="#"
            className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-md font-medium hover:bg-gray-50 transition-colors text-center text-lg"
          >
            Demander une démo
          </Link>
        </div>
      </div>

      {/* Illustration / Aperçu du produit */}
      <div className="container mx-auto px-4 mt-16">
        <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <Image
            src="/1desk-title.svg"
            alt="Notion-like Dashboard"
            width={1200}
            height={700}
            className="w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
