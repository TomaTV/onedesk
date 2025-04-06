import { NextResponse } from 'next/server';
import { addWorkspaceMember } from '@/lib/workspaces';
import { isWorkspaceAdmin, isWorkspaceMember, getUserByEmail } from '@/lib/users';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getUserWorkspaces } from '@/lib/workspaces';

// POST /api/workspaces/[workspace]/members - Ajoute un membre à un workspace
export async function POST(request, { params }) {
  try {
    // Attendre les paramètres avant de les utiliser
    const resolvedParams = await params;
    const workspaceName = decodeURIComponent(resolvedParams.workspace);
    const body = await request.json();
    
    // Récupérer la session de l'utilisateur courant
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const currentUserId = session.user.id;
    
    // Trouver le workspace par son nom
    const userWorkspaces = await getUserWorkspaces(currentUserId);
    const workspace = userWorkspaces.find(w => 
      w.name.toLowerCase() === workspaceName.toLowerCase()
    );
    
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }
    
    const workspaceId = workspace.id;
    
    // Vérifier si l'utilisateur courant est admin (sauf s'il s'ajoute lui-même via une invitation)
    if (body.userId !== currentUserId) {
      const isAdmin = await isWorkspaceAdmin(currentUserId, workspaceId);
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Only workspace admins can add members' },
          { status: 403 }
        );
      }
    }
    
    // Vérifier si l'utilisateur est déjà membre
    const isMember = await isWorkspaceMember(body.userId, workspaceId);
    if (isMember) {
      return NextResponse.json(
        { error: 'User is already a member' },
        { status: 400 }
      );
    }
    
    // Ajouter le membre
    await addWorkspaceMember(workspaceId, body.userId, body.role || 'member');
    
    return NextResponse.json(
      { message: 'Member added successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding member:', error);
    return NextResponse.json(
      { error: 'Failed to add member' },
      { status: 500 }
    );
  }
}
