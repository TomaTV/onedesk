import React from 'react';
import Image from 'next/image';

import { ChevronDown, Plus } from 'lucide-react';

import User from '@/components/user/User';

const Sidebar = () => {
  // Données mockées pour les pages/channels
  const pages = [
    { id: 1, name: 'Dashboard', icon: '❇️' },
  ];

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Sidebar principale style Notion */}
      <div className="w-56 h-full flex flex-col">
        {/* En-tête avec logo et nom */}
        <div className="flex items-center px-4 py-4">
          <div className="flex items-center gap-2.5">
            <Image
              src="/1desk.svg"
              alt="Onedesk"
              width={22}
              height={22}
              priority
              className="text-blue-600"
            />
            <h1 className="font-medium text-gray-800 text-base tracking-tight">Onedesk</h1>
          </div>
        </div>

        {/* Sélecteur de workspace */}
        <div className="px-4 py-2">
          <button className="flex items-center justify-between w-full px-2 py-1.5 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors duration-150">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">W</span>
              </div>
              <span>Workspace</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Pages/Channels */}
        <div className="py-5 px-3 flex-grow overflow-auto">
          <div>
            <div className="flex justify-between items-center px-1 mb-3">
              <span className="text-xs font-medium text-gray-400 tracking-wide">ESPACES DE TRAVAIL</span>
            </div>

            {/* Liste des pages */}
            {pages.map(page => (
              <div 
                key={page.id} 
                className={`flex items-center gap-2.5 px-2 py-1.5 my-1 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-150 cursor-pointer ${page.id === 1 ? 'bg-blue-50 text-blue-600 hover:bg-blue-50' : ''}`}
              >
                <span className="text-base">{page.icon}</span>
                <span className="text-sm font-medium">{page.name}</span>
              </div>
            ))}
            
            {/* Bouton d'ajout d'espace */}
            <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 py-1.5 px-2 mt-1 rounded-md hover:bg-gray-100 transition-colors duration-150 w-full">
              <Plus className="w-4 h-4" />
              <span className="text-sm">Ajouter un espace</span>
            </button>
          </div>
        </div>
      </div>
      <User/>
    </div>
  );
};

export default Sidebar;