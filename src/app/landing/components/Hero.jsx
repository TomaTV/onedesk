"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

const RotatingWord = () => {
  const words = [
    "Collaborer",
    "Organiser",
    "Simplifier",
    "Innover",
    "Performer",
  ];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setIsVisible(false);
      // After fade out, change word and fade in
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
        setIsVisible(true);
      }, 500); // This should match the transition duration
    }, 3000); // Word changes every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative inline-block h-full">
      <span
        className={`absolute inset-0 block transition-all duration-500 ease-in-out text-primary-600 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }`}
      >
        {words[currentWordIndex]}
      </span>
    </span>
  );
};

const Hero = () => {
  return (
    <section className="w-full bg-white pt-24 pb-20">
      <div className="container mx-auto px-4 text-center max-w-4xl">
        {/* Texte principal avec mot dynamique */}
        <div className="mb-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight space-y-2">
            <div>Votre solution pour</div>
            <div className="h-[1.2em] overflow-hidden">
              <RotatingWord />
            </div>
            <div>votre équipe</div>
          </h1>
        </div>

        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Une plateforme tout-en-un conçue pour booster la productivité et la
          collaboration de votre équipe.
        </p>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <Link
            href="/signup"
            className="px-6 py-3 bg-black text-white rounded-md font-semibold hover:bg-gray-900 transition-colors text-center text-lg shadow-md hover:shadow-lg"
          >
            Commencer l'essai gratuit
          </Link>
          <Link
            href="/demo"
            className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-md font-semibold hover:bg-gray-50 transition-colors text-center text-lg shadow-sm hover:shadow-md"
          >
            Demander une démo
          </Link>
        </div>

        {/* Vidéo de présentation */}
        <div className="relative max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl">
          <video
            src="/bg.webm"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto object-cover"
            poster="/video-placeholder.jpg"
          >
            Votre navigateur ne supporte pas la vidéo.
          </video>
        </div>
      </div>
    </section>
  );
};

export default Hero;
