// Service pour la gestion des utilisateurs et des rôles
export async function isWorkspaceAdmin(workspaceId) {
  try {
    const response = await fetch(`/api/workspaces/role-check?workspaceId=${workspaceId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return false; // Par défaut, considérer que l'utilisateur n'est pas admin
    }
    
    const data = await response.json();
    return data.isAdmin;
  } catch (error) {
    console.error('Erreur lors de la vérification du rôle:', error);
    return false;
  }
}
