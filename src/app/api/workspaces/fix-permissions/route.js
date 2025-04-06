import { NextResponse } from 'next/server';
import { getUserWorkspaces, ensureWorkspaceCreatorIsAdmin } from '@/lib/workspaces';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// POST /api/workspaces/fix-permissions - Vérifie et corrige les permissions de workspace pour l'utilisateur actuel
export async function POST(request) {
  try {
    // Récupérer la session de l'utilisateur courant
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Récupérer tous les workspaces de l'utilisateur
    const workspaces = await getUserWorkspaces(userId);
    
    if (workspaces.length === 0) {
      return NextResponse.json({ 
        message: 'No workspaces found for this user',
        fixed: 0
      });
    }
    
    // Identifier les workspaces où l'utilisateur est créateur 
    // et s'assurer qu'il est bien admin de ces workspaces
    const fixedPermissions = [];
    
    for (const workspace of workspaces) {
      if (workspace.created_by === userId) {
        // S'assurer que l'utilisateur est admin
        const fixed = await ensureWorkspaceCreatorIsAdmin(workspace.id, userId);
        
        if (fixed) {
          fixedPermissions.push({
            workspace_id: workspace.id,
            workspace_name: workspace.name,
            fixed
          });
        }
      }
    }
    
    return NextResponse.json({
      message: `Fixed permissions for ${fixedPermissions.length} workspaces`,
      fixed: fixedPermissions.length,
      workspaces: fixedPermissions
    });
  } catch (error) {
    console.error('Error fixing workspace permissions:', error);
    return NextResponse.json(
      { error: 'Failed to fix workspace permissions' },
      { status: 500 }
    );
  }
}
