import { NextResponse } from "next/server";
import { getUserWorkspaces, createWorkspace } from "@/lib/workspaces";
import { createChannel } from "@/lib/channels";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/workspaces - Récupère tous les workspaces d'un utilisateur
export async function GET(request) {
  try {
    // Récupérer la session de l'utilisateur courant
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const workspaces = await getUserWorkspaces(userId);
    return NextResponse.json(workspaces);
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return NextResponse.json(
      { error: "Failed to fetch workspaces" },
      { status: 500 }
    );
  }
}

// POST /api/workspaces - Crée un nouveau workspace
export async function POST(request) {
  try {
    const body = await request.json();

    // Récupérer la session de l'utilisateur courant
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validation de base
    if (!body.name || !body.letter || !body.color) {
      return NextResponse.json(
        { error: "Name, letter and color are required" },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Créer le workspace
    const workspace = await createWorkspace(body, userId);
    
    // Créer automatiquement un channel par défaut
    if (workspace && workspace.id) {
      try {
        await createChannel({
          name: "Général",
          type: "custom",
          emoji: "👋",
          workspaceId: workspace.id,
          createdBy: userId
        });
        
        // Optionnellement créer un deuxième channel
        await createChannel({
          name: "Documents",
          type: "file",
          workspaceId: workspace.id,
          createdBy: userId
        });
      } catch (channelError) {
        console.error("Error creating default channels:", channelError);
        // On continue même si la création du channel échoue
      }
    }

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    console.error("Error creating workspace:", error);
    return NextResponse.json(
      { error: "Failed to create workspace" },
      { status: 500 }
    );
  }
}
