import { NextResponse } from 'next/server';
import { getInvitationByToken, deleteInvitation } from '@/lib/invitations';
import { getWorkspaceById, addWorkspaceMember } from '@/lib/workspaces';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { isWorkspaceMember } from '@/lib/users';

// POST /api/invitations/accept - Accepte une invitation
export async function POST(request) {
  try {
    const body = await request.json();
    const { token } = body;
    
    // Validation de base
    if (!token) {
      return NextResponse.json({ error: 'Invitation token is required' }, { status: 400 });
    }
    
    // Récupérer la session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Récupérer l'invitation
    const invitation = await getInvitationByToken(token);
    
    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      );
    }
    
    // Récupérer les détails du workspace
    const workspace = await getWorkspaceById(invitation.workspace_id);
    
    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }
    
    // Vérifier si l'utilisateur est déjà membre
    const isMember = await isWorkspaceMember(session.user.id, workspace.id);
    
    if (isMember) {
      return NextResponse.json({
        message: 'User is already a member of this workspace',
        alreadyMember: true,
        workspace: {
          id: workspace.id,
          name: workspace.name
        }
      });
    }
    
    // Vérifier si l'email de l'invitation correspond
    const emailMatches = invitation.email.toLowerCase() === session.user.email.toLowerCase();
    
    // Ajouter l'utilisateur au workspace
    await addWorkspaceMember(workspace.id, session.user.id, 'member');
    
    // Si l'email correspond, supprimer l'invitation
    if (emailMatches) {
      await deleteInvitation(token);
    }
    
    return NextResponse.json({
      success: true,
      emailMatches,
      workspace: {
        id: workspace.id,
        name: workspace.name,
        letter: workspace.letter,
        color: workspace.color
      },
      message: emailMatches 
        ? 'Invitation acceptée avec succès'
        : 'Invitation acceptée, mais notez que cette invitation était initialement destinée à ' + invitation.email
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation', details: error.message },
      { status: 500 }
    );
  }
}
