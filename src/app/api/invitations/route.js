import { NextResponse } from 'next/server';
import { createInvitation, hasExistingInvitation } from '@/lib/invitations';
import { isWorkspaceAdmin } from '@/lib/users';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
