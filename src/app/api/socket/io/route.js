import { NextResponse } from "next/server";
import { initSocketServer } from "@/lib/services/socket/socket-server";

export async function GET(req, res) {
  try {
    // Initialiser le serveur Socket.IO
    const io = initSocketServer(res);
    
    return NextResponse.json({ message: "Socket.IO server is running" });
  } catch (error) {
    console.error("Error initializing Socket.IO server:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
