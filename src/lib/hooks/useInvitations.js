"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

/**
 * Hook personnalisé pour gérer les invitations en attente
 * @param {number} workspaceId - ID du workspace
 * @returns {Object} - État et fonctions pour interagir avec les invitations
 */
export default function useInvitations(workspaceId) {
  const { data: session } = useSession();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fonction pour charger les invitations
  const fetchInvitations = useCallback(async () => {
    if (!workspaceId) return;
    
    try {
      setLoading(true);
      
      // Ajouter un cache buster précis pour éviter tout cache
      const timestamp = Date.now();
      const response = await fetch(`/api/workspaces/${workspaceId}/invitations?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setInvitations(data || []);
    } catch (err) {
      console.error("Erreur lors du chargement des invitations:", err);
      setError(`Impossible de charger les invitations: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);
  
  // Charger les invitations et configurer le polling
  useEffect(() => {
    if (!workspaceId) return;
    
    // Charger immédiatement
    fetchInvitations();
    
    // Les notifications WebSocket sont prioritaires pour la réactivité
    // mais on garde un polling moins fréquent comme backup (5 secondes)
    const intervalId = setInterval(fetchInvitations, 5000);
    
    return () => clearInterval(intervalId);
  }, [workspaceId, fetchInvitations]);
  
  // Fonction pour supprimer une invitation
  const deleteInvitation = useCallback(async (token) => {
    if (!token) return;
    
    try {
      const response = await fetch(`/api/invitations/${token}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      // Mettre à jour l'état local en supprimant l'invitation
      setInvitations(prev => prev.filter(inv => inv.token !== token));
      
      return true;
    } catch (err) {
      console.error("Erreur lors de la suppression de l'invitation:", err);
      return false;
    }
  }, []);
  
  // Fonction pour copier un lien d'invitation
  const copyInvitationLink = useCallback((token) => {
    if (!token) return false;
    
    try {
      const baseUrl = window.location.origin;
      const invitationLink = `${baseUrl}/invite/${token}`;
      
      navigator.clipboard.writeText(invitationLink);
      return true;
    } catch (err) {
      console.error("Erreur lors de la copie du lien:", err);
      return false;
    }
  }, []);
  
  return {
    invitations,
    loading,
    error,
    fetchInvitations,
    deleteInvitation,
    copyInvitationLink
  };
}
