import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getUserById, updateUser } from "@/lib/users";

// GET /api/users/me - Récupère les détails de l'utilisateur courant
export async function GET(request) {
  try {
    // Récupérer la session de l'utilisateur courant
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const user = await getUserById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Omettre les informations sensibles comme le mot de passe
    delete user.password;

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PATCH /api/users/me - Met à jour les informations de l'utilisateur courant
export async function PATCH(request) {
  try {
    const body = await request.json();

    // Récupérer la session de l'utilisateur courant
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Vérifier quels champs peuvent être mis à jour
    const updatableFields = {};
    
    if (body.name !== undefined) updatableFields.name = body.name;
    if (body.email !== undefined) updatableFields.email = body.email;
    
    // Pour l'image, nous utilisons le champ avatar
    if (body.image !== undefined) {
      // Log pour débogage
      console.log("API Users/me - mise à jour image:", body.image.substring(0, 50), "...");
      updatableFields.avatar = body.image;
    }
    
    // Ne pas permettre la mise à jour si aucun champ n'est fourni
    if (Object.keys(updatableFields).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }
    
    const updatedUser = await updateUser(userId, updatableFields);
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }
    
    // Omettre les informations sensibles
    delete updatedUser.password;
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
