import { NextResponse } from 'next/server';
import { getWorkspaceById } from '@/lib/workspaces';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request, { params }) {
  try {
    // Attendre les paramètres avant de les utiliser
    const resolvedParams = await params;
    const workspaceId = resolvedParams.id;
    
    // Récupérer la session de l'utilisateur courant
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Obtenir les détails du workspace
    const workspace = await getWorkspaceById(workspaceId);
    
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }
    
    return NextResponse.json(workspace);
  } catch (error) {
    console.error('Error fetching workspace by ID:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspace' },
      { status: 500 }
    );
  }
}
