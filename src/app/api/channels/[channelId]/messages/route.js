import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getChannelMessages, addMessage, getMessagesSince } from "@/lib/messages";
import { executeQuery } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';
import { writeFile } from 'fs/promises';
import path from 'path';
import { mkdir } from 'fs/promises';

// Fonction helper pour obtenir l'extension de fichier
function getFileExtension(filename) {
  const ext = path.extname(filename);
  return ext ? ext : '.jpg'; // Fallback à .jpg si pas d'extension
}

// GET - Récupérer les messages d'un channel
export async function GET(request, context) {
  try {
    // Récupération des paramètres asynchrones dans Next.js 14+
    const params = await context.params;
    const channelIdStr = params.channelId;
    if (!channelIdStr) {
      return NextResponse.json(
        { error: "Bad Request", message: "ID de channel manquant" },
        { status: 400 }
      );
    }

    const channelId = parseInt(channelIdStr, 10);
    
    const session = await getServerSession();
    
    // Vérifier si l'utilisateur est authentifié
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Vous devez être connecté" },
        { status: 401 }
      );
    }
    
    // Vérifier que l'ID du channel est valide
    if (isNaN(channelId)) {
      return NextResponse.json(
        { error: "Bad Request", message: "ID de channel invalide" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur a accès à ce channel
    const [userAccess] = await executeQuery({
      query: `
        SELECT 1 FROM channels c
        JOIN workspace_members wm ON c.workspace_id = wm.workspace_id
        JOIN users u ON wm.user_id = u.id
        WHERE c.id = ? AND u.email = ?
      `,
      values: [channelId, session.user.email],
    });

    if (!userAccess) {
      return NextResponse.json(
        { error: "Forbidden", message: "Vous n'avez pas accès à ce channel" },
        { status: 403 }
      );
    }

    // Récupérer les paramètres de pagination et filtrage
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "25");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const after = url.searchParams.get("after"); // Timestamp pour charger uniquement les messages plus récents

    // Récupérer les messages selon les paramètres
    let messages;
    if (after) {
      // Récupérer uniquement les messages plus récents que le timestamp fourni
      messages = await getMessagesSince(channelId, after);
    } else {
      // Récupération standard avec pagination
      messages = await getChannelMessages(channelId, limit, offset);
    }

    // Ajouter des en-têtes anti-cache pour s'assurer que les messages sont toujours à jour
    return NextResponse.json(messages, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  } catch (error) {
    console.error("Error in GET /api/channels/[channelId]/messages:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}

// POST - Ajouter un nouveau message
export async function POST(request, context) {
  try {
    // Récupération des paramètres asynchrones dans Next.js 14+
    const params = await context.params;
    const channelIdStr = params.channelId;
    if (!channelIdStr) {
      return NextResponse.json(
        { error: "Bad Request", message: "ID de channel manquant" },
        { status: 400 }
      );
    }

    const channelId = parseInt(channelIdStr, 10);

    const session = await getServerSession();
    
    // Vérifier si l'utilisateur est authentifié
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Vous devez être connecté" },
        { status: 401 }
      );
    }
    
    // Vérifier que l'ID du channel est valide
    if (isNaN(channelId)) {
      return NextResponse.json(
        { error: "Bad Request", message: "ID de channel invalide" },
        { status: 400 }
      );
    }

    // Récupérer l'ID de l'utilisateur à partir de son email
    const [user] = await executeQuery({
      query: "SELECT id FROM users WHERE email = ?",
      values: [session.user.email],
    });

    if (!user) {
      return NextResponse.json(
        { error: "Not Found", message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur a accès à ce channel
    const [userAccess] = await executeQuery({
      query: `
        SELECT 1 FROM channels c
        JOIN workspace_members wm ON c.workspace_id = wm.workspace_id
        WHERE c.id = ? AND wm.user_id = ?
      `,
      values: [channelId, user.id],
    });

    if (!userAccess) {
      return NextResponse.json(
        { error: "Forbidden", message: "Vous n'avez pas accès à ce channel" },
        { status: 403 }
      );
    }

    // Vérifier si la requête contient du multipart/form-data (upload d'image)
    const contentType = request.headers.get('content-type') || '';
    let content = '';
    let imageUrl = null;
    // Initialiser la variable imageUrls en dehors du bloc if
    let imageUrls = [];
    
    if (contentType.includes('multipart/form-data')) {
      // Traiter un formulaire avec images
      const formData = await request.formData();
      content = formData.get('content') || '';
      
      // Rechercher toutes les clés qui commencent par "image_"
      for (const [key, value] of formData.entries()) {
        if (key.startsWith('image_') && value instanceof Blob) {
          const imageFile = value;
          
          try {
            // Vérifier le type de fichier
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
            if (!allowedTypes.includes(imageFile.type)) {
              console.warn(`Type de fichier non autorisé: ${imageFile.type}. Fichier ignoré.`);
              continue;
            }
            
            // Vérifier la taille du fichier (limite à 5 Mo)
            const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo en octets
            if (imageFile.size > MAX_FILE_SIZE) {
              console.warn(`Fichier trop volumineux: ${imageFile.size} octets. Fichier ignoré.`);
              continue;
            }
            
            // Créer un nom de fichier unique
            const fileName = `${uuidv4()}-${Date.now()}${getFileExtension(imageFile.name || 'image.jpg')}`;
            
            // Créer le dossier d'upload s'il n'existe pas
            const uploadDir = path.join(process.cwd(), 'public', 'uploads');
            try {
              await mkdir(uploadDir, { recursive: true });
            } catch (mkdirError) {
              console.error("Erreur lors de la création du dossier d'uploads:", mkdirError);
            }
            
            // Chemin complet pour sauvegarder le fichier
            const filePath = path.join(uploadDir, fileName);
            
            // Lire le contenu du fichier
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            
            // Écrire le fichier
            await writeFile(filePath, buffer);
            
            // Ajouter l'URL à la liste
            imageUrls.push(`/uploads/${fileName}`);
          } catch (fileError) {
            console.error("Erreur lors du traitement de l'image:", fileError);
            // Continuer avec les autres images même si une échoue
          }
        }
      }
    } else {
      // Traiter une requête JSON standard
      try {
        const body = await request.json();
        content = body.content || '';
      } catch (jsonError) {
        console.error("Erreur lors du parsing JSON:", jsonError);
        return NextResponse.json(
          { error: "Invalid JSON", message: "Le format de la requête est invalide" },
          { status: 400 }
        );
      }
    }

    // Vérifier que le message a du contenu ou des images
    if ((!content || content.trim() === "") && imageUrls.length === 0) {
      return NextResponse.json(
        { error: "Bad Request", message: "Le message ne peut pas être vide" },
        { status: 400 }
      );
    }

    // Ajouter le message avec les images éventuelles
    const message = await addMessageWithImages(channelId, user.id, content, imageUrls);

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/channels/[channelId]/messages:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}

// Fonction pour ajouter un message avec des images
async function addMessageWithImages(channelId, userId, content, imageUrls = []) {
  let mainMessageId;
  
  // Convertir le tableau d'images en JSON si des images sont présentes
  const imagesJson = imageUrls.length > 0 ? JSON.stringify(imageUrls) : null;
  
  // Insérer le message avec le contenu et les URLs d'images en JSON
  const query = `
    INSERT INTO messages (
      channel_id, user_id, content, images, created_at
    ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;

  const result = await executeQuery({
    query,
    values: [channelId, userId, content, imagesJson],
  });
  
  mainMessageId = result.insertId;

  // Récupérer le message complet avec toutes ses images liées
  const messageQuery = `
    SELECT 
      m.*, 
      u.name as user_name, 
      u.avatar as user_avatar
    FROM messages m
    JOIN users u ON m.user_id = u.id
    WHERE m.id = ?
  `;
  
  const [message] = await executeQuery({
    query: messageQuery,
    values: [mainMessageId],
  });
  
  // Si nous avons des images en JSON, les décoder et les ajouter au message
  if (message.images) {
    try {
      message.image_urls = JSON.parse(message.images);
    } catch (error) {
      console.error("Erreur lors du parsing des images JSON:", error);
      message.image_urls = [];
    }
  } else {
    message.image_urls = [];
  }
  
  // Si l'ancienne colonne image_url est utilisée, l'ajouter au tableau image_urls
  if (message.image_url) {
    message.image_urls.push(message.image_url);
  }
  
  return message;
}