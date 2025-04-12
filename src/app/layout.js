import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/auth/AuthProvider";
import ErrorBoundary from "@/components/ErrorBoundary";

// Initialiser le dossier d'uploads pour les images (serveur uniquement)
import { initUploadsDirectory } from "@/lib/utils/initUploads";

// Initialisation du dossier d'uploads côté serveur
if (typeof window === 'undefined') {
  initUploadsDirectory();
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "OneDesk - Votre espace de travail collaboratif",
  description:
    "Plateforme de collaboration et de gestion de projet tout-en-un. OneDesk réunit communication en temps réel, organisation des documents et gestion de projet.",
  keywords: "collaboration, plateforme, projet, équipe, chat, documents",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
