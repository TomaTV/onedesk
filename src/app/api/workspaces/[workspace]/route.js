import { NextResponse } from "next/server";
import {
  getUserWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
} from "@/lib/workspaces";
import { isWorkspaceMember, isWorkspaceAdmin } from "@/lib/users";
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

// GET /api/workspaces/[workspace] - Récupère les détails d'un workspace par son nom
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

    return NextResponse.json(workspace);
  } catch (error) {
    console.error("Error fetching workspace:", error);
    return NextResponse.json(
      { error: "Failed to fetch workspace" },
      { status: 500 }
    );
  }
}

// PATCH /api/workspaces/[workspace] - Met à jour un workspace par son nom
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

    // Trouver le workspace par son nom
    const workspace = await findWorkspaceByName(workspaceName, userId);

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est admin du workspace
    const isAdmin = await isWorkspaceAdmin(userId, workspace.id);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only workspace admins can update workspace settings" },
        { status: 403 }
      );
    }

    const updatedWorkspace = await updateWorkspace(workspace.id, body);

    return NextResponse.json(updatedWorkspace);
  } catch (error) {
    console.error("Error updating workspace:", error);
    return NextResponse.json(
      { error: "Failed to update workspace" },
      { status: 500 }
    );
  }
}

// DELETE /api/workspaces/[workspace] - Supprime un workspace par son nom
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

    // Trouver le workspace par son nom
    const workspace = await findWorkspaceByName(workspaceName, userId);

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est admin du workspace
    const isAdmin = await isWorkspaceAdmin(userId, workspace.id);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only workspace admins can delete workspaces" },
        { status: 403 }
      );
    }

    const result = await deleteWorkspace(workspace.id);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to delete workspace" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Workspace deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting workspace:", error);
    return NextResponse.json(
      { error: "Failed to delete workspace" },
      { status: 500 }
    );
  }
}
