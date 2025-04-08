"use client";
import React from "react";
import {
  ChevronDown,
  Plus,
  Loader2,
  EllipsisVertical,
  Trash2,
  UserPlus,
  LogOut,
} from "lucide-react";
import { leaveWorkspace } from "@/lib/services/workspaceService";

const WorkspaceSelector = ({
  workspaces,
  activeWorkspace,
  isDropdownOpen,
  toggleDropdown,
  handleWorkspaceChange,
  hoveredWorkspace,
  setHoveredWorkspace,
  loading,
  error,
  onEditWorkspace,
  onCreateWorkspace,
  onDeleteWorkspace,
  onLeaveWorkspace = () => {
    console.warn('No leave workspace handler provided');
    alert('Cette fonctionnalité n\'est pas disponible actuellement.');
  },
  onInviteUser,
  adminWorkspaces = [],
}) => {
  // Trouver le workspace actif
  const activeWorkspaceData = workspaces.find((w) => w.id === activeWorkspace);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-2">
        <Loader2 size={20} className="text-gray-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-2 text-red-500">
        <span className="text-sm">Erreur de chargement</span>
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="flex items-center justify-center p-2">
        <span className="text-sm text-gray-500">Aucune équipe disponible</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Bouton de sélection du workspace */}
      <div
        className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors group"
        onClick={toggleDropdown}
      >
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center justify-center w-6 h-6 bg-gradient-to-br ${
              activeWorkspaceData?.color || "from-indigo-500 to-indigo-600"
            } rounded-lg text-white text-xs font-medium shadow-sm`}
          >
            {activeWorkspaceData?.letter || "W"}
          </div>
          <span className="font-medium text-sm text-gray-800 group-hover:text-gray-900">
            {activeWorkspaceData?.name || "Équipe"}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${
            isDropdownOpen ? "transform rotate-180" : ""
          }`}
        />
      </div>

      {/* Dropdown des workspaces */}
      {isDropdownOpen && (
        <div className="absolute z-10 w-60 left-0 mt-1">
          <div className="rounded-lg bg-white shadow-lg py-2 mx-1 border border-gray-100">
            <p className="text-xs text-gray-500 font-medium px-3 pb-2 mb-1">
              CHANGER D'ÉQUIPE
            </p>

            <div className="max-h-60 overflow-y-auto">
              {workspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  className={`flex items-center px-3 py-2 cursor-pointer transition-colors ${
                    activeWorkspace === workspace.id
                      ? "bg-gray-50 text-gray-900"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => handleWorkspaceChange(workspace.id)}
                  onMouseEnter={() => setHoveredWorkspace(workspace.id)}
                  onMouseLeave={() => setHoveredWorkspace(null)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex items-center justify-center w-7 h-7 bg-gradient-to-br ${workspace.color} rounded-lg text-white font-semibold text-sm shadow-sm`}
                      >
                        {workspace.letter}
                      </div>
                      <span className="text-sm font-medium truncate">
                        {workspace.name}
                      </span>
                    </div>

                    {hoveredWorkspace === workspace.id && (
                      <div className="flex items-center space-x-1">
                        {console.log(`Workspace ${workspace.id} - Role: ${workspace.role} - Is in adminWorkspaces: ${adminWorkspaces.includes(workspace.id)}`)}
                        
                        {/* Boutons d'administration - affichés si l'utilisateur est admin */}
                        {workspace.role === 'admin' && (
                          <>
                            <button
                              className="p-1 rounded-md hover:bg-gray-200 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditWorkspace(workspace);
                              }}
                              title="Modifier l'équipe"
                            >
                              <EllipsisVertical
                                size={14}
                                className="text-gray-500"
                              />
                            </button>

                            {/* Supprimer est visible s'il y a plus d'un workspace */}
                            {workspaces.length > 1 && (
                              <button
                                className="p-1 rounded-md hover:bg-gray-200 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteWorkspace(workspace.id);
                                }}
                                title="Supprimer l'équipe"
                              >
                                <Trash2 size={14} className="text-gray-500" />
                              </button>
                            )}
                          </>
                        )}

                        {/* Le bouton d'invitation est toujours visible */}
                        <button
                          className="p-1 rounded-md hover:bg-gray-200 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            onInviteUser(workspace);
                          }}
                          title="Inviter un membre"
                        >
                          <UserPlus size={14} className="text-gray-500" />
                        </button>
                        
                        {/* Bouton pour quitter le workspace (uniquement pour les membres) */}
                        {workspace.role === 'member' && (
                          <button
                            className="p-1 rounded-md hover:bg-gray-200 transition-colors"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (window.confirm(`Êtes-vous sûr de vouloir quitter l'espace "${workspace.name}" ?`)) {
                                try {
                                  await leaveWorkspace(workspace.id);
                                  // Recharger la page pour récupérer les modifications
                                  window.location.href = '/';
                                } catch (error) {
                                  console.error('Erreur lors de la sortie du workspace:', error);
                                  alert(error.message || "Erreur lors de la sortie du workspace");
                                }
                              }
                            }}
                            title="Quitter l'équipe"
                          >
                            <LogOut size={14} className="text-gray-500" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bouton ajouter équipe/workspace */}
            <div
              className="flex items-center gap-2 px-3 py-2 mt-1 text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors border-t border-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                onCreateWorkspace();
                toggleDropdown();
              }}
            >
              <Plus size={16} className="text-gray-500" />
              <span className="text-sm">Créer une équipe</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceSelector;
