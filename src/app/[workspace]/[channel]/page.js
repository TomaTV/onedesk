"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import Sidebar from "@/components/sidebar/Sidebar";

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
      
      console.log("Page channel a reçu un événement de changement:", channelName);
      
      // Mise à jour directe du channel dans l'interface
      if (channelData) {
        setChannel(channelData);
      }
    };
    
    // Écouter l'événement custom envoyé par la Sidebar
    window.addEventListener('oneskChannelChanged', handleChannelChange);
    
    return () => {
      window.removeEventListener('oneskChannelChanged', handleChannelChange);
    };
  }, []);

  // Redirection si pas authentifié
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
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
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [workspaceName, channelName]);
  
  // Suivre les changements d'URL après le rendu initial
  useEffect(() => {
    // Forcer un rechargement si l'URL ne correspond pas aux paramètres actuels
    if (status === "authenticated" && workspaceName && channelName) {
      if (lastLoadedWorkspace && lastLoadedWorkspace !== workspaceName) {
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
          headers: {'Cache-Control': 'no-cache'}
        });
        
        if (!workspacesRes.ok) throw new Error("Échec chargement des workspaces");
        const workspacesData = await workspacesRes.json();
        
        // Trouver le workspace correspondant
        const decodedWorkspace = decodeURIComponent(workspaceName);
        const matchedWorkspace = workspacesData.find(
          w => w.name.toLowerCase() === decodedWorkspace.toLowerCase()
        );
        
        if (!matchedWorkspace) throw new Error("Workspace non trouvé");
        
        // Mettre à jour l'état du workspace
        setWorkspace(matchedWorkspace);
        setLastLoadedWorkspace(decodedWorkspace);
        
        // Charger les channels
        const channelsRes = await fetch(
          `/api/workspaces/${encodeURIComponent(matchedWorkspace.name)}/channels`,
          {
            cache: "no-store",
            headers: {'Cache-Control': 'no-cache'}
          }
        );
        
        if (!channelsRes.ok) throw new Error("Échec chargement des channels");
        
        const channelsData = await channelsRes.json();
        setChannels(channelsData);
        
        // Trouver le channel correspondant
        const decodedChannel = decodeURIComponent(channelName);
        const matchedChannel = channelsData.find(
          c => c.name.toLowerCase() === decodedChannel.toLowerCase()
        );
        
        if (!matchedChannel) throw new Error("Channel non trouvé");
        
        setChannel(matchedChannel);
        isInitialLoad.current = false;
      } catch (err) {
        console.error("Erreur:", err);
        setError(err.message);
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

  // Affichage principal
  return (
    <div className="flex min-h-screen">
      <Sidebar
        activeWorkspaceId={workspace?.id}
        activeChannelId={channel?.id}
      />

      <div className="flex-1 p-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-black">
            {channel?.name || 'Chargement...'}
          </h1>
          <p className="text-gray-600 mb-6">
            {channel?.emoji && <span className="mr-2">{channel.emoji}</span>}
            Espace de travail dans <strong>{workspace?.name || ''}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}