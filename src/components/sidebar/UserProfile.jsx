"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bell, Settings, Loader2, LogOut, Check, X, ChevronUp, ChevronDown } from "lucide-react";
import { signOut } from "next-auth/react";
import { getUserInvitations, acceptInvitation, rejectInvitation } from "@/lib/services/invitationService";

const UserProfile = ({ user, loading, error, onWorkspacesUpdated }) => {
  const router = useRouter();
  const [invitations, setInvitations] = useState([]);
  const [showInvitations, setShowInvitations] = useState(false);
  const [invitationLoading, setInvitationLoading] = useState(false);
  const [processedInvitation, setProcessedInvitation] = useState(null);

  // Fonction pour obtenir l'initiale du prénom
  const getInitial = (name) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase();
  };

  // Fonction pour extraire le prénom
  const getFirstName = (name) => {
    if (!name) return "";
    return name.split(" ")[0];
  };

  // État pour l'animation de notification
  const [newInvitationAlert, setNewInvitationAlert] = useState(false);

  // Charger les invitations en attente avec un mécanisme de cache
  useEffect(() => {
    if (!user) return;
    
    // Variable pour suivre si le composant est monté
    let isMounted = true;
    // Mécanisme anti-rebond pour éviter les appels successifs trop rapides
    let lastFetch = 0;

    const fetchInvitations = async () => {
      // Vérifier si le temps minimum entre les requêtes est respecté (1 seconde)
      const now = Date.now();
      if (now - lastFetch < 1000) return;
      lastFetch = now;
      
      try {
        // Ajouter un paramètre cache-buster avec timestamp en millisecondes - 1 minute
        // Cela permet de mettre en cache les réponses pendant 1 minute au niveau du navigateur
        const cacheBuster = Math.floor(now / 60000);
        const pendingInvitations = await getUserInvitations(user.email, cacheBuster);
        
        // Si le composant n'est plus monté, ne pas mettre à jour l'état
        if (!isMounted) return;
        
        // Si de nouvelles invitations sont arrivées et ce n'est pas le premier chargement
        if (invitations.length > 0 && pendingInvitations.length > invitations.length) {
          // Déclencher l'animation de notification
          setNewInvitationAlert(true);
          
          // Réinitialiser après 3 secondes
          setTimeout(() => {
            if (isMounted) {
              setNewInvitationAlert(false);
              // Ouvrir automatiquement la liste d'invitations
              setShowInvitations(true);
            }
          }, 3000);
        }
        
        setInvitations(pendingInvitations || []);
      } catch (error) {
        console.error("Erreur lors du chargement des invitations:", error);
      }
    };
    
    // Charger immédiatement au début
    fetchInvitations();
    
    // Rafraîchir les invitations toutes les 60 secondes au lieu de 10
    const intervalId = setInterval(fetchInvitations, 60000);
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [user]);  // Supprimer la dépendance à invitations.length pour éviter des appels en cascade

  // Gérer l'acceptation d'une invitation
  const handleAcceptInvitation = async (token) => {
    try {
      setInvitationLoading(true);
      setProcessedInvitation(token);
      await acceptInvitation(token);
      
      // Retirer l'invitation de la liste
      setInvitations(invitations.filter(inv => inv.token !== token));
      
      // Informer le parent que les workspaces ont été mis à jour
      if (onWorkspacesUpdated) {
        onWorkspacesUpdated();
      }
      
      // Rediriger vers le workspace après un court délai
      const invitation = invitations.find(inv => inv.token === token);
      if (invitation) {
        setTimeout(() => {
          router.push(`/${encodeURIComponent(invitation.workspace_name)}`);
        }, 300);
      }
    } catch (error) {
      console.error("Erreur lors de l'acceptation de l'invitation:", error);
    } finally {
      setInvitationLoading(false);
      setProcessedInvitation(null);
    }
  };

  // Gérer le rejet d'une invitation
  const handleRejectInvitation = async (token) => {
    try {
      setInvitationLoading(true);
      setProcessedInvitation(token);
      await rejectInvitation(token);
      
      // Retirer l'invitation de la liste
      setInvitations(invitations.filter(inv => inv.token !== token));
    } catch (error) {
      console.error("Erreur lors du rejet de l'invitation:", error);
    } finally {
      setInvitationLoading(false);
      setProcessedInvitation(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-2">
        <Loader2 size={16} className="text-gray-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-2 text-red-500">
        <span className="text-xs">Erreur</span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col">
      {/* Liste des invitations */}
      {invitations.length > 0 && (
        <div className="mb-2">
          <div 
            className="flex items-center justify-between p-2 bg-gray-100 rounded-md mb-1 cursor-pointer"
            onClick={() => setShowInvitations(!showInvitations)}
          >
            <div className="flex items-center gap-1">
              <Bell size={14} className="text-indigo-500" />
              <span className="text-xs font-medium text-gray-700">
                {invitations.length} invitation{invitations.length > 1 ? 's' : ''}
              </span>
            </div>
            {showInvitations ? (
              <ChevronUp size={14} className="text-gray-500" />
            ) : (
              <ChevronDown size={14} className="text-gray-500" />
            )}
          </div>
          
          {showInvitations && (
            <div className="space-y-2 mb-2 max-h-40 overflow-y-auto">
              {invitations.map((invitation) => (
                <div 
                  key={invitation.token} 
                  className="p-2 bg-white border border-gray-200 rounded-md shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div 
                      className={`w-6 h-6 flex items-center justify-center rounded-md text-white text-xs font-medium bg-gradient-to-br ${invitation.workspace_color}`}
                    >
                      {invitation.workspace_letter}
                    </div>
                    <span className="text-xs font-medium text-gray-800 truncate">
                      {invitation.workspace_name}
                    </span>
                  </div>
                  <div className="flex justify-end gap-1 mt-1">
                    <button
                      disabled={invitationLoading && processedInvitation === invitation.token}
                      onClick={() => handleRejectInvitation(invitation.token)}
                      className="p-1 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
                      title="Refuser"
                    >
                      <X size={14} className="text-gray-500" />
                    </button>
                    <button
                      disabled={invitationLoading && processedInvitation === invitation.token}
                      onClick={() => handleAcceptInvitation(invitation.token)}
                      className="p-1 rounded-md bg-indigo-100 hover:bg-indigo-200 transition-colors"
                      title="Accepter"
                    >
                      {invitationLoading && processedInvitation === invitation.token ? (
                        <Loader2 size={14} className="text-indigo-500 animate-spin" />
                      ) : (
                        <Check size={14} className="text-indigo-500" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Profil utilisateur */}
      <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-xs shadow-sm">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                width={32}
                height={32}
                className="object-cover w-full h-full"
              />
            ) : (
              getInitial(user.name)
            )}
          </div>
          <div className="text-sm font-medium text-gray-800">
            {getFirstName(user.name)}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors relative"
            title="Notifications"
            onClick={() => setShowInvitations(!showInvitations)}
          >
            <Bell size={14} className={newInvitationAlert ? 'animate-pulse text-indigo-600' : ''} />
            {invitations.length > 0 && (
              <span className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full ${newInvitationAlert ? 'animate-ping-slow' : ''}`}>
                {invitations.length}
              </span>
            )}
          </button>
          <button
            onClick={() => router.push("/settings")}
            className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors"
            title="Paramètres"
          >
            <Settings size={14} />
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="p-1 rounded-md text-red-500 hover:text-red-700 hover:bg-gray-200 transition-colors"
            title="Se déconnecter"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
