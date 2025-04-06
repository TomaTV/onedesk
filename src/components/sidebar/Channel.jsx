"use client";
import React from "react";
import { File, EllipsisVertical, Trash2 } from "lucide-react";

const Channel = ({
  channel,
  isActive,
  onClick,
  onMouseEnter,
  onMouseLeave,
  isHovered,
  onEditChannel,
  onDeleteChannel,
}) => {
  // Empêcher le rechargement complet lors du clic sur un canal
  const handleClick = (e) => {
    // Toujours empêcher le comportement par défaut
    e.preventDefault();
    e.stopPropagation();
    
    // Déléguer la gestion au parent (qui utilise history.pushState)
    onClick(e);
  };
  
  return (
    <div
      className={`group relative flex items-center px-2 py-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors ${
        isActive ? "bg-gray-100 text-gray-900" : "text-gray-700"
      }`}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex items-center gap-2 flex-grow">
        {channel.emoji ? (
          isNaN(channel.emoji) && channel.emoji.length === 1 ? (
            // Si c'est une lettre (et non un emoji)
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-xs font-medium">
              {channel.emoji}
            </div>
          ) : (
            // Si c'est un emoji
            <span className="text-sm w-5 flex justify-center">
              {channel.emoji}
            </span>
          )
        ) : (
          <File size={16} className="text-gray-500 w-5 flex justify-center" />
        )}
        <span className="text-sm truncate font-medium">{channel.name}</span>
      </div>

      {isHovered && (
        <div className="absolute right-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
          <button
            className="p-1 rounded-md hover:bg-gray-200 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onEditChannel();
            }}
            title="Modifier l'espace"
          >
            <EllipsisVertical size={14} className="text-gray-500" />
          </button>
          <button
            className="p-1 rounded-md hover:bg-gray-200 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteChannel();
            }}
            title="Supprimer l'espace"
          >
            <Trash2 size={14} className="text-gray-500" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Channel;
