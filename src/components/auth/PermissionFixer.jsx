"use client";
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

const PermissionFixer = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Ne faire la correction qu'une fois l'utilisateur authentifié
    if (status === 'authenticated' && session) {
      const fixPermissions = async () => {
        try {
          const response = await fetch('/api/workspaces/fix-permissions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.fixed > 0) {
              console.log(`✅ Permissions corrigées pour ${data.fixed} workspaces`);
            }
          }
        } catch (error) {
          console.error('Erreur lors de la correction des permissions:', error);
        }
      };

      // Exécuter la correction
      fixPermissions();
    }
  }, [status, session]);

  // Ce composant ne rend rien, il agit juste en arrière-plan
  return null;
};

export default PermissionFixer;
