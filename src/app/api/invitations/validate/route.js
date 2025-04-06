import { NextResponse } from 'next/server';
import { getInvitationByToken } from '@/lib/invitations';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// POST /api/invitations/validate - Valide un jeton d'invitation pour l'utilisateur actuel
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
      return NextResponse.json({ 
        valid: false, 
        error: 'Invalid or expired invitation' 
      });
    }
    
    // Vérifier si l'invitation est pour l'utilisateur actuel
    const isForCurrentUser = invitation.email.toLowerCase() === session.user.email.toLowerCase();
    
    return NextResponse.json({
      valid: true,
      isForCurrentUser,
      workspaceId: invitation.workspace_id,
      workspaceName: invitation.workspace_name
    });
  } catch (error) {
    console.error('Error validating invitation:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to validate invitation' },
      { status: 500 }
    );
  }
}
