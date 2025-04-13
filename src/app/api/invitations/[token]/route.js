import { NextResponse } from 'next/server';
import { getInvitationByToken, deleteInvitation } from '@/lib/invitations';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/invitations/[token] - Récupère les détails d'une invitation
export async function GET(request, context) {
  try {
    // Récupérer le token de l'URL plutôt que des params
    const url = request.url;
    const segments = url.split('/');
    const token = segments[segments.length - 1];
    
    // Validation
    if (!token) {
      return NextResponse.json({ error: 'Invitation token is required' }, { status: 400 });
    }
    
    // Récupérer les détails de l'invitation
    const invitation = await getInvitationByToken(token);
    
    if (!invitation) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 });
    }
    
    return NextResponse.json(invitation);
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitation' },
      { status: 500 }
    );
  }
}

// DELETE /api/invitations/[token] - Supprime une invitation après utilisation
export async function DELETE(request, context) {
  try {
    // Récupérer le token de l'URL plutôt que des params
    const url = request.url;
    const segments = url.split('/');
    const token = segments[segments.length - 1];
    
    // Récupérer la session de l'utilisateur courant
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Supprimer l'invitation
    const success = await deleteInvitation(token);
    
    if (!success) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Invitation deleted successfully' });
  } catch (error) {
    console.error('Error deleting invitation:', error);
    return NextResponse.json(
      { error: 'Failed to delete invitation' },
      { status: 500 }
    );
  }
}
