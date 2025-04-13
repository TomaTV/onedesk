// Service pour gérer les invitations
export async function getUserInvitations(email, cacheBuster = null) {
  try {
    // Construire l'URL avec cache-buster pour éviter complètement la mise en cache
    let url = '/api/invitations/pending';
    if (cacheBuster) {
      url += `?t=${cacheBuster}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      // Désactiver complètement le cache pour toujours obtenir les dernières invitations
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des invitations');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur getUserInvitations:', error);
    return [];
  }
}

export async function acceptInvitation(token) {
  try {
    const response = await fetch('/api/invitations/accept', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de l\'acceptation de l\'invitation');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur acceptInvitation:', error);
    throw error;
  }
}

export async function rejectInvitation(token) {
  try {
    const response = await fetch(`/api/invitations/${token}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors du rejet de l\'invitation');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur rejectInvitation:', error);
    throw error;
  }
}
