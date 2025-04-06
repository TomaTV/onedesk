"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User, Settings, Bell, LogOut, Edit2, ArrowLeft } from "lucide-react";
import UserProfileModal from "@/components/modals/UserProfileModal";
import { signOut } from "next-auth/react";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const router = useRouter();

  // Fonction pour charger les données de l'utilisateur
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users/me", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await response.json();

      // Ajouter une vérification et un fallback pour l'avatar
      if (!userData.avatar && userData.image) {
        userData.avatar = userData.image;
      }

      setUser(userData);
    } catch (err) {
      console.error("Erreur de chargement des données utilisateur:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données de l'utilisateur au chargement initial
  useEffect(() => {
    fetchUserData();
  }, []);

  // Sauvegarder les modifications du profil
  const handleSaveProfile = async (profileData) => {
    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Recharger les données utilisateur complètes après la mise à jour
      await fetchUserData();

      return true;
    } catch (err) {
      console.error("Error updating profile:", err);
      return false;
    }
  };

  // Fonction pour se déconnecter
  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Retour à la page précédente
  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">Erreur</h2>
          <p className="text-gray-700">{error}</p>
          <button
            className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
            onClick={handleBack}
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Paramètres</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <nav className="p-2">
                <button
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center space-x-3 ${
                    activeTab === "profile"
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveTab("profile")}
                >
                  <User
                    size={18}
                    className={
                      activeTab === "profile"
                        ? "text-indigo-600"
                        : "text-gray-500"
                    }
                  />
                  <span>Profil</span>
                </button>

                <button
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center space-x-3 ${
                    activeTab === "preferences"
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveTab("preferences")}
                >
                  <Settings
                    size={18}
                    className={
                      activeTab === "preferences"
                        ? "text-indigo-600"
                        : "text-gray-500"
                    }
                  />
                  <span>Préférences</span>
                </button>

                <button
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center space-x-3 ${
                    activeTab === "notifications"
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveTab("notifications")}
                >
                  <Bell
                    size={18}
                    className={
                      activeTab === "notifications"
                        ? "text-indigo-600"
                        : "text-gray-500"
                    }
                  />
                  <span>Notifications</span>
                </button>

                <button
                  className="w-full text-left px-3 py-2 rounded-md flex items-center space-x-3 text-red-600 hover:bg-red-50 mt-4"
                  onClick={handleLogout}
                >
                  <LogOut size={18} className="text-red-500" />
                  <span>Déconnexion</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {activeTab === "profile" && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Informations personnelles
                  </h2>

                  <div className="border-b border-gray-200 pb-5 flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center relative group">
                        {user && user.avatar ? (
                          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center relative group">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error("Erreur de chargement avatar", e);
                                e.target.style.display = "none";
                              }}
                            />
                            <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs text-center py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              Modifiable
                            </div>
                          </div>
                        ) : (
                          <div className="text-2xl font-semibold text-gray-400">
                            {user?.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-medium text-gray-900">
                          {user.name}
                        </h3>
                        <p className="text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <button
                      className="text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                      onClick={() => setProfileModalOpen(true)}
                    >
                      <Edit2 size={16} />
                      <span>Modifier</span>
                    </button>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Informations du compte
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Date d'inscription
                        </p>
                        <p className="mt-1 text-black">
                          {new Date(user.created_at).toLocaleDateString(
                            "fr-FR",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Dernière mise à jour
                        </p>
                        <p className="mt-1 text-black">
                          {new Date(user.updated_at).toLocaleDateString(
                            "fr-FR",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "preferences" && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Préférences d'affichage
                  </h2>
                  <p className="text-gray-500">
                    Ces fonctionnalités seront disponibles prochainement.
                  </p>
                </div>
              )}

              {activeTab === "notifications" && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Paramètres de notifications
                  </h2>
                  <p className="text-gray-500">
                    Ces fonctionnalités seront disponibles prochainement.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal de modification du profil */}
      <UserProfileModal
        user={user}
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onSave={handleSaveProfile}
      />
    </div>
  );
};

export default SettingsPage;
