// Service pour la gestion des workspaces côté client
export async function leaveWorkspace(workspaceId) {
  try {
    const response = await fetch('/api/workspaces/leave', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ workspaceId }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to leave workspace');
    }
    
    return data;
  } catch (error) {
    console.error('Error leaving workspace:', error);
    throw error;
  }
}
