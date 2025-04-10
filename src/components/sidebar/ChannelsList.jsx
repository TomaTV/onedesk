"use client";
import React from "react";
import { Plus, Loader2 } from "lucide-react";
import Channel from "./Channel";

const ChannelsList = ({
  activeWorkspace,
  activeChannel,
  channels,
  loading,
  error,
  hoveredChannel,
  setHoveredChannel,
  handleChannelClick,
  openChannelModal,
  handleDeleteChannel,
}) => {
  // Ajout de console.log pour déboguer l'affichage des channels
  console.log("ChannelsList - activeWorkspace:", activeWorkspace);
  console.log("ChannelsList - channels disponibles:", channels);
  
  // Vérifier spécifiquement les channels pour le workspace actif
  if (activeWorkspace) {
    console.log(`Channels pour workspace ${activeWorkspace}:`, channels[activeWorkspace]);
  }
  return (
    <div className="mt-5 px-4">
      <div className="flex items-center justify-between px-2 py-2">
        <p className="text-xs text-gray-500 font-medium">ESPACES DE TRAVAIL</p>
        {activeWorkspace && (
          <button
            className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => openChannelModal()}
            title="Ajouter un espace de travail"
          >
            <Plus size={12} />
          </button>
        )}
      </div>

      <div className="space-y-0.5 mt-1">
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 size={20} className="text-gray-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center p-4 text-red-500">
            <span className="text-sm">Erreur de chargement</span>
          </div>
        ) : activeWorkspace && Array.isArray(channels[activeWorkspace]) && channels[activeWorkspace].length === 0 ? (
          <div className="flex items-center justify-center p-4">
            <span className="text-sm text-gray-500">
              Aucun espace de travail
            </span>
          </div>
        ) : activeWorkspace && Array.isArray(channels[activeWorkspace]) ? (
          // Afficher les channels
          channels[activeWorkspace].map((channel) => (
            <div key={channel.id} className="group relative">
              <Channel
                channel={channel}
                isActive={
                  activeChannel.workspace === activeWorkspace &&
                  activeChannel.channel === channel.id
                }
                onClick={() => handleChannelClick(channel.id, channel.name)}
                onMouseEnter={() => setHoveredChannel(channel.id)}
                onMouseLeave={() => setHoveredChannel(null)}
                isHovered={hoveredChannel === channel.id}
                onEditChannel={() => openChannelModal(channel)}
                onDeleteChannel={() => handleDeleteChannel(channel.id)}
              />
            </div>
          ))
        ) : null}

        {/* Bouton ajouter espace de travail */}
        {activeWorkspace && (
          <div
            className="flex items-center gap-2 px-2 py-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors mt-1 group"
            onClick={() => openChannelModal()}
          >
            <Plus
              size={16}
              className="text-gray-400 group-hover:text-gray-600 w-5 flex justify-center"
            />
            <span className="text-sm group-hover:text-gray-700">
              Ajouter un espace
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelsList;
