import { NextResponse } from 'next/server';
import { getUserById, updateUser } from '@/lib/users';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// GET /api/users/me - Récupère les informations de l'utilisateur courant
export async function GET(request) {
  try {
    // Récupérer la session de l'utilisateur courant
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const user = await getUserById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}

// PATCH /api/users/me - Met à jour les informations de l'utilisateur courant
export async function PATCH(request) {
  try {
    // Récupérer la session de l'utilisateur courant
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const body = await request.json();
    
    // Vérifier si l'utilisateur existe
    const existingUser = await getUserById(userId);
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Valider que les champs autorisés sont mis à jour
    const updatedUser = await updateUser(userId, {
      name: body.name !== undefined ? body.name : existingUser.name,
      email: body.email !== undefined ? body.email : existingUser.email,
      avatar: body.avatar !== undefined ? body.avatar : existingUser.avatar
    });
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user data:', error);
    return NextResponse.json(
      { error: 'Failed to update user data' },
      { status: 500 }
    );
  }
}
