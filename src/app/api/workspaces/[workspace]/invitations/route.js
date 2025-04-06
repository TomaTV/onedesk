import { NextResponse } from 'next/server';
import { getWorkspaceInvitations } from '@/lib/invitations';
import { isWorkspaceAdmin } from '@/lib/users';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getUserWorkspaces } from '@/lib/workspaces';

// GET /api/workspaces/[workspace]/invitations - Récupère les invitations en attente pour un workspace
export async function GET(request, { params }) {
  try {
    // Attendre les paramètres avant de les utiliser
    const resolvedParams = await params;
    const workspaceId = resolvedParams.workspace;
    
    // Récupérer la session de l'utilisateur courant
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const currentUserId = session.user.id;
    
    // Vérifier si l'utilisateur est admin du workspace
    const isAdmin = await isWorkspaceAdmin(currentUserId, workspaceId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only workspace admins can view pending invitations' },
        { status: 403 }
      );
    }
    
    // Récupérer les invitations
    const invitations = await getWorkspaceInvitations(workspaceId);
    
    return NextResponse.json(invitations);
  } catch (error) {
    console.error('Error fetching workspace invitations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }
}
