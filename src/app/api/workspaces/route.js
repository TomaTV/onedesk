import { NextResponse } from "next/server";
import { getUserWorkspaces, createWorkspace } from "@/lib/workspaces";
import { createChannel } from "@/lib/channels";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { validateWorkspaceData } from "@/lib/utils/workspace-utils";
import { executeTransaction } from "@/lib/db";

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

// POST /api/workspaces - Crée un nouveau workspace avec channels par défaut
export async function POST(request) {
  try {
    const body = await request.json();

    // Récupérer la session de l'utilisateur courant
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validation améliorée
    const validation = validateWorkspaceData(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    try {
      // Utiliser une transaction pour créer le workspace et ses channels par défaut
      const operations = [
        // 1. Créer le workspace
        async (db) => {
          // Créer le workspace (cette fonction gère sa propre transaction)
          return await createWorkspace(body, userId);
        },
        
        // 2. Créer le channel "Général"
        async (db, results) => {
          const workspace = results[0];
          if (!workspace || !workspace.id) {
            throw new Error("Workspace creation failed");
          }
          
          return await createChannel({
            name: "Général",
            type: "custom",
            emoji: "👋", // 👋 = emoji main qui salue
            workspaceId: workspace.id,
            createdBy: userId
          });
        },
        
        // 3. Créer le channel "Documents"
        async (db, results) => {
          const workspace = results[0];
          if (!workspace || !workspace.id) {
            throw new Error("Workspace creation failed");
          }
          
          return await createChannel({
            name: "Documents",
            type: "file",
            workspaceId: workspace.id,
            createdBy: userId
          });
        }
      ];

      // Exécuter la transaction
      const results = await executeTransaction(operations);
      const workspace = results[0]; // Le workspace est retourné par la première opération

      return NextResponse.json(workspace, { status: 201 });
    } catch (error) {
      console.error("Transaction error:", error);
      return NextResponse.json(
        { error: "Failed to create workspace and channels", details: error.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in POST /api/workspaces:", error);
    return NextResponse.json(
      { error: "Failed to process request", details: error.message },
      { status: 500 }
    );
  }
}
