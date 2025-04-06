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
          // Vérifier les détails de l'invitation
          const invitationResponse = await fetch(`/api/invitations/${token}`, {
            cache: 'no-store',
            method: "GET"
          });
          
          if (!invitationResponse.ok) {
            const errorData = await invitationResponse.json();
            throw new Error(errorData.error || "Invitation invalide ou expirée");
          }
          
          const invitationData = await invitationResponse.json();
          console.log('Détails de l\'invitation:', invitationData);
          
          // Accepter l'invitation en utilisant la nouvelle API
          const acceptResponse = await fetch('/api/invitations/accept', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token: token
            }),
          });
          
          if (!acceptResponse.ok) {
            const errorData = await acceptResponse.json();
            throw new Error(errorData.error || "Échec de l'acceptation de l'invitation");
          }
          
          const acceptData = await acceptResponse.json();
          console.log('Résultat de l\'acceptation:', acceptData);
          
          // Si l'utilisateur est déjà membre, rediriger vers le workspace
          if (acceptData.alreadyMember) {
            router.push(`/${encodeURIComponent(acceptData.workspace.name)}`);
            return;
          }
          
          // Préparer les données à afficher
          setInvitation({
            ...acceptData.workspace,
            warning: acceptData.emailMatches ? null : acceptData.message
          });
          
          // Rediriger vers le workspace après un court délai
          setTimeout(() => {
            router.push(`/${encodeURIComponent(acceptData.workspace.name)}`);
          }, 3000);
          
        } catch (err) {
          console.error('Error accepting invitation:', err);
          setError(err.message || "Invitation invalide ou expirée");
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
        {invitation?.warning && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <p className="text-yellow-700 text-sm">{invitation.warning}</p>
          </div>
        )}
        <button
          onClick={() => router.push(`/${encodeURIComponent(invitation?.name)}`)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
