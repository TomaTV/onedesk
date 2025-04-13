import { NextResponse } from 'next/server';
import { createInvitation, hasExistingInvitation } from '@/lib/invitations';
import { isWorkspaceAdmin, getUserById } from '@/lib/users';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getWorkspaceById } from '@/lib/workspaces';
import { getSocketInstance, initSocketServer } from '@/lib/services/socket/socket-server';

// POST /api/invitations - Crée une nouvelle invitation
export async function POST(request) {
  try {
    const body = await request.json();
    const { workspaceId, email } = body;
    
    // Validation de base
    if (!workspaceId || !email) {
      return NextResponse.json({ error: 'Workspace ID and email are required' }, { status: 400 });
    }
    
    // Récupérer la session de l'utilisateur courant
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const currentUserId = session.user.id;
    
    // Vérifier si l'utilisateur courant est admin du workspace
    const isAdmin = await isWorkspaceAdmin(currentUserId, workspaceId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only workspace admins can send invitations' },
        { status: 403 }
      );
    }
    
    // Vérifier si l'email a déjà une invitation active pour ce workspace
    const hasInvitation = await hasExistingInvitation(workspaceId, email);
    if (hasInvitation) {
      return NextResponse.json(
        { error: 'This email already has an active invitation for this workspace' },
        { status: 400 }
      );
    }
    
    // Créer l'invitation
    const token = await createInvitation(workspaceId, email);
    
    // Construire le lien d'invitation
    const baseUrl = request.headers.get('origin') || 'http://localhost:3000';
    const invitationLink = `${baseUrl}/invite/${token}`;
    
    // Obtenir le nom de l'utilisateur courant
    const currentUser = await getUserById(currentUserId);
    
    // Obtenir les détails du workspace
    const workspace = await getWorkspaceById(workspaceId);
    
    // Envoyer une notification à l'utilisateur via Socket.IO
    try {
      // Obtenir l'instance Socket.IO
      const io = getSocketInstance();
      console.log("[DEBUG] Statut Socket.IO:", {
        io: !!io,
        hasSendNotification: io && typeof io.sendNotification === 'function'
      });
      
      if (!io) {
        console.error('[DEBUG] Socket.IO n\'est pas initialisé. Vérifiez que le serveur Socket.IO a été démarré.');
        // Tentons d'initialiser Socket.IO ici
        const initResult = initSocketServer();
        console.log('[DEBUG] Tentative d\'initialisation de Socket.IO:', !!initResult);
        
        // Vérifions à nouveau
        const io2 = getSocketInstance();
        console.log('[DEBUG] Statut Socket.IO après tentative d\'initialisation:', {
          io: !!io2,
          hasSendNotification: io2 && typeof io2.sendNotification === 'function'
        });
      }
      
      // Construire la notification
      const notification = {
        type: 'invitation',
        token,
        workspaceId,
        workspaceName: workspace?.name || 'Workspace',
        from: currentUser?.name || 'Un utilisateur',
        timestamp: new Date().toISOString()
      };
      
      // Utiliser la dernière instance, qu'elle soit originale ou nouvellement créée
      const socketIO = io || getSocketInstance();
      
      if (socketIO && typeof socketIO.sendNotification === 'function') {
        
        // Utiliser la méthode d'aide pour envoyer la notification
        const sent = socketIO.sendNotification(email, notification);
        if (!sent) {
          console.warn(`Envoi de notification échoué pour ${email}`);
        }
      } else {
        console.error('Instance Socket.IO non disponible ou méthode sendNotification manquante');
        
        // Essayons au moins d'envoyer manuellement
        if (socketIO) {
          try {
            const userRoom = `user:${email}`;
            socketIO.to(userRoom).emit('notification', notification);
            socketIO.to(userRoom).emit('invitation', notification);
            console.log('[DEBUG] Notification envoyée manuellement à', userRoom);
          } catch (err) {
            console.error('[DEBUG] Échec d\'envoi manuel de notification:', err);
          }
        }
      }
    } catch (notificationError) {
      console.error('Erreur lors de l\'envoi de la notification Socket.IO:', notificationError);
    }
    
    return NextResponse.json({
      token,
      link: invitationLink,
      message: 'Invitation created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    );
  }
}
