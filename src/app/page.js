"use client";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/sidebar/Sidebar";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session) {
      // Si l'utilisateur est authentifié, vérifier ses workspaces
      const fetchWorkspaces = async () => {
        try {
          const response = await fetch("/api/workspaces", { cache: 'no-store' });
          if (!response.ok) {
            throw new Error("Failed to fetch workspaces");
          }

          const workspaces = await response.json();
          if (workspaces.length > 0) {
            // S'il a des workspaces, récupérer les channels du premier workspace
            const workspace = workspaces[0];
            const channelsResponse = await fetch(
              `/api/workspaces/${encodeURIComponent(workspace.name)}/channels`,
              { cache: 'no-store' }
            );

            if (channelsResponse.ok) {
              const channels = await channelsResponse.json();

              if (channels.length > 0) {
                // Rediriger vers le premier channel du premier workspace
                router.push(
                  `/${encodeURIComponent(workspace.name)}/${encodeURIComponent(
                    channels[0].name
                  )}`
                );
              } else {
                // Rediriger vers la page du workspace s'il n'y a pas de channels
                router.push(`/${encodeURIComponent(workspace.name)}`);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching workspace data:", error);
        }
      };

      fetchWorkspaces();
    }
  }, [status, router, session]);

  // Afficher un indicateur de chargement pendant que le statut de la session est vérifié
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // Afficher la page principale une fois l'utilisateur authentifié
  if (status === "authenticated") {
    return (
      <div className="flex min-h-screen">
        {/* Intégration de la sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 p-8 pb-20 flex items-center justify-center bg-white text-gray-800">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">
              Bienvenue, {session.user.name}
            </h1>
            <p className="text-gray-600 mb-4">{session.user.email}</p>
          </div>
        </div>
      </div>
    );
  }

  // Retourner null par défaut pour éviter un flash de contenu non authentifié
  return null;
}
