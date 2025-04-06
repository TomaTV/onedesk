import { NextResponse } from "next/server";
import { getWorkspaceChannels, createChannel } from "@/lib/channels";
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

// GET /api/workspaces/[workspace]/channels - Récupère tous les channels d'un workspace par son nom
export async function GET(request, { params }) {
  try {
    // Important: attendre les paramètres avant de les utiliser
    const resolvedParams = await params;
    
    // Récupérer la session de l'utilisateur courant
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const workspaceName = decodeURIComponent(resolvedParams.workspace);

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

    const channels = await getWorkspaceChannels(workspace.id);

    return NextResponse.json(channels);
  } catch (error) {
    console.error("Error fetching channels:", error);
    return NextResponse.json(
      { error: "Failed to fetch channels" },
      { status: 500 }
    );
  }
}

// POST /api/workspaces/[workspace]/channels - Crée un nouveau channel dans un workspace par son nom
export async function POST(request, { params }) {
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

    // Trouver le workspace par son nom
    const workspace = await findWorkspaceByName(workspaceName, userId);

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    // Validation de base
    if (!body.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Vérifier que l'utilisateur est membre du workspace
    const isMember = await isWorkspaceMember(userId, workspace.id);

    if (!isMember) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const channelData = {
      ...body,
      workspaceId: workspace.id,
      createdBy: userId,
    };

    const channel = await createChannel(channelData);

    return NextResponse.json(channel, { status: 201 });
  } catch (error) {
    console.error("Error creating channel:", error);
    return NextResponse.json(
      { error: "Failed to create channel" },
      { status: 500 }
    );
  }
}
