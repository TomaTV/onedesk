import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { executeQuery } from "@/lib/db";

/**
 * GET - Récupérer tous les channels accessibles pour l'utilisateur actuel
 */
export async function GET(req) {
  try {
    const session = await getServerSession();
    
    // Vérifier si l'utilisateur est authentifié
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Vous devez être connecté" },
        { status: 401 }
      );
    }

    // Récupérer l'utilisateur à partir de son email
    const [user] = await executeQuery({
      query: "SELECT id FROM users WHERE email = ?",
      values: [session.user.email],
    });

    if (!user) {
      return NextResponse.json(
        { error: "Not Found", message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer tous les channels auxquels l'utilisateur a accès
    const channels = await executeQuery({
      query: `
        SELECT c.* 
        FROM channels c
        JOIN workspaces w ON c.workspace_id = w.id
        JOIN workspace_members wm ON w.id = wm.workspace_id
        WHERE wm.user_id = ?
        ORDER BY w.name, c.position
      `,
      values: [user.id],
    });

    return NextResponse.json(channels);
  } catch (error) {
    console.error("Error in GET /api/channels:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET - URL de support pour savoir si le service API est disponible
 */
export async function HEAD(req) {
  return NextResponse.json({ 
    status: "ok", 
    message: "Channels API is running"
  });
}
