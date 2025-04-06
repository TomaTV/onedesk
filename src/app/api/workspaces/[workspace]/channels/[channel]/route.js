import { NextResponse } from "next/server";
import {
  getWorkspaceChannels,
  updateChannel,
  deleteChannel,
} from "@/lib/channels";
import { isWorkspaceMember } from "@/lib/users";
import { getUserWorkspaces } from "@/lib/workspaces";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Fonction utilitaire pour trouver un workspace par son nom
async function findWorkspaceByName(workspaceName, userId) {
  // Récupérer tous les workspaces de l'utilisateur
  const userWorkspaces = await getUserWorkspaces(userId);

  // Trouver le workspace par son nom (insensible à la casse)
  const matchedWorkspace = userWorkspaces.find(
    (w) => w.name.toLowerCase() === workspaceName.toLowerCase()
  );

  return matchedWorkspace;
}

// Fonction utilitaire pour trouver un channel par son nom dans un workspace
async function findChannelByName(channelName, workspaceId) {
  // Récupérer tous les channels du workspace
  const channels = await getWorkspaceChannels(workspaceId);

  // Trouver le channel par son nom (insensible à la casse)
  const matchedChannel = channels.find(
    (c) => c.name.toLowerCase() === channelName.toLowerCase()
  );

  return matchedChannel;
}

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
    const isMember = await isWorkspaceMember(userId, workspace.id);

    if (!isMember) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Trouver le channel par son nom
    const channel = await findChannelByName(channelName, workspace.id);

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    return NextResponse.json(channel);
  } catch (error) {
    console.error("Error fetching channel:", error);
    return NextResponse.json(
      { error: "Failed to fetch channel" },
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

    // Vérifier que l'utilisateur est membre du workspace
    const isMember = await isWorkspaceMember(userId, workspace.id);

    if (!isMember) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Trouver le channel par son nom
    const channel = await findChannelByName(channelName, workspace.id);

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const updatedChannel = await updateChannel(channel.id, body);

    return NextResponse.json(updatedChannel);
  } catch (error) {
    console.error("Error updating channel:", error);
    return NextResponse.json(
      { error: "Failed to update channel" },
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
    const isMember = await isWorkspaceMember(userId, workspace.id);

    if (!isMember) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Trouver le channel par son nom
    const channel = await findChannelByName(channelName, workspace.id);

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const result = await deleteChannel(channel.id);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to delete channel" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Channel deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting channel:", error);
    return NextResponse.json(
      { error: "Failed to delete channel" },
      { status: 500 }
    );
  }
}
