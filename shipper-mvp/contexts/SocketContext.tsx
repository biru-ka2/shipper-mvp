"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getSocket, disconnectSocket, type MessagePayload } from "@/lib/socket";

type SocketContextValue = {
  onlineUserIds: string[];
  sendMessage: (
    sessionId: string,
    content: string
  ) => Promise<{ message?: MessagePayload; error?: string }>;
  subscribeToMessages: (cb: (msg: MessagePayload) => void) => () => void;
  subscribeToPresence: (cb: (ids: string[]) => void) => () => void;
  connected: boolean;
};

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const messageListeners = React.useRef<Set<(msg: MessagePayload) => void>>(
    new Set()
  );
  const presenceListeners = React.useRef<Set<(ids: string[]) => void>>(
    new Set()
  );

  useEffect(() => {
    getSocket().then((sock) => {
      if (!sock) return;
      setConnected(sock.connected);
      sock.on("connect", () => setConnected(true));
      sock.on("disconnect", () => setConnected(false));
      sock.on("users:online", (ids: string[]) => {
        setOnlineUserIds(ids);
        presenceListeners.current.forEach((cb) => cb(ids));
      });
      sock.on("message:new", (msg: MessagePayload) => {
        messageListeners.current.forEach((cb) => cb(msg));
      });
    });
    return () => {
      disconnectSocket();
    };
  }, []);

  const sendMessage = useCallback(
    async (
      sessionId: string,
      content: string
    ): Promise<{ message?: MessagePayload; error?: string }> => {
      const sock = await getSocket();
      if (!sock) return { error: "Not connected" };
      return new Promise((resolve) => {
        sock.emit(
          "message:send",
          { sessionId, content },
          (res: { message?: MessagePayload; error?: string }) => {
            resolve(res || {});
          }
        );
      });
    },
    []
  );

  const subscribeToMessages = useCallback((cb: (msg: MessagePayload) => void) => {
    messageListeners.current.add(cb);
    return () => messageListeners.current.delete(cb);
  }, []);

  const subscribeToPresence = useCallback((cb: (ids: string[]) => void) => {
    presenceListeners.current.add(cb);
    cb(onlineUserIds);
    return () => presenceListeners.current.delete(cb);
  }, [onlineUserIds]);

  const value: SocketContextValue = {
    onlineUserIds,
    sendMessage,
    subscribeToMessages,
    subscribeToPresence,
    connected,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
}
