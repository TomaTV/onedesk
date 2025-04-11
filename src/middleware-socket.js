import { Server } from 'socket.io';
import { initSocketServer } from './lib/services/socket/socket-server';

/**
 * Middleware pour intégrer Socket.IO au serveur HTTP de Next.js
 * @param {object} req - Requête HTTP
 * @param {object} res - Réponse HTTP
 * @param {function} next - Fonction à appeler pour passer au middleware suivant
 */
export default function socketMiddleware(req, res, next) {
  // Si le serveur Socket.IO n'est pas encore initialisé
  if (!res.socket.server.io) {
    console.log('Initialisation du serveur Socket.IO...');
    
    // Initialiser Socket.IO
    const io = initSocketServer(res);
    
    // Attacher l'instance Socket.IO au serveur HTTP
    res.socket.server.io = io;
  }
  
  next();
}
