"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import Sidebar from "@/components/sidebar/Sidebar";
import ErrorMessage from "@/components/ErrorMessage";

export default function WorkspacePage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const workspaceName = params?.workspace;

  const [workspace, setWorkspace] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Contrôle des requêtes multiples
  const isLoadingRef = useRef(false);
  const hasRedirectedRef = useRef(false);
  const lastWorkspaceRef = useRef(null);
  const isInitialLoad = useRef(true);

  // Forcer un rechargement si le workspace change
  useEffect(() => {
    // Ne recharger que si ce n'est pas le chargement initial et si le workspace a changé
    if (
      workspaceName &&
      lastWorkspaceRef.current &&
      workspaceName !== lastWorkspaceRef.current &&
      status === "authenticated" &&
      !isInitialLoad.current
    ) {
      console.log(
        `Changement de workspace: ${lastWorkspaceRef.current} -> ${workspaceName}`
      );
      window.location.reload();
    }

    lastWorkspaceRef.current = workspaceName;
  }, [workspaceName, status]);

  // Réinitialiser l'indicateur de redirection lorsque la page est démontée
  useEffect(() => {
    return () => {
      hasRedirectedRef.current = false;
      isInitialLoad.current = true;
    };
  }, []);

  // Rediriger vers la page de login si non authentifié
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }

    // Réinitialiser l'indicateur de redirection lorsque la page est démontée
    return () => {
      hasRedirectedRef.current = false;
      isInitialLoad.current = true;
    };
  }, [status, router]);

  // Charger les données du workspace et des channels
  useEffect(() => {
    if (status === "authenticated" && workspaceName) {
      const fetchWorkspaceData = async () => {
        // Éviter les appels multiples
        if (isLoadingRef.current) {
          return;
        }

        isLoadingRef.current = true;
        setLoading(true);

        try {
          console.log("Chargement des données du workspace:", workspaceName);
          const decodedWorkspace = decodeURIComponent(workspaceName);

          // Récupérer tous les workspaces
          const workspacesResponse = await fetch("/api/workspaces", {
            cache: "no-store",
            headers: { "Cache-Control": "no-cache" },
          });

          if (!workspacesResponse.ok) {
            setError("Impossible de récupérer les espaces de travail");
            return;
          }

          const workspacesData = await workspacesResponse.json();

          // Trouver le workspace par son nom (insensible à la casse)
          const matchedWorkspace = workspacesData.find(
            (w) => w.name.toLowerCase() === decodedWorkspace.toLowerCase()
          );

          if (!matchedWorkspace) {
            setError(
              `L'espace de travail "${decodedWorkspace}" n'existe pas ou vous n'y avez pas accès.`
            );
            return;
          }

          setWorkspace(matchedWorkspace);

          // Récupérer les channels de ce workspace
          console.log("Chargement channels de:", matchedWorkspace.name);
          const channelsResponse = await fetch(
            `/api/workspaces/${encodeURIComponent(
              matchedWorkspace.name
            )}/channels`,
            {
              cache: "no-store",
              headers: {
                "Cache-Control": "no-cache",
                Pragma: "no-cache",
              },
            }
          );

          if (!channelsResponse.ok) {
            setError("Impossible de récupérer les canaux de cet espace.");
            return;
          }

          const channelsData = await channelsResponse.json();
          console.log(`${channelsData.length} channels trouvés`);
          setChannels(channelsData);

          // Si des channels existent et qu'on n'a pas encore redirigé, aller vers le premier
          if (
            channelsData.length > 0 &&
            !hasRedirectedRef.current &&
            isInitialLoad.current
          ) {
            console.log(
              "Redirection vers le premier channel:",
              channelsData[0].name
            );
            hasRedirectedRef.current = true;
            isInitialLoad.current = false;

            // Navigation simple avec rechargement complet
            const url = `/${encodeURIComponent(
              matchedWorkspace.name
            )}/${encodeURIComponent(channelsData[0].name)}`;
            window.location.href = url;
          }

          setError(null);
        } catch (err) {
          console.warn(
            "Avertissement lors du chargement des données:",
            err.message
          );
          // N'utiliser setError que si l'erreur n'a pas déjà été définie dans le code ci-dessus
          if (!error) {
            setError("Impossible de charger les données de cet espace.");
          }
        } finally {
          setLoading(false);
          isLoadingRef.current = false;
        }
      };

      fetchWorkspaceData();
    }
  }, [workspaceName, status]);

  // Afficher un chargement pendant la redirection ou vérification de session
  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar activeWorkspaceId={workspace?.id} />
        <div className="flex-1 flex items-center justify-center bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  // Afficher l'erreur
  if (error) {
    return (
      <div className="flex min-h-screen">
        <Sidebar activeWorkspaceId={workspace?.id} />
        <div className="flex-1 bg-white">
          <ErrorMessage
            title="Workspace non trouvé"
            message={
              error ||
              "L'espace demandé n'existe pas ou vous n'y avez pas accès."
            }
            backButtonText="Retour à l'accueil"
            backUrl="/"
          />
        </div>
      </div>
    );
  }

  // Si on arrive ici, c'est qu'on est authentifié mais qu'il n'y a pas de channels
  return (
    <div className="flex min-h-screen">
      <Sidebar activeWorkspaceId={workspace?.id} />
      <div className="flex-1 p-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">{workspace?.name}</h1>
          <p className="text-gray-600 mb-6">
            Cet espace ne contient aucun canal.
          </p>

          <div className="p-8 border border-gray-200 rounded-lg bg-gray-50 text-center">
            <p className="text-gray-700 mb-4">
              Créez votre premier espace de travail en cliquant sur le "+" à
              côté de "ESPACES DE TRAVAIL"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
