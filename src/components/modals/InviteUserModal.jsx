"use client";
import React, { useState } from "react";
import { Mail, X, Copy, Check } from "lucide-react";

const InviteUserModal = ({ isOpen, onClose, workspace }) => {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [invitationLink, setInvitationLink] = useState("");
  const [copied, setCopied] = useState(false);

  // Gérer l'envoi d'invitation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation de base
    if (!email.trim()) {
      setError("L'email est requis");
      return;
    }

    // Vérification basique du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Format d'email invalide");
      return;
    }

    try {
      setIsSending(true);

      // Générer le lien d'invitation
      const baseUrl = window.location.origin;
      const inviteToken = btoa(`${workspace.id}:${Date.now()}`);
      const link = `${baseUrl}/invite/${inviteToken}`;
      setInvitationLink(link);
      
      // Simuler l'envoi d'email - en production, ceci serait remplacé par un appel API
      console.log(`Envoi d'invitation à ${email} pour rejoindre ${workspace.name}`);
      console.log(`Lien d'invitation: ${link}`);
      
      // Dans une application réelle, l'appel serait :
      // await fetch('/api/invite/send', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     email, 
      //     workspaceId: workspace.id,
      //     inviteLink: link
      //   })
      // });

      // Réinitialiser l'email après envoi
      setEmail("");
    } catch (err) {
      console.error("Error sending invitation:", err);
      setError("Erreur lors de l'envoi de l'invitation");
    } finally {
      setIsSending(false);
    }
  };

  // Gérer la copie du lien d'invitation
  const copyToClipboard = () => {
    navigator.clipboard.writeText(invitationLink);
    setCopied(true);

    // Réinitialiser l'état "copied" après 2 secondes
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  // Ne pas rendre si le modal n'est pas ouvert
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 mx-4 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Inviter un membre</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="mb-4">
          <p className="text-sm text-gray-700 mb-2">
            Invitez de nouveaux membres à rejoindre l'espace{" "}
            <strong>{workspace?.name}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-800 mb-1"
            >
              Adresse email
            </label>
            <div className="flex">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full px-3 text-black py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="example@email.com"
                />
              </div>
              <button
                type="submit"
                disabled={isSending}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
              >
                {isSending ? "Envoi..." : "Inviter"}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Un email d'invitation sera envoyé à cette adresse
            </p>
          </div>
        </form>

        {invitationLink && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-800 mb-2">
              Lien d'invitation
            </h3>
            <div className="flex items-center space-x-2">
              <div className="flex-grow p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600 truncate">
                {invitationLink}
              </div>
              <button
                onClick={copyToClipboard}
                className="p-2 rounded-md bg-gray-100 hover:bg-gray-200"
                title="Copier le lien"
              >
                {copied ? (
                  <Check size={18} className="text-green-500" />
                ) : (
                  <Copy size={18} className="text-gray-500" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Vous pouvez également partager ce lien directement
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteUserModal;
