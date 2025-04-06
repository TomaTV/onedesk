"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function InvitePage({ params }) {
  const { token } = params;
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invitation, setInvitation] = useState(null);

  // Vérifier et accepter l'invitation
  useEffect(() => {
    const verifyInvitation = async () => {
      if (status === 'loading') return;
      
      try {
        // Si l'utilisateur n'est pas connecté, rediriger vers la connexion
        if (status === 'unauthenticated') {
          router.push(`/auth/signin?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`);
          return;
        }
        
        // Vérifier et accepter l'invitation
        setIsLoading(true);
        
        try {
          // Décoder le token pour obtenir le workspaceId
          const decodedToken = atob(token);
          const [workspaceId, timestamp] = decodedToken.split(':');
          
          // Si le token est trop ancien (plus de 7 jours)
          const tokenDate = new Date(parseInt(timestamp));
          const now = new Date();
          const daysDifference = (now - tokenDate) / (1000 * 60 * 60 * 24);
          
          if (daysDifference > 7) {
            setError("Cette invitation a expiré.");
            setIsLoading(false);
            return;
          }
          
          // Obtenir les détails du workspace
          const workspaceResponse = await fetch(`/api/workspaces/${workspaceId}`, {
            cache: 'no-store',
            method: "GET"
          });
          if (!workspaceResponse.ok) {
            throw new Error("Workspace not found");
          }
          
          const workspaceData = await workspaceResponse.json();
          setInvitation(workspaceData);
          
          // Accepter l'invitation en utilisant le nom du workspace plutôt que l'ID
          const acceptResponse = await fetch(`/api/workspaces/${encodeURIComponent(workspaceData.name)}/members`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: session.user.id,
              role: 'member'
            }),
          });
          
          if (!acceptResponse.ok) {
            const errorData = await acceptResponse.json();
            if (errorData.error === 'User is already a member') {
              // L'utilisateur est déjà membre
              router.push(`/`);
              return;
            }
            throw new Error(errorData.error || "Failed to join workspace");
          }
          
          // Rediriger vers le workspace après quelques secondes
          setTimeout(() => {
            router.push('/');
          }, 2000);
          
        } catch (err) {
          console.error('Error accepting invitation:', err);
          setError("Invitation invalide ou expirée");
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error processing invitation:', error);
        setError("Une erreur s'est produite lors du traitement de l'invitation");
        setIsLoading(false);
      }
    };

    verifyInvitation();
  }, [token, router, status, session]);

  // Affichage pendant le chargement
  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <Image 
              src="/1desk.svg" 
              alt="OneDesk" 
              width={48} 
              height={48}
            />
          </div>
          <h1 className="text-xl font-bold mb-4">Traitement de l'invitation</h1>
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        </div>
      </div>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <Image 
              src="/1desk.svg" 
              alt="OneDesk" 
              width={48} 
              height={48}
            />
          </div>
          <h1 className="text-xl font-bold mb-2">Invitation invalide</h1>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  // Affichage de succès
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <Image 
            src="/1desk.svg" 
            alt="OneDesk" 
            width={48} 
            height={48}
          />
        </div>
        <h1 className="text-xl font-bold mb-2">Invitation acceptée !</h1>
        <p className="text-gray-600 mb-4">
          Vous avez rejoint l'espace "{invitation?.name}".
          <br />
          Vous allez être redirigé automatiquement...
        </p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
