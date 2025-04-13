import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { executeQuery } from '@/lib/db';

// Empêcher la mise en cache de la réponse de cette route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/invitations/pending - Récupère les invitations en attente pour l'utilisateur courant
export async function GET(request) {
  try {
    // Récupérer la session de l'utilisateur courant
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userEmail = session.user.email;
    
    // Récupérer les invitations en attente pour cet email
    // Optimisation de la requête SQL avec un index sur l'email et expires_at
    const query = `
      SELECT wi.*, w.name as workspace_name, w.letter as workspace_letter, w.color as workspace_color
      FROM workspace_invitations wi
      JOIN workspaces w ON wi.workspace_id = w.id
      WHERE wi.email = ? AND wi.expires_at > CURRENT_TIMESTAMP
      ORDER BY wi.created_at DESC
      LIMIT 10
    `;
    
    const invitations = await executeQuery({
      query,
      values: [userEmail],
    });
    
    // Ajouter des en-têtes pour empêcher la mise en cache côté client
    return NextResponse.json(invitations, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error fetching pending invitations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }
}
