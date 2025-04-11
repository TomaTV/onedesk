import { NextResponse } from "next/server";
import {
  getWorkspaceChannels,
  updateChannel,
  deleteChannel,
} from "@/lib/channels";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { 
  findWorkspaceByName, 
  findChannelByName,
  checkWorkspaceAccess,
  validateChannelData
} from "@/lib/utils/workspace-utils";

// GET /api/workspaces/[workspace]/channels/[channel] - Récupère les détails d'un channel par son nom
export async function GET(request, { params }) {
  try {
    // Important: attendre les paramètres avant de les utiliser
    const resolvedParams = await params;
    
    // Récupérer la session de l'utilisateur courant
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const workspaceName = decodeURIComponent(resolvedParams.workspace);
    const channelName = decodeURIComponent(resolvedParams.channel);

    // Trouver le workspace par son nom
    const workspace = await findWorkspaceByName(workspaceName, userId);

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est membre du workspace
    const isMember = await checkWorkspaceAccess(userId, workspace.id);

    if (!isMember) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Le channel a déjà été récupéré plus haut

    return NextResponse.json(channel);
  } catch (error) {
    console.error("Error fetching channel:", error);
    return NextResponse.json(
      { error: "Failed to fetch channel", details: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/workspaces/[workspace]/channels/[channel] - Modifie un channel par son nom
export async function PATCH(request, { params }) {
  try {
    // Important: attendre les paramètres avant de les utiliser
    const resolvedParams = await params;
    
    const body = await request.json();

    // Récupérer la session de l'utilisateur courant
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const workspaceName = decodeURIComponent(resolvedParams.workspace);
    const channelName = decodeURIComponent(resolvedParams.channel);

    // Trouver le workspace par son nom
    const workspace = await findWorkspaceByName(workspaceName, userId);

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    // Trouver le channel par son nom
    const channel = await findChannelByName(channelName, workspace.id);

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    // Vérifier si l'utilisateur essaie de modifier le type
    if (body.type && body.type !== channel.type) {
      return NextResponse.json(
        { error: "Modification du type de channel non autorisée" },
        { status: 403 }
      );
    }

    // Validation améliorée
    const validation = validateChannelData(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur est membre du workspace
    const isMember = await checkWorkspaceAccess(userId, workspace.id);

    if (!isMember) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Trouver le channel par son nom
    const channel = await findChannelByName(channelName, workspace.id);

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    try {
      const updatedChannel = await updateChannel(channel.id, body);
      return NextResponse.json(updatedChannel);
    } catch (updateError) {
      console.error("Error updating channel:", updateError);
      return NextResponse.json(
        { error: "Failed to update channel", details: updateError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in PATCH channel:", error);
    return NextResponse.json(
      { error: "Failed to process request", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/workspaces/[workspace]/channels/[channel] - Supprime un channel par son nom
export async function DELETE(request, { params }) {
  try {
    // Important: attendre les paramètres avant de les utiliser
    const resolvedParams = await params;
    
    // Récupérer la session de l'utilisateur courant
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const workspaceName = decodeURIComponent(resolvedParams.workspace);
    const channelName = decodeURIComponent(resolvedParams.channel);

    // Trouver le workspace par son nom
    const workspace = await findWorkspaceByName(workspaceName, userId);

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est membre du workspace
    const isMember = await checkWorkspaceAccess(userId, workspace.id);

    if (!isMember) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Trouver le channel par son nom
    const channel = await findChannelByName(channelName, workspace.id);

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    // Supprimer le channel avec notre fonction améliorée
    try {
      const result = await deleteChannel(channel.id);

      if (!result || !result.success) {
        return NextResponse.json(
          { error: "Failed to delete channel" },
          { status: 500 }
        );
      }

      // Retourner des informations sur les channels restants
      return NextResponse.json({
        message: "Channel deleted successfully",
        remainingChannels: result.remainingChannels,
        workspaceId: result.workspaceId
      });
    } catch (deleteError) {
      console.error("Error during channel deletion:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete channel", details: deleteError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error deleting channel:", error);
    return NextResponse.json(
      { error: "Failed to process request", details: error.message },
      { status: 500 }
    );
  }
}
