// Note: Ceci est une implémentation simplifiée.
// Dans une application réelle, vous utiliseriez une solution complète comme NextAuth.js.

/**
 * Récupère l'utilisateur actuel depuis la session
 * @param {Object} request - Objet Request de Next.js
 * @returns {Promise<Object|null>} Données utilisateur ou null
 */
export async function getCurrentUser(request) {
  // Dans une application réelle, vous récupéreriez la session d'authentification
  // depuis un cookie ou un header d'autorisation
  
  // Pour cette démonstration, nous simulons un utilisateur connecté
  return {
    id: 1,
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com'
  };
}

/**
 * Vérifie si un utilisateur est authentifié
 * @param {Object} request - Objet Request de Next.js
 * @returns {Promise<boolean>} True si l'utilisateur est authentifié
 */
export async function isAuthenticated(request) {
  const user = await getCurrentUser(request);
  return !!user;
}

/**
 * Middleware pour vérifier l'authentification
 * @param {Function} handler - Handler de route API
 * @returns {Function} Middleware fonction
 */
export function withAuth(handler) {
  return async (request, params) => {
    const isAuth = await isAuthenticated(request);
    
    if (!isAuth) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    return handler(request, params);
  };
}
