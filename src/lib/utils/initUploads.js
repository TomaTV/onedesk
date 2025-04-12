import { existsSync, mkdirSync } from 'fs';
import path from 'path';

/**
 * Initialise le dossier d'uploads pour les images du chat
 */
export function initUploadsDirectory() {
  try {
    // Chemin vers le dossier d'uploads dans le dossier public
    const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
    
    // Vérifier si le dossier existe déjà
    if (!existsSync(uploadsPath)) {
      console.log('Création du dossier d\'uploads pour les images...');
      
      // Créer le dossier avec récursion (crée aussi les dossiers parents si nécessaires)
      mkdirSync(uploadsPath, { recursive: true });
      
      console.log('Dossier d\'uploads créé avec succès:', uploadsPath);
    }
  } catch (error) {
    console.error('Erreur lors de la création du dossier d\'uploads:', error);
  }
}
