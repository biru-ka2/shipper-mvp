"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export async function getSocket(): Promise<Socket | null> {
  if (socket?.connected) return socket;
  const res = await fetch("/api/auth/socket-token", { credentials: "include" });
  if (!res.ok) return null;
  const { token } = await res.json();
  if (!token) return null;
  socket = io(window.location.origin, {
    path: "/socket.io",
    auth: { token },
    addTrailingSlash: false,
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export type MessagePayload = {
  id: string;
  sessionId: string;
  senderId: string;
  content: string;
  type: string;
  createdAt: string;
  sender?: { id: string; name: string | null; picture: string | null };
};
