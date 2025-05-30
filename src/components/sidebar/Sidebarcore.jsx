"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import WorkspaceModal from "@/components/modals/WorkspaceModal";
import ChannelModal from "@/components/modals/ChannelModal";
import InviteUserModal from "@/components/modals/InviteUserModal";
import SidebarHeader from "./SidebarHeader";
import ChannelsList from "./ChannelsList";
import UserProfile from "./UserProfile";
import WorkspaceSelector from "./WorkspaceSelector";
import { isWorkspaceAdmin } from "@/lib/services/userService";
import { leaveWorkspace } from "@/lib/services/workspaceService";

const SidebarCore = ({ activeWorkspaceId, activeChannelId }) => {
  // États pour gérer l'UI
  const [workspacesDropdownOpen, setWorkspacesDropdownOpen] = useState(false);
  const [hoveredWorkspace, setHoveredWorkspace] = useState(null);
  const [hoveredChannel, setHoveredChannel] = useState(null);

  // États pour les modals
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [channelModalOpen, setChannelModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [currentChannel, setCurrentChannel] = useState(null);

  // États pour les données et le chargement
  const [workspaces, setWorkspaces] = useState([]);
  const [channels, setChannels] = useState({});
  const [user, setUser] = useState(null);
  const [adminWorkspaces, setAdminWorkspaces] = useState([]);
  const [loading, setLoading] = useState({
    workspaces: true,
    channels: false,
    user: true,
    adminCheck: false,
  });
  const [error, setError] = useState({
    workspaces: null,
    channels: null,
    user: null,
    adminCheck: null,
  });

  // État pour suivre la sélection active
  const [activeWorkspace, setActiveWorkspace] = useState(
    activeWorkspaceId || null
  );
  const [activeChannel, setActiveChannel] = useState({
    workspace: activeWorkspaceId || null,
    channel: activeChannelId || null,
  });

  const router = useRouter();

  // Toggle du dropdown des workspaces
  const toggleWorkspacesDropdown = () => {
    setWorkspacesDropdownOpen(!workspacesDropdownOpen);
  };

  // Fonction pour récupérer les workspaces
  const fetchWorkspaces = async () => {
    try {
      setLoading((prev) => ({ ...prev, workspaces: true }));
      const response = await fetch("/api/workspaces", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch workspaces");
      }

      const data = await response.json();
      setWorkspaces(data);

      // Identifier les workspaces où l'utilisateur est admin
          const adminIds = data
            .filter(workspace => workspace.role === 'admin')
            .map(workspace => workspace.id);
          
          console.log('Workspaces admin identifiés directement:', adminIds);
          setAdminWorkspaces(adminIds);

          // Définir le premier workspace comme actif si aucun n'est sélectionné
      if (data.length > 0 && !activeWorkspace) {
        setActiveWorkspace(data[0].id);
        setActiveChannel((prev) => ({ ...prev, workspace: data[0].id }));
        fetchChannels(data[0].id, data);
      }
    } catch (err) {
      console.error("Error fetching workspaces:", err);
      setError((prev) => ({ ...prev, workspaces: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, workspaces: false }));
    }
  };

  // Obtenir les workspaces de l'utilisateur - une seule fois au chargement
  useEffect(() => {
    fetchWorkspaces();
  }, []);

  // Fonction pour récupérer les channels d'un workspace
  const fetchChannels = async (workspaceId, workspacesData = null) => {
    if (!workspaceId) {
      console.warn("fetchChannels: workspaceId est null ou undefined");
      return Promise.resolve([]);
    }

    try {
      setLoading((prev) => ({ ...prev, channels: true }));
      setError((prev) => ({ ...prev, channels: null })); // Réinitialiser l'erreur au début

      // Utiliser workspacesData si fourni, sinon workspaces
      const wsData = workspacesData || workspaces;
      if (!wsData || wsData.length === 0) {
        console.warn("fetchChannels: workspaces data est vide");
        const fallbackWorkspaces = await (await fetch("/api/workspaces", { cache: "no-store" })).json();
        console.log("Workspaces récupérés en fallback:", fallbackWorkspaces);
        const targetWorkspace = fallbackWorkspaces.find((w) => w.id === workspaceId);
        if (targetWorkspace) {
          return await fetchChannelsWithWorkspace(targetWorkspace, workspaceId);
        }
        throw new Error("Impossible de trouver les données du workspace");
      }

      const workspaceObj = wsData.find((w) => w.id === workspaceId);

      if (!workspaceObj) {
        console.warn(`Workspace avec ID ${workspaceId} introuvable dans la liste:`, wsData);
        throw new Error(`Workspace ${workspaceId} introuvable`);
      }

      if (!workspaceObj.name) {
        console.warn(`Le workspace ${workspaceId} n'a pas de nom:`, workspaceObj);
        throw new Error(`Workspace ${workspaceId} n'a pas de nom`);
      }

      return await fetchChannelsWithWorkspace(workspaceObj, workspaceId);
    } catch (err) {
      console.error(`Erreur channels pour ${workspaceId}:`, err);
      setError((prev) => ({ ...prev, channels: err.message }));
      setLoading((prev) => ({ ...prev, channels: false }));
      // Retourner un tableau vide au lieu de rejeter la promesse
      // pour éviter des erreurs en cascade
      return [];
    }
  };

  // Fonction helper pour récupérer les channels une fois qu'on a un workspace valide
  const fetchChannelsWithWorkspace = async (workspaceObj, workspaceId) => {
    try {
      console.log(`Chargement des channels pour: ${workspaceObj.name} (ID: ${workspaceId})`);

      const cacheBuster = Date.now(); // Ajouter un paramètre pour éviter le cache navigateur
      const response = await fetch(
        `/api/workspaces/${encodeURIComponent(workspaceObj.name)}/channels?t=${cacheBuster}`,
        { 
          cache: "no-store",
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          } 
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur chargement channels pour ${workspaceObj.name}`);
      }

      const data = await response.json();
      console.log(`${data.length} channels récupérés pour ${workspaceObj.name}:`, data);

      // Mise à jour du cache des channels
      setChannels((prev) => ({
        ...prev,
        [workspaceId]: data,
      }));

      setLoading((prev) => ({ ...prev, channels: false }));
      return data;
    } catch (err) {
      console.error(`Erreur fetchChannelsWithWorkspace:`, err);
      throw err; // Propager l'erreur à fetchChannels pour traitement
    }
  };

  // Changer de workspace en allant directement au premier channel sans redirection intermédiaire
  const handleWorkspaceChange = async (workspaceId) => {
    // Ne rien faire si c'est déjà le workspace actif
    if (workspaceId === activeWorkspace) {
      setWorkspacesDropdownOpen(false);
      return;
    }

    try {
      // Fermer le dropdown immédiatement
      setWorkspacesDropdownOpen(false);

      // Trouver le workspace
      const workspaceObj = workspaces.find((w) => w.id === workspaceId);
      if (!workspaceObj) return;

      console.log(`Navigation vers workspace: ${workspaceObj.name}`);

      // Déterminer le premier channel disponible
      let channelsData = channels[workspaceId] || [];

      // Si pas de channels en cache, essayer de les charger
      if (channelsData.length === 0) {
        try {
          channelsData = await fetchChannels(workspaceId, workspaces);
        } catch (err) {
          console.error("Erreur chargement channels:", err);
        }
      }

      // Utiliser le router pour naviguer au lieu de window.location.href
      // pour éviter le double rechargement de la page
      if (channelsData && channelsData.length > 0) {
        const firstChannelName = channelsData[0].name;
        const firstChannelId = channelsData[0].id;

        // Mettre à jour les états locaux
        setActiveWorkspace(workspaceId);
        setActiveChannel({
          workspace: workspaceId,
          channel: firstChannelId,
        });

        // Navigation sans recharger la page avec le router Next.js
        router.push(`/${workspaceObj.name}/${firstChannelName}`);
      } else {
        // Pas de channels, naviguer vers le workspace
        setActiveWorkspace(workspaceId);
        setActiveChannel({
          workspace: workspaceId,
          channel: null,
        });

        router.push(`/${workspaceObj.name}`);
      }
    } catch (error) {
      console.error("Erreur de navigation workspace:", error);
    }
  };

  // Navigation entre channels avec mise à jour de l'interface et de l'URL
  const handleChannelClick = (channelId, channelName) => {
    // Ignorer si déjà sur ce channel
    if (channelId === activeChannel.channel) {
      return;
    }

    try {
      // Trouver le workspace actif
      const workspaceObj = workspaces.find((w) => w.id === activeWorkspace);
      if (!workspaceObj) return;

      // Obtenir le channel complet
      const channelObj = channels[activeWorkspace]?.find(
        (c) => c.id === channelId
      );
      if (!channelObj) return;

      // 1. Mettre à jour l'état actif pour actualiser l'interface
      setActiveChannel({
        workspace: activeWorkspace,
        channel: channelId,
      });

      // 2. Mettre à jour l'URL sans recharger la page
      const url = `/${workspaceObj.name}/${channelName}`;
      console.log(`Navigation vers channel: ${channelName}`);

      window.history.pushState(
        {
          workspaceId: activeWorkspace,
          channelId: channelId,
          channelName: channelName,
        },
        channelName, // Titre
        url
      );

      // 3. Déclencher un événement personnalisé pour informer la page de channel
      const channelEvent = new CustomEvent("oneskChannelChanged", {
        detail: {
          channelId,
          channelName,
          workspaceId: activeWorkspace,
          workspaceName: workspaceObj.name,
          channel: channelObj,
        },
      });
      window.dispatchEvent(channelEvent);
    } catch (error) {
      console.error("Erreur navigation channel:", error);
    }
  };

  // Obtenir les détails de l'utilisateur
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading((prev) => ({ ...prev, user: true }));
        const response = await fetch("/api/users/me", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user details");
        }

        const data = await response.json();
        setUser(data);
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError((prev) => ({ ...prev, user: err.message }));
      } finally {
        setLoading((prev) => ({ ...prev, user: false }));
      }
    };

    fetchUserDetails();
  }, []);

  // Charger les channels lorsque le workspace actif change
  useEffect(() => {
    if (activeWorkspace) {
      // Toujours recharger les channels pour s'assurer qu'ils sont à jour
      // même si nous les avons déjà dans le cache
      console.log("Chargement forcé des channels pour workspace ID:", activeWorkspace);
      // Ajouter un petit délai pour éviter les problèmes de rendu
      const timer = setTimeout(() => {
        fetchChannels(activeWorkspace);
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [activeWorkspace]);

  // Mettre à jour l'état actif lorsque les props changent
  useEffect(() => {
    if (activeWorkspaceId && activeWorkspaceId !== activeWorkspace) {
      setActiveWorkspace(activeWorkspaceId);
    }

    if (
      activeChannelId &&
      (!activeChannel || activeChannelId !== activeChannel.channel)
    ) {
      setActiveChannel((prev) => ({
        workspace: activeWorkspaceId || prev.workspace,
        channel: activeChannelId,
      }));
    }
  }, [activeWorkspaceId, activeChannelId, activeWorkspace, activeChannel]);

  // Ouvrir le modal de création/modification d'un workspace
  const openWorkspaceModal = (workspace = null) => {
    setCurrentWorkspace(workspace);
    setWorkspaceModalOpen(true);
  };

  // Ouvrir le modal de création/modification d'un channel
  const openChannelModal = (channel = null) => {
    setCurrentChannel(channel);
    setChannelModalOpen(true);
  };

  // Ouvrir le modal d'invitation
  const openInviteModal = (workspace = null) => {
    // Si un workspace est fourni, l'utiliser, sinon utiliser le workspace actif
    const targetWorkspace =
      workspace || workspaces.find((w) => w.id === activeWorkspace);
    setCurrentWorkspace(targetWorkspace);
    setInviteModalOpen(true);
  };

  // Sauvegarder un workspace (création ou modification)
  const handleSaveWorkspace = async (workspaceData) => {
    try {
      let response;

      if (workspaceData.id) {
        // Modification d'un workspace existant
        // Récupérer l'ancien nom du workspace directement
        const oldWorkspaceName = workspaces.find(
          (w) => w.id === workspaceData.id
        )?.name;

        if (!oldWorkspaceName) {
          throw new Error("Workspace not found");
        }

        response = await fetch(
          `/api/workspaces/${encodeURIComponent(oldWorkspaceName)}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: workspaceData.name,
              letter: workspaceData.letter,
              color: workspaceData.color,
            }),
          }
        );
      } else {
        // Création d'un nouveau workspace
        response = await fetch("/api/workspaces", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: workspaceData.name,
            letter: workspaceData.letter,
            color: workspaceData.color,
          }),
        });
      }

      if (!response.ok) {
        throw new Error("Failed to save workspace");
      }

      // Rechargement des workspaces après modification
      const fetchWorkspacesResponse = await fetch("/api/workspaces", {
        cache: "no-store",
      });
      const updatedWorkspaces = await fetchWorkspacesResponse.json();
      setWorkspaces(updatedWorkspaces);

      // Récupérer le nouveau workspace
      if (!workspaceData.id && updatedWorkspaces.length > 0) {
        const newWorkspace = updatedWorkspaces[updatedWorkspaces.length - 1];
        if (newWorkspace) {
          // Charger les channels du nouveau workspace
          // C'est ici qu'on va récupérer les channels créés automatiquement
          fetchChannels(newWorkspace.id, updatedWorkspaces)
            .then((channelsData) => {
              // Définir le nouveau workspace comme actif
              setActiveWorkspace(newWorkspace.id);

              // S'il y a des channels, définir le premier comme actif et naviguer
              if (channelsData && channelsData.length > 0) {
                const firstChannel = channelsData[0];
                setActiveChannel({
                  workspace: newWorkspace.id,
                  channel: firstChannel.id,
                });

                // Rediriger vers le premier channel du nouveau workspace sans recharger la page
                router.push(
                  `/${encodeURIComponent(
                    newWorkspace.name
                  )}/${encodeURIComponent(firstChannel.name)}`,
                  undefined,
                  { shallow: true }
                );
              } else {
                // Sinon, juste naviguer vers le workspace
                router.push(
                  `/${encodeURIComponent(newWorkspace.name)}`,
                  undefined,
                  { shallow: true }
                );
              }
            })
            .catch((err) => {
              console.error("Error loading channels for new workspace:", err);
              // En cas d'erreur, juste naviguer vers le workspace sans recharger la page
              router.push(
                `/${encodeURIComponent(newWorkspace.name)}`,
                undefined,
                { shallow: true }
              );
            });
        }
      }
    } catch (error) {
      console.error("Error saving workspace:", error);
      // Gérer l'erreur (afficher un message à l'utilisateur, etc.)
    }
  };

  // Supprimer un workspace
  const handleDeleteWorkspace = async (workspaceId) => {
    if (!workspaceId) return;

    if (
      window.confirm(
        "Êtes-vous sûr de vouloir supprimer cet espace de travail ?"
      )
    ) {
      try {
        // Trouver le nom du workspace à partir de son ID
        const workspaceName = workspaces.find(
          (w) => w.id === workspaceId
        )?.name;
        if (!workspaceName) {
          throw new Error("Workspace not found");
        }

        const response = await fetch(
          `/api/workspaces/${encodeURIComponent(workspaceName)}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete workspace");
        }

        // Rechargement des workspaces après suppression
        const fetchWorkspacesResponse = await fetch("/api/workspaces", {
          cache: "no-store",
        });
        const updatedWorkspaces = await fetchWorkspacesResponse.json();
        setWorkspaces(updatedWorkspaces);

        // Si le workspace actif a été supprimé, sélectionner un autre
        if (activeWorkspace === workspaceId && updatedWorkspaces.length > 0) {
          handleWorkspaceChange(updatedWorkspaces[0].id);
        }
      } catch (error) {
        console.error("Error deleting workspace:", error);
        // Gérer l'erreur (afficher un message à l'utilisateur, etc.)
      }
    }
  };
  
  // Fonction pour quitter un workspace
  const handleLeaveWorkspace = async (workspaceId) => {
    if (!workspaceId) return;

    try {
      await leaveWorkspace(workspaceId);
      
      // Rechargement des workspaces après avoir quitté
      const fetchWorkspacesResponse = await fetch("/api/workspaces", {
        cache: "no-store",
      });
      const updatedWorkspaces = await fetchWorkspacesResponse.json();
      setWorkspaces(updatedWorkspaces);

      // Si le workspace quitté était actif, sélectionner un autre
      if (activeWorkspace === workspaceId && updatedWorkspaces.length > 0) {
        handleWorkspaceChange(updatedWorkspaces[0].id);
      }
    } catch (error) {
      console.error("Error leaving workspace:", error);
      alert(error.message || "Erreur lors de la sortie du workspace");
    }
  };

  // Sauvegarder un channel (création ou modification)
  const handleSaveChannel = async (channelData) => {
    try {
      let response;

      // Trouver le nom du workspace à partir de son ID
      const workspaceName = workspaces.find(
        (w) => w.id === activeWorkspace
      )?.name;
      if (!workspaceName) {
        throw new Error("Workspace not found");
      }

      if (channelData.id) {
        // Modification d'un channel existant
        // Récupérer l'ancien nom du channel
        const currentChannels = channels[activeWorkspace] || [];
        const oldChannelName = currentChannels.find(
          (c) => c.id === channelData.id
        )?.name;

        if (!oldChannelName) {
          throw new Error("Channel not found");
        }

        response = await fetch(
          `/api/workspaces/${encodeURIComponent(
            workspaceName
          )}/channels/${encodeURIComponent(oldChannelName)}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: channelData.name,
              type: channelData.type,
              emoji: channelData.emoji,
            }),
          }
        );
      } else {
        // Création d'un nouveau channel
        response = await fetch(
          `/api/workspaces/${encodeURIComponent(workspaceName)}/channels`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: channelData.name,
              type: channelData.type,
              emoji: channelData.emoji,
            }),
          }
        );
      }

      if (!response.ok) {
        throw new Error("Failed to save channel");
      }

      // Rechargement des channels après modification
      const newChannelData = await response.json();

      fetchChannels(activeWorkspace, workspaces).then(() => {
        if (newChannelData && !channelData.id) {
          // Si c'est un nouveau channel, rediriger vers celui-ci
          const workspaceName =
            workspaces.find((w) => w.id === activeWorkspace)?.name || "";
          const channelName = newChannelData.name;
          router.push(
            `/${encodeURIComponent(workspaceName)}/${encodeURIComponent(
              channelName
            )}`,
            undefined,
            { shallow: true }
          );
        }
      });
    } catch (error) {
      console.error("Error saving channel:", error);
      // Gérer l'erreur (afficher un message à l'utilisateur, etc.)
    }
  };

  // Supprimer un channel
  const handleDeleteChannel = async (channelId) => {
    if (!channelId) return;

    if (
      window.confirm(
        "Êtes-vous sûr de vouloir supprimer cet espace de travail ?"
      )
    ) {
      try {
        // Trouver le nom du workspace à partir de son ID
        const workspaceName = workspaces.find(
          (w) => w.id === activeWorkspace
        )?.name;
        if (!workspaceName) {
          throw new Error("Workspace not found");
        }

        // Trouver le nom du channel à partir de son ID
        const channelName = channels[activeWorkspace]?.find(
          (c) => c.id === channelId
        )?.name;
        if (!channelName) {
          throw new Error("Channel not found");
        }

        const response = await fetch(
          `/api/workspaces/${encodeURIComponent(
            workspaceName
          )}/channels/${encodeURIComponent(channelName)}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete channel");
        }

        // Rechargement des channels après suppression
        fetchChannels(activeWorkspace, workspaces).then((data) => {
          // Si le channel actif a été supprimé, rediriger vers un autre
          if (activeChannel.channel === channelId && data && data.length > 0) {
            const firstChannelId = data[0].id;
            const firstChannelName = data[0].name;
            const workspaceName =
              workspaces.find((w) => w.id === activeWorkspace)?.name || "";

            setActiveChannel({
              workspace: activeWorkspace,
              channel: firstChannelId,
            });
            router.push(
              `/${encodeURIComponent(workspaceName)}/${encodeURIComponent(
                firstChannelName
              )}`,
              undefined,
              { shallow: true }
            );
          } else if (data && data.length === 0) {
            // Si plus aucun channel, rediriger vers la page du workspace
            const workspaceName =
              workspaces.find((w) => w.id === activeWorkspace)?.name || "";
            router.push(`/${encodeURIComponent(workspaceName)}`, undefined, {
              shallow: true,
            });
          }
        });
      } catch (error) {
        console.error("Error deleting channel:", error);
        // Gérer l'erreur (afficher un message à l'utilisateur, etc.)
      }
    }
  };

  // Fonction appelée quand les workspaces sont mis à jour via les invitations
  const handleWorkspacesUpdated = () => {
    fetchWorkspaces();
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col font-sans">
      {/* Sidebar principale */}
      <div className="w-64 h-full flex flex-col justify-between">
        {/* Header avec logo, titre et recherche */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <SidebarHeader />

          {/* Section Équipe/Workspace Actif */}
          <div className="px-4 mt-2">
            <div className="flex-grow">
              <WorkspaceSelector
                workspaces={workspaces}
                activeWorkspace={activeWorkspace}
                isDropdownOpen={workspacesDropdownOpen}
                toggleDropdown={toggleWorkspacesDropdown}
                handleWorkspaceChange={handleWorkspaceChange}
                hoveredWorkspace={hoveredWorkspace}
                setHoveredWorkspace={setHoveredWorkspace}
                loading={loading.workspaces || loading.adminCheck}
                error={error.workspaces || error.adminCheck}
                onEditWorkspace={openWorkspaceModal}
                onCreateWorkspace={() => openWorkspaceModal()}
                onDeleteWorkspace={handleDeleteWorkspace}
                onLeaveWorkspace={handleLeaveWorkspace}
                onInviteUser={openInviteModal}
                adminWorkspaces={adminWorkspaces}
              />
            </div>
          </div>

          {/* Section ESPACES DE TRAVAIL (Channels) */}
          <ChannelsList
            activeWorkspace={activeWorkspace}
            activeChannel={activeChannel}
            channels={channels}
            loading={loading.channels}
            error={error.channels}
            hoveredChannel={hoveredChannel}
            setHoveredChannel={setHoveredChannel}
            handleChannelClick={handleChannelClick}
            openChannelModal={openChannelModal}
            handleDeleteChannel={handleDeleteChannel}
          />
        </div>

        {/* Section utilisateur en bas */}
        <div className="p-3 mx-3 mb-2">
          <UserProfile
            user={user}
            loading={loading.user}
            error={error.user}
            onWorkspacesUpdated={handleWorkspacesUpdated}
          />
        </div>
      </div>

      {/* Modals */}
      <WorkspaceModal
        workspace={currentWorkspace}
        isOpen={workspaceModalOpen}
        onClose={() => setWorkspaceModalOpen(false)}
        onSave={handleSaveWorkspace}
      />

      <ChannelModal
        channel={currentChannel}
        workspaceId={activeWorkspace}
        isOpen={channelModalOpen}
        onClose={() => setChannelModalOpen(false)}
        onSave={handleSaveChannel}
      />

      <InviteUserModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        workspace={currentWorkspace}
      />
    </div>
  );
};

export default SidebarCore;
