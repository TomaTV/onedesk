"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import Sidebar from "@/components/sidebar/Sidebar";
import ErrorMessage from "@/components/ErrorMessage";
import ChannelChat from "@/components/chat/ChannelChat";
import dynamic from "next/dynamic";

// Importer dynamiquement le composant de chat pour éviter les erreurs de socket.io côté serveur
const DynamicChannelChat = dynamic(
  () => import("@/components/chat/ChannelChat"),
  {
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Chargement du chat...</span>
      </div>
    ),
    ssr: false, // Désactiver le SSR pour ce composant
  }
);

export default function ChannelPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();

  const workspaceName = params?.workspace;
  const channelName = params?.channel;

  const [workspace, setWorkspace] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Garder en mémoire la liste des channels pour le workspace actuel
  const [channels, setChannels] = useState([]);

  // Variables pour contrôler les requêtes API
  const [lastLoadedWorkspace, setLastLoadedWorkspace] = useState(null);
  const isLoadingRef = useRef(false);
  const isInitialLoad = useRef(true);
  const preventMultipleRequests = useRef(false);
  const lastLoadTimestamp = useRef(0);

  // Écouter les événements de changement de channel de la Sidebar
  useEffect(() => {
    const handleChannelChange = (event) => {
      const { channelId, channelName, channel: channelData } = event.detail;

      console.log(
        "Page channel a reçu un événement de changement:",
        channelName
      );

      // Mise à jour directe du channel dans l'interface
      if (channelData) {
        setChannel(channelData);
      }
    };

    // Écouter l'événement custom envoyé par la Sidebar
    window.addEventListener("oneskChannelChanged", handleChannelChange);

    return () => {
      window.removeEventListener("oneskChannelChanged", handleChannelChange);
    };
  }, []);

  // Redirection si pas authentifié
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
    
    // Réinitialiser l'indicateur de redirection lorsque la page est démontée
    return () => {
      isInitialLoad.current = true;
    };
  }, [status, router]);

  // Forcer un rechargement complet lorsque l'URL change
  useEffect(() => {
    const handleUrlChange = () => {
      // Vérifier si les paramètres correspondent à l'URL actuelle
      const urlPath = window.location.pathname;
      const expectedPath = `/${workspaceName}/${channelName}`;

      if (urlPath !== expectedPath) {
        console.log("Détection de changement d'URL, rechargement forcé");
        window.location.reload();
      }
    };

    // Écouter les changements d'URL
    window.addEventListener("popstate", handleUrlChange);
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, [workspaceName, channelName]);

  // Suivre les changements d'URL après le rendu initial
  useEffect(() => {
    // Forcer un rechargement si l'URL ne correspond pas aux paramètres actuels
    if (status === "authenticated" && workspaceName && channelName) {
      // Vérifier si c'est le chargement initial (dans ce cas, ne pas recharger)
      if (lastLoadedWorkspace && 
          lastLoadedWorkspace !== workspaceName && 
          !isInitialLoad.current) {
        console.log("Changement de workspace détecté, rechargement...");
        window.location.reload();
      }
    }
  }, [workspaceName, channelName, lastLoadedWorkspace, status]);

  // Charger les données du workspace et du channel
  useEffect(() => {
    if (status !== "authenticated" || !workspaceName || !channelName) {
      return;
    }

    const fetchData = async () => {
      // Éviter les requêtes multiples
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;

      try {
        setLoading(true);

        // Récupérer les workspaces
        const workspacesRes = await fetch("/api/workspaces", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });

        if (!workspacesRes.ok) {
          setError("Impossible de récupérer les espaces de travail");
          return;
        }

        const workspacesData = await workspacesRes.json();

        // Trouver le workspace correspondant
        const decodedWorkspace = decodeURIComponent(workspaceName);
        const matchedWorkspace = workspacesData.find(
          (w) => w.name.toLowerCase() === decodedWorkspace.toLowerCase()
        );

        if (!matchedWorkspace) {
          setError(
            `L'espace de travail "${decodedWorkspace}" n'existe pas ou vous n'y avez pas accès.`
          );
          return;
        }

        // Mettre à jour l'état du workspace
        setWorkspace(matchedWorkspace);
        setLastLoadedWorkspace(decodedWorkspace);

        // Charger les channels
        const channelsRes = await fetch(
          `/api/workspaces/${encodeURIComponent(
            matchedWorkspace.name
          )}/channels`,
          {
            cache: "no-store",
            headers: { "Cache-Control": "no-cache" },
          }
        );

        if (!channelsRes.ok) {
          setError("Impossible de récupérer les canaux de cet espace.");
          return;
        }

        const channelsData = await channelsRes.json();
        setChannels(channelsData);

        // Trouver le channel correspondant
        const decodedChannel = decodeURIComponent(channelName);
        const matchedChannel = channelsData.find(
          (c) => c.name.toLowerCase() === decodedChannel.toLowerCase()
        );

        if (!matchedChannel) {
          setError(
            `Le canal "${decodedChannel}" n'existe pas ou vous n'y avez pas accès.`
          );
          return;
        }

        setChannel(matchedChannel);
        // Marquer le chargement initial comme terminé
        isInitialLoad.current = false;
      } catch (err) {
        console.warn(
          "Avertissement lors du chargement des données:",
          err.message
        );
        // N'utiliser setError que si l'erreur n'a pas déjà été définie dans le code ci-dessus
        if (!error) {
          setError("Impossible de charger les données de ce canal.");
        }
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    };

    fetchData();
  }, [workspaceName, channelName, status]);

  // Loading
  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar
          activeWorkspaceId={workspace?.id}
          activeChannelId={channel?.id}
        />
        <div className="flex-1 flex items-center justify-center bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  // Erreur
  if (error) {
    return (
      <div className="flex min-h-screen">
        <Sidebar
          activeWorkspaceId={workspace?.id}
          activeChannelId={channel?.id}
        />
        <div className="flex-1 bg-white">
          <ErrorMessage
            title="Channel non trouvé"
            message={
              error ||
              "Le canal demandé n'existe pas ou vous n'y avez pas accès."
            }
            backButtonText={
              workspace ? "Retour au workspace" : "Retour à l'accueil"
            }
            backUrl={workspace ? `/${encodeURIComponent(workspace.name)}` : "/"}
          />
        </div>
      </div>
    );
  }

  // Affichage principal
  return (
    <div className="flex min-h-screen">
      <Sidebar
        activeWorkspaceId={workspace?.id}
        activeChannelId={channel?.id}
      />

      <div className="flex-1 flex flex-col h-screen bg-white">
        {/* Afficher différents types de contenu selon le type de channel */}
        {channel?.type === "discussion" ? (
          <DynamicChannelChat channel={channel} workspace={workspace} />
        ) : channel?.type === "tableau" ? (
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl font-bold mb-4 text-black">
                Tableau: {channel?.name || "Chargement..."}
              </h1>
              <p className="text-gray-600 mb-6">
                Espace de travail dans <strong>{workspace?.name || ""}</strong>
              </p>
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-center text-gray-500">
                  Fonctionnalité de tableau à venir dans une future mise à jour.
                </p>
              </div>
            </div>
          </div>
        ) : channel?.type === "projet" ? (
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl font-bold mb-4 text-black">
                Projet: {channel?.name || "Chargement..."}
              </h1>
              <p className="text-gray-600 mb-6">
                Espace de travail dans <strong>{workspace?.name || ""}</strong>
              </p>
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-center text-gray-500">
                  Fonctionnalité de gestion de projet à venir dans une future mise à jour.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl font-bold mb-4 text-black">
                {channel?.name || "Chargement..."}
              </h1>
              <p className="text-gray-600 mb-6">
                Espace de travail dans <strong>{workspace?.name || ""}</strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
