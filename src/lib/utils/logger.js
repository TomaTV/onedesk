/**
 * Utilitaire de journalisation qui permet d'enregistrer des erreurs 
 * sans polluer la console en production
 */

// Détermine si nous sommes en environnement de développement
const isDev = process.env.NODE_ENV === 'development';

/**
 * Journalise une erreur
 * En développement: utilise console.error
 * En production: utilise console.warn pour les erreurs non critiques
 *
 * @param {string} message - Message principal
 * @param {Error|string|Object} error - Erreur ou détails supplémentaires
 * @param {Object} options - Options
 * @param {boolean} options.isCritical - Si true, utilise toujours console.error
 * @param {boolean} options.includeStack - Si true, affiche la pile d'appels
 */
export function logError(message, error, options = {}) {
  const { isCritical = false, includeStack = true } = options;
  
  // En développement ou pour les erreurs critiques, utiliser console.error
  if (isDev || isCritical) {
    console.error(`${message}:`, error);
    return;
  }
  
  // En production pour les erreurs non critiques, utiliser console.warn
  if (error instanceof Error && includeStack) {
    console.warn(`${message}: ${error.message}`);
    console.warn(`Stack trace (non critique): ${error.stack}`);
  } else {
    console.warn(`${message}:`, error);
  }
}

/**
 * Journalise une information
 * 
 * @param {string} message - Message principal
 * @param {any} data - Données supplémentaires
 */
export function logInfo(message, data) {
  // En production, minimiser les logs d'information
  if (!isDev && !data) {
    return;
  }
  
  if (data) {
    console.log(message, data);
  } else {
    console.log(message);
  }
}

/**
 * Journalise un avertissement
 * 
 * @param {string} message - Message principal
 * @param {any} data - Données supplémentaires
 */
export function logWarning(message, data) {
  console.warn(message, data);
}

export default {
  error: logError,
  warn: logWarning,
  info: logInfo
};
