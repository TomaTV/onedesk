"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bell, Settings, Loader2, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const UserProfile = ({ user, loading, error }) => {
  const router = useRouter();

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
    <div className="flex items-center justify-between">
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
          className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors"
          title="Notifications"
        >
          <Bell size={14} />
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
  );
};

export default UserProfile;
