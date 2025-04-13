"use client";
import React, { useState } from "react";
import { Mail, Trash2, Copy, Check, Clock, RefreshCw } from "lucide-react";
import useInvitations from "@/lib/hooks/useInvitations";

const PendingInvitations = ({ workspaceId }) => {
  const [copied, setCopied] = useState({});
  
  // Utiliser notre hook personnalisé pour gérer les invitations
  const { 
    invitations, 
    loading, 
    error, 
    fetchInvitations, 
    deleteInvitation, 
    copyInvitationLink 
  } = useInvitations(workspaceId);

  // Gérer la copie avec feedback visuel
  const handleCopyLink = (token) => {
    copyInvitationLink(token);
    
    // Afficher l'indicateur de copie
    setCopied({...copied, [token]: true});
    
    // Réinitialiser après 2 secondes
    setTimeout(() => {
      setCopied({...copied, [token]: false});
    }, 2000);
  };

  // Gérer la suppression avec confirmation
  const handleDeleteInvitation = async (token) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette invitation ?")) return;
    
    const success = await deleteInvitation(token);
    if (!success) {
      alert("Impossible de supprimer l'invitation");
    }
  };

  // Calculer le temps restant
  const getTimeRemaining = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry - now;
    
    // Si expiré
    if (diff <= 0) return "Expiré";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} jour${days > 1 ? 's' : ''} et ${hours} heure${hours > 1 ? 's' : ''}`;
    } else {
      return `${hours} heure${hours > 1 ? 's' : ''}`;
    }
  };

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="p-4 rounded-md border border-gray-200 bg-white">
        <div className="flex items-center justify-center py-6">
          <RefreshCw size={20} className="animate-spin text-gray-400 mr-2" />
          <span className="text-gray-500">Chargement des invitations...</span>
        </div>
      </div>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="p-4 rounded-md border border-red-200 bg-red-50">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchInvitations}
          className="mt-2 text-sm text-red-700 hover:underline flex items-center"
        >
          <RefreshCw size={14} className="mr-1" /> Réessayer
        </button>
      </div>
    );
  }

  // Pas d'invitations
  if (invitations.length === 0) {
    return (
      <div className="p-4 rounded-md border border-gray-200 bg-gray-50">
        <p className="text-gray-600 text-center">Aucune invitation en attente</p>
      </div>
    );
  }

  // Affichage des invitations
  return (
    <div className="bg-white border border-gray-200 rounded-md">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">Invitations en attente</h3>
      </div>
      <ul className="divide-y divide-gray-200">
        {invitations.map((invitation) => (
          <li key={invitation.token} className="p-4 hover:bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Mail size={18} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{invitation.email}</p>
                  <div className="flex items-center mt-1">
                    <Clock size={14} className="text-gray-400 mr-1" />
                    <p className="text-xs text-gray-500">
                      Expire dans {getTimeRemaining(invitation.expires_at)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleCopyLink(invitation.token)}
                  className="p-1 rounded-md hover:bg-gray-100"
                  title="Copier le lien d'invitation"
                >
                  {copied[invitation.token] ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <Copy size={16} className="text-gray-500" />
                  )}
                </button>
                <button
                  onClick={() => handleDeleteInvitation(invitation.token)}
                  className="p-1 rounded-md hover:bg-gray-100 text-red-500"
                  title="Supprimer l'invitation"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PendingInvitations;
