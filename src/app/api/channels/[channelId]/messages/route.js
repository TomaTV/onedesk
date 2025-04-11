import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getChannelMessages, addMessage } from "@/lib/messages";
import { executeQuery } from "@/lib/db";

// GET - Récupérer les messages d'un channel
export async function GET(request, context) {
  try {
    // Récupération des paramètres asynchrones dans Next.js 14+
    const params = await context.params;
    const channelIdStr = params.channelId;
    if (!channelIdStr) {
      return NextResponse.json(
        { error: "Bad Request", message: "ID de channel manquant" },
        { status: 400 }
      );
    }

    const channelId = parseInt(channelIdStr, 10);
    
    const session = await getServerSession();
    
    // Vérifier si l'utilisateur est authentifié
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Vous devez être connecté" },
        { status: 401 }
      );
    }
    
    // Vérifier que l'ID du channel est valide
    if (isNaN(channelId)) {
      return NextResponse.json(
        { error: "Bad Request", message: "ID de channel invalide" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur a accès à ce channel
    const [userAccess] = await executeQuery({
      query: `
        SELECT 1 FROM channels c
        JOIN workspace_members wm ON c.workspace_id = wm.workspace_id
        JOIN users u ON wm.user_id = u.id
        WHERE c.id = ? AND u.email = ?
      `,
      values: [channelId, session.user.email],
    });

    if (!userAccess) {
      return NextResponse.json(
        { error: "Forbidden", message: "Vous n'avez pas accès à ce channel" },
        { status: 403 }
      );
    }

    // Récupérer les paramètres de pagination
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    // Récupérer les messages
    const messages = await getChannelMessages(channelId, limit, offset);

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error in GET /api/channels/[channelId]/messages:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}

// POST - Ajouter un nouveau message
export async function POST(request, context) {
  try {
    // Récupération des paramètres asynchrones dans Next.js 14+
    const params = await context.params;
    const channelIdStr = params.channelId;
    if (!channelIdStr) {
      return NextResponse.json(
        { error: "Bad Request", message: "ID de channel manquant" },
        { status: 400 }
      );
    }

    const channelId = parseInt(channelIdStr, 10);

    const session = await getServerSession();
    
    // Vérifier si l'utilisateur est authentifié
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Vous devez être connecté" },
        { status: 401 }
      );
    }
    
    // Vérifier que l'ID du channel est valide
    if (isNaN(channelId)) {
      return NextResponse.json(
        { error: "Bad Request", message: "ID de channel invalide" },
        { status: 400 }
      );
    }

    // Récupérer l'ID de l'utilisateur à partir de son email
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

    // Vérifier que l'utilisateur a accès à ce channel
    const [userAccess] = await executeQuery({
      query: `
        SELECT 1 FROM channels c
        JOIN workspace_members wm ON c.workspace_id = wm.workspace_id
        WHERE c.id = ? AND wm.user_id = ?
      `,
      values: [channelId, user.id],
    });

    if (!userAccess) {
      return NextResponse.json(
        { error: "Forbidden", message: "Vous n'avez pas accès à ce channel" },
        { status: 403 }
      );
    }

    // Récupérer le contenu du message
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "Bad Request", message: "Le message ne peut pas être vide" },
        { status: 400 }
      );
    }

    // Ajouter le message
    const message = await addMessage(channelId, user.id, content);

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/channels/[channelId]/messages:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}