import { getUserWorkspaces } from "@/lib/workspaces";
import { getWorkspaceChannels } from "@/lib/channels";
import { isWorkspaceMember, isWorkspaceAdmin } from "@/lib/users";

/**
 * Trouve un workspace par son nom pour un utilisateur spécifique
 * @param {string} workspaceName - Nom du workspace à trouver
 * @param {number} userId - ID de l'utilisateur
 * @returns {Promise<Object|null>} Le workspace trouvé ou null
 */
export async function findWorkspaceByName(workspaceName, userId) {
  if (!workspaceName || !userId) {
    return null;
  }
  
  try {
    // Récupérer tous les workspaces de l'utilisateur
    const userWorkspaces = await getUserWorkspaces(userId);
    
    if (!userWorkspaces || userWorkspaces.length === 0) {
      return null;
    }

    // Trouver le workspace par son nom (insensible à la casse)
    const matchedWorkspace = userWorkspaces.find(
      (w) => w.name.toLowerCase() === workspaceName.toLowerCase()
    );

    return matchedWorkspace || null;
  } catch (error) {
    console.error("Error in findWorkspaceByName:", error);
    return null;
  }
}

/**
 * Trouve un channel par son nom dans un workspace spécifique
 * @param {string} channelName - Nom du channel à trouver
 * @param {number} workspaceId - ID du workspace
 * @returns {Promise<Object|null>} Le channel trouvé ou null
 */
export async function findChannelByName(channelName, workspaceId) {
  if (!channelName || !workspaceId) {
    return null;
  }
  
  try {
    // Récupérer tous les channels du workspace
    const channels = await getWorkspaceChannels(workspaceId);
    
    if (!channels || channels.length === 0) {
      return null;
    }

    // Trouver le channel par son nom (insensible à la casse)
    const matchedChannel = channels.find(
      (c) => c.name.toLowerCase() === channelName.toLowerCase()
    );

    return matchedChannel || null;
  } catch (error) {
    console.error("Error in findChannelByName:", error);
    return null;
  }
}

/**
 * Vérifie si un utilisateur a accès à un workspace
 * @param {number} userId - ID de l'utilisateur
 * @param {number} workspaceId - ID du workspace
 * @param {boolean} requireAdmin - Si true, vérifie les droits admin
 * @returns {Promise<boolean>} True si l'utilisateur a l'accès requis
 */
export async function checkWorkspaceAccess(userId, workspaceId, requireAdmin = false) {
  if (!userId || !workspaceId) {
    return false;
  }
  
  try {
    if (requireAdmin) {
      return await isWorkspaceAdmin(userId, workspaceId);
    } else {
      return await isWorkspaceMember(userId, workspaceId);
    }
  } catch (error) {
    console.error("Error in checkWorkspaceAccess:", error);
    return false;
  }
}

/**
 * Valide les données d'un workspace
 * @param {Object} workspaceData - Données du workspace à valider
 * @returns {Object} Résultat de la validation {valid: boolean, errors: string[]}
 */
export function validateWorkspaceData(workspaceData) {
  const errors = [];
  
  if (!workspaceData) {
    return { valid: false, errors: ["Aucune donnée fournie"] };
  }
  
  // Validation du nom
  if (!workspaceData.name) {
    errors.push("Le nom est obligatoire");
  } else if (workspaceData.name.length < 2) {
    errors.push("Le nom doit contenir au moins 2 caractères");
  } else if (workspaceData.name.length > 50) {
    errors.push("Le nom ne peut pas dépasser 50 caractères");
  }
  
  // Validation de la lettre
  if (!workspaceData.letter) {
    errors.push("La lettre est obligatoire");
  } else if (workspaceData.letter.length !== 1) {
    errors.push("La lettre doit être un seul caractère");
  }
  
  // Validation de la couleur
  if (!workspaceData.color) {
    errors.push("La couleur est obligatoire");
  } else if (!workspaceData.color.includes("from-") || !workspaceData.color.includes("to-")) {
    errors.push("Format de couleur invalide");
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valide les données d'un channel
 * @param {Object} channelData - Données du channel à valider
 * @returns {Object} Résultat de la validation {valid: boolean, errors: string[]}
 */
export function validateChannelData(channelData) {
  const errors = [];
  
  if (!channelData) {
    return { valid: false, errors: ["Aucune donnée fournie"] };
  }
  
  // Validation du nom
  if (!channelData.name) {
    errors.push("Le nom est obligatoire");
  } else if (channelData.name.length < 2) {
    errors.push("Le nom doit contenir au moins 2 caractères");
  } else if (channelData.name.length > 50) {
    errors.push("Le nom ne peut pas dépasser 50 caractères");
  }
  
  // Validation du type (si fourni)
  if (channelData.type && !["file", "custom"].includes(channelData.type)) {
    errors.push("Type de channel invalide");
  }
  
  // Validation de l'emoji (si type custom)
  if (channelData.type === "custom" && !channelData.emoji) {
    errors.push("Un emoji est requis pour les canaux de type personnalisé");
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
