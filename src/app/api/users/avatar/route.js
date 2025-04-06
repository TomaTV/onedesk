import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { updateUser } from "@/lib/users";

// POST /api/users/avatar - Change l'avatar d'un utilisateur
export async function POST(request) {
  try {
    const body = await request.json();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    if (!body.image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    try {
      const updatedUser = await updateUser(userId, {
        avatar: body.image,
      });

      return NextResponse.json({
        success: true,
        message: "Avatar updated successfully",
        user: updatedUser,
      });
    } catch (updateError) {
      console.error("Erreur lors de la mise à jour:", updateError);
      return NextResponse.json(
        { error: "Failed to update avatar", details: updateError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error updating avatar:", error);
    return NextResponse.json(
      { error: "Failed to process avatar update" },
      { status: 500 }
    );
  }
}
