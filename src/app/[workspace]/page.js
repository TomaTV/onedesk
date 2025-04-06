"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import Sidebar from "@/components/sidebar/Sidebar";

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

  // Forcer un rechargement si le workspace change
  useEffect(() => {
    if (workspaceName && lastWorkspaceRef.current && 
        workspaceName !== lastWorkspaceRef.current && 
        status === "authenticated") {
      console.log(`Changement de workspace: ${lastWorkspaceRef.current} -> ${workspaceName}`);
      window.location.reload();
    }
    
    lastWorkspaceRef.current = workspaceName;
  }, [workspaceName, status]);

  // Rediriger vers la page de login si non authentifié
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
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
            headers: { 'Cache-Control': 'no-cache' }
          });
          
          if (!workspacesResponse.ok) {
            throw new Error("Échec du chargement des workspaces");
          }

          const workspacesData = await workspacesResponse.json();
          
          // Trouver le workspace par son nom (insensible à la casse)
          const matchedWorkspace = workspacesData.find(
            (w) => w.name.toLowerCase() === decodedWorkspace.toLowerCase()
          );

          if (!matchedWorkspace) {
            throw new Error("Workspace non trouvé");
          }

          setWorkspace(matchedWorkspace);

          // Récupérer les channels de ce workspace
          console.log("Chargement channels de:", matchedWorkspace.name);
          const channelsResponse = await fetch(
            `/api/workspaces/${encodeURIComponent(matchedWorkspace.name)}/channels`,
            {
              cache: "no-store",
              headers: { 
                "Cache-Control": "no-cache",
                "Pragma": "no-cache"
              },
            }
          );

          if (!channelsResponse.ok) {
            throw new Error("Erreur de chargement des channels");
          }

          const channelsData = await channelsResponse.json();
          console.log(`${channelsData.length} channels trouvés`);
          setChannels(channelsData);

          // Si des channels existent et qu'on n'a pas encore redirigé, aller vers le premier
          if (channelsData.length > 0 && !hasRedirectedRef.current) {
            console.log("Redirection vers le premier channel:", channelsData[0].name);
            hasRedirectedRef.current = true;

            // Navigation simple avec rechargement complet
            const url = `/${encodeURIComponent(matchedWorkspace.name)}/${encodeURIComponent(channelsData[0].name)}`;
            window.location.href = url;
          }

          setError(null);
        } catch (err) {
          console.error("Error fetching workspace data:", err);
          setError("Could not load workspace: " + err.message);
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
        <div className="flex-1 p-8 flex items-center justify-center bg-white">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Erreur</h2>
            <p className="text-red-500">{error}</p>
            <button
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              onClick={() => router.push("/")}
            >
              Retour à l'accueil
            </button>
          </div>
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