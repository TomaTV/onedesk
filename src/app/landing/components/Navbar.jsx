"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 bg-white ${
        scrolled ? "border-b border-gray-200 py-2" : "py-4"
      }`}
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/landing" className="flex items-center space-x-2">
              <Image
                src="/1desk.svg"
                alt="OneDesk"
                width={30}
                height={30}
                className="object-contain"
              />
              <Image
                src="/1desk-title.svg"
                alt="OneDesk"
                width={120}
                height={25}
                className="hidden sm:block object-contain"
              />
            </Link>
          </div>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/landing#features"
              className="text-gray-800 hover:text-gray-900 font-medium transition-colors"
            >
              Fonctionnalités
            </Link>
            <Link
              href="/landing#pricing"
              className="text-gray-800 hover:text-gray-900 font-medium transition-colors"
            >
              Tarifs
            </Link>
            <Link
              href="/landing#testimonials"
              className="text-gray-800 hover:text-gray-900 font-medium transition-colors"
            >
              Témoignages
            </Link>
            <Link
              href="/landing#contact"
              className="text-gray-800 hover:text-gray-900 font-medium transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Boutons d'action */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/auth/signin"
              className="px-3 py-1 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Se connecter
            </Link>
            <Link
              href="/auth/signin"
              className="px-3 py-1 bg-gray-900 text-white rounded-md font-medium hover:bg-gray-800 transition-colors"
            >
              Essai gratuit
            </Link>
          </div>

          {/* Bouton menu mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white py-4 px-2 mt-2 rounded-md border border-gray-200">
            <div className="flex flex-col space-y-3">
              <Link
                href="/landing#features"
                className="text-gray-800 hover:text-gray-900 font-medium px-2 py-1 transition-colors"
              >
                Fonctionnalités
              </Link>
              <Link
                href="/landing#pricing"
                className="text-gray-800 hover:text-gray-900 font-medium px-2 py-1 transition-colors"
              >
                Tarifs
              </Link>
              <Link
                href="/landing#testimonials"
                className="text-gray-800 hover:text-gray-900 font-medium px-2 py-1 transition-colors"
              >
                Témoignages
              </Link>
              <Link
                href="/landing#contact"
                className="text-gray-800 hover:text-gray-900 font-medium px-2 py-1 transition-colors"
              >
                Contact
              </Link>
              <hr className="border-gray-200" />
              <div className="flex flex-col space-y-2">
                <Link
                  href="/auth/signin"
                  className="px-3 py-1 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Se connecter
                </Link>
                <Link
                  href="/auth/signin"
                  className="px-3 py-1 bg-gray-900 text-white rounded-md font-medium hover:bg-gray-800 transition-colors text-center"
                >
                  Essai gratuit
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
