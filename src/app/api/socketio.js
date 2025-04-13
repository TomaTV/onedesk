import { Server } from "socket.io";
import { initSocketServer } from "@/lib/services/socket/socket-server";

// Configuration du serveur Socket.IO
export default function SocketHandler(req, res) {
  // Socket.IO déjà initialisé ?
  if (res.socket.server.io) {
    res.end();
    return;
  }

  const io = initSocketServer(res);

  res.end();
}
