import { NextResponse } from "next/server";
import { getWorkspaceChannels, createChannel } from "@/lib/channels";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { 
  findWorkspaceByName, 
  checkWorkspaceAccess,
  validateChannelData
} from "@/lib/utils/workspace-utils";

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

    // Trouver le workspace par son nom (utilise la fonction d'utilitaire partagée)
    const workspace = await findWorkspaceByName(workspaceName, userId);

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est membre du workspace (utilise la fonction d'utilitaire partagée)
    const isMember = await checkWorkspaceAccess(userId, workspace.id);

    if (!isMember) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const channels = await getWorkspaceChannels(workspace.id);

    return NextResponse.json(channels);
  } catch (error) {
    console.error("Error fetching channels:", error);
    return NextResponse.json(
      { error: "Failed to fetch channels", details: error.message },
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

    // Trouver le workspace par son nom (utilise la fonction d'utilitaire partagée)
    const workspace = await findWorkspaceByName(workspaceName, userId);

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
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

    // Vérifier que l'utilisateur est membre du workspace (utilise la fonction d'utilitaire partagée)
    const isMember = await checkWorkspaceAccess(userId, workspace.id);

    if (!isMember) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const channelData = {
      ...body,
      workspaceId: workspace.id,
      createdBy: userId,
    };

    try {
      const channel = await createChannel(channelData);
      return NextResponse.json(channel, { status: 201 });
    } catch (channelError) {
      console.error("Error creating channel:", channelError);
      return NextResponse.json(
        { error: "Failed to create channel", details: channelError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in POST /api/workspaces/[workspace]/channels:", error);
    return NextResponse.json(
      { error: "Failed to process request", details: error.message },
      { status: 500 }
    );
  }
}
