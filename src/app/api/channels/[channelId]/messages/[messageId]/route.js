import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { updateMessage, deleteMessage } from "@/lib/messages";
import { executeQuery } from "@/lib/db";

// PATCH - Modifier un message existant
export async function PATCH(request, context) {
  try {
    // Récupération des paramètres asynchrones dans Next.js 14+
    const params = await context.params;
    const channelIdStr = params.channelId;
    const messageIdStr = params.messageId;
    if (!channelIdStr || !messageIdStr) {
      return NextResponse.json(
        { error: "Bad Request", message: "IDs manquants" },
        { status: 400 }
      );
    }

    const channelId = parseInt(channelIdStr, 10);
    const messageId = parseInt(messageIdStr, 10);
    
    const session = await getServerSession();
    
    // Vérifier si l'utilisateur est authentifié
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Vous devez être connecté" },
        { status: 401 }
      );
    }
    
    // Vérifier que les IDs sont valides
    if (isNaN(channelId) || isNaN(messageId)) {
      return NextResponse.json(
        { error: "Bad Request", message: "ID invalide" },
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

    // Récupérer le contenu du message mis à jour
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "Bad Request", message: "Le message ne peut pas être vide" },
        { status: 400 }
      );
    }

    // Mettre à jour le message
    try {
      const updatedMessage = await updateMessage(messageId, user.id, content);
      return NextResponse.json(updatedMessage);
    } catch (error) {
      if (error.message.includes("only edit your own")) {
        return NextResponse.json(
          { error: "Forbidden", message: error.message },
          { status: 403 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Error in PATCH /api/channels/[channelId]/messages/[messageId]:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un message
export async function DELETE(request, context) {
  try {
    // Récupération des paramètres asynchrones dans Next.js 14+
    const params = await context.params;
    const channelIdStr = params.channelId;
    const messageIdStr = params.messageId;
    if (!channelIdStr || !messageIdStr) {
      return NextResponse.json(
        { error: "Bad Request", message: "IDs manquants" },
        { status: 400 }
      );
    }

    const channelId = parseInt(channelIdStr, 10);
    const messageId = parseInt(messageIdStr, 10);
    
    const session = await getServerSession();
    
    // Vérifier que les IDs sont valides
    if (isNaN(channelId) || isNaN(messageId)) {
      return NextResponse.json(
        { error: "Bad Request", message: "ID invalide" },
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

    // Vérifier que le message existe et appartient au bon channel
    const [message] = await executeQuery({
      query: "SELECT 1 FROM messages WHERE id = ? AND channel_id = ?",
      values: [messageId, channelId],
    });

    if (!message) {
      return NextResponse.json(
        { error: "Not Found", message: "Message non trouvé" },
        { status: 404 }
      );
    }

    // Supprimer le message
    try {
      const success = await deleteMessage(messageId, user.id);
      
      if (success) {
        return NextResponse.json({ message: "Message supprimé avec succès" });
      } else {
        return NextResponse.json(
          { error: "Bad Request", message: "Impossible de supprimer le message" },
          { status: 400 }
        );
      }
    } catch (error) {
      if (error.message.includes("only delete your own")) {
        return NextResponse.json(
          { error: "Forbidden", message: error.message },
          { status: 403 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Error in DELETE /api/channels/[channelId]/messages/[messageId]:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}