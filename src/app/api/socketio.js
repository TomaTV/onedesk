import { Server } from 'socket.io';
import { initSocketServer } from '@/lib/services/socket/socket-server';

// Configuration du serveur Socket.IO
export default function SocketHandler(req, res) {
  // Socket.IO déjà initialisé ?
  if (res.socket.server.io) {
    console.log('Socket.IO est déjà en cours d\'exécution');
    res.end();
    return;
  }
  
  // Initialiser Socket.IO
  console.log('Initialisation du serveur Socket.IO...');
  const io = initSocketServer(res);
  
  console.log('Socket.IO initialisé');
  res.end();
}
