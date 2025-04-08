import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { isWorkspaceAdmin } from '@/lib/users';

// GET /api/workspaces/role-check?workspaceId=123 - Vérifie si l'utilisateur est admin du workspace
export async function GET(request) {
  try {
    // Récupérer la session de l'utilisateur courant
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }
    
    // Récupérer le workspaceId depuis la query string
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    
    if (!workspaceId) {
      return NextResponse.json({ error: 'WorkspaceId is required' }, { status: 400 });
    }
    
    // Vérifier si l'utilisateur est admin du workspace
    const admin = await isWorkspaceAdmin(session.user.id, parseInt(workspaceId));
    
    return NextResponse.json({ isAdmin: admin });
  } catch (error) {
    console.error('Error checking admin role:', error);
    return NextResponse.json(
      { error: 'Failed to check admin role', isAdmin: false },
      { status: 500 }
    );
  }
}
