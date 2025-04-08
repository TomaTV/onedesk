import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { leaveWorkspace } from '@/lib/workspaces';

// POST /api/workspaces/leave - Permet à un utilisateur de quitter un workspace
export async function POST(request) {
  try {
    // Récupérer la session de l'utilisateur courant
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const body = await request.json();
    const { workspaceId } = body;
    
    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
    }
    
    try {
      // Tenter de quitter le workspace
      const success = await leaveWorkspace(workspaceId, userId);
      
      if (success) {
        return NextResponse.json({ 
          success: true,
          message: 'Successfully left the workspace'
        });
      } else {
        return NextResponse.json({ 
          success: false,
          message: 'Failed to leave the workspace'
        }, { status: 400 });
      }
    } catch (error) {
      // Gérer l'erreur si l'utilisateur est le seul admin
      return NextResponse.json({ 
        success: false,
        message: error.message
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error leaving workspace:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    );
  }
}
