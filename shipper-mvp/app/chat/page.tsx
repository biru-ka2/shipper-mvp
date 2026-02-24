"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/contexts/SocketContext";
import type { MessagePayload } from "@/lib/socket";
import { AppShell } from "@/components/AppShell";
import { LeftNav, type NavSection } from "@/components/LeftNav";
import { MessagesView } from "@/components/MessagesView";
import { RightSidebar } from "@/components/RightSidebar";

type User = {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
};

type SessionWithOther = {
  id: string;
  otherUser: User;
  lastMessage: { content: string; createdAt: string; senderId: string } | null;
  updatedAt: string;
};

type Message = {
  id: string;
  sessionId: string;
  senderId: string;
  content: string;
  type: string;
  createdAt: string;
  sender?: { id: string; name: string | null; picture: string | null };
};

const PLACEHOLDER_SECTIONS: { id: NavSection; title: string; copy: string }[] =
  [
    { id: "home", title: "Home", copy: "Welcome to Shipper MVP." },
    { id: "images", title: "Images", copy: "No images shared." },
    { id: "files", title: "Files", copy: "No files shared." },
    { id: "explore", title: "Explore", copy: "Discover and explore." },
  ];

export default function ChatPage() {
  const router = useRouter();
  const { onlineUserIds, sendMessage, subscribeToMessages, connected } =
    useSocket();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [sessions, setSessions] = useState<SessionWithOther[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [selectedOther, setSelectedOther] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [aiSending, setAiSending] = useState(false);
  const [selectedSection, setSelectedSection] =
    useState<NavSection>("messages");
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((user) => {
        setCurrentUser(user);
        if (!user) router.push("/");
      })
      .finally(() => setAuthLoading(false));
  }, [router]);

  useEffect(() => {
    if (!currentUser) return;
    fetch("/api/users", { credentials: "include" })
      .then((r) => r.json())
      .then(setUsers)
      .catch(() => setUsers([]));
    fetch("/api/sessions", { credentials: "include" })
      .then((r) => r.json())
      .then(setSessions)
      .catch(() => setSessions([]));
  }, [currentUser]);

  const loadMessages = useCallback((sessionId: string) => {
    fetch(`/api/sessions/${sessionId}/messages`, { credentials: "include" })
      .then((r) => r.json())
      .then(setMessages)
      .catch(() => setMessages([]));
  }, []);

  useEffect(() => {
    const unsub = subscribeToMessages((msg: MessagePayload) => {
      setMessages((prev) => {
        if (msg.sessionId !== selectedSessionId) return prev;
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg as Message];
      });
    });
    return unsub;
  }, [subscribeToMessages, selectedSessionId]);

  const selectUser = useCallback(
    async (user: User) => {
      setSelectedOther(user);
      setSessionLoading(true);
      try {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ otherUserId: user.id }),
          credentials: "include",
        });
        const data = await res.json();
        if (data.id) {
          setSelectedSessionId(data.id);
          setAiMode(false);
          loadMessages(data.id);
          setSessions((prev) => {
            const exists = prev.some((s) => s.otherUser.id === user.id);
            if (exists) return prev;
            return [
              {
                id: data.id,
                otherUser: user,
                lastMessage: null,
                updatedAt: new Date().toISOString(),
              },
              ...prev,
            ];
          });
        }
      } finally {
        setSessionLoading(false);
      }
    },
    [loadMessages],
  );

  const selectAIChat = useCallback(async () => {
    setSessionLoading(true);
    try {
      const res = await fetch("/api/ai/session", { credentials: "include" });
      const data = await res.json();
      if (data.id && data.otherUser) {
        setSelectedSessionId(data.id);
        setSelectedOther(data.otherUser);
        setAiMode(true);
        loadMessages(data.id);
        setSessions((prev) => {
          const exists = prev.some((s) => s.otherUser.id === data.otherUser.id);
          if (exists) return prev;
          return [
            {
              id: data.id,
              otherUser: data.otherUser,
              lastMessage: null,
              updatedAt: new Date().toISOString(),
            },
            ...prev,
          ];
        });
      }
    } finally {
      setSessionLoading(false);
    }
  }, [loadMessages]);

  const selectSession = useCallback(
    (sessionId: string, other: User) => {
      setSelectedSessionId(sessionId);
      setSelectedOther(other);
      setAiMode(false);
      loadMessages(sessionId);
    },
    [loadMessages],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedSessionId || !input.trim()) return;
      const content = input.trim();
      setInput("");

      if (aiMode) {
        setAiSending(true);
        try {
          const res = await fetch("/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content }),
            credentials: "include",
          });
          const data = await res.json();
          const userMsg: Message = {
            id: `temp-${Date.now()}`,
            sessionId: selectedSessionId,
            senderId: currentUser!.id,
            content,
            type: "user",
            createdAt: new Date().toISOString(),
            sender: currentUser
              ? {
                  id: currentUser.id,
                  name: currentUser.name,
                  picture: currentUser.picture,
                }
              : undefined,
          };
          setMessages((prev) => [...prev, userMsg]);
          if (data.message) {
            setMessages((prev) => [...prev, data.message as Message]);
          }
        } finally {
          setAiSending(false);
        }
        return;
      }

      const result = await sendMessage(selectedSessionId, content);
      if (result.message) {
        setMessages((prev) =>
          prev.some((m) => m.id === result.message!.id)
            ? prev
            : [...prev, result.message as Message],
        );
      }
      if (result.error && !result.message) {
        setInput(content);
      }
    },
    [selectedSessionId, input, sendMessage, aiMode, currentUser],
  );

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/");
    router.refresh();
  }, [router]);

  if (authLoading && !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  const placeholder = PLACEHOLDER_SECTIONS.find(
    (s) => s.id === selectedSection,
  );
  const showRightSidebar =
    selectedSection === "messages" && selectedOther != null && rightSidebarOpen;

  return (
    <AppShell
      currentUser={currentUser}
      selectedSection={selectedSection}
      onSelectSection={setSelectedSection}
      onLogout={handleLogout}
      rightSidebar={
        showRightSidebar ? (
          <RightSidebar
            currentUser={currentUser}
            otherUser={selectedOther}
            onClose={() => setRightSidebarOpen(false)}
          />
        ) : undefined
      }
      onCloseRightSidebar={() => setRightSidebarOpen(false)}
    >
      {selectedSection === "messages" ? (
        <MessagesView
          currentUser={currentUser}
          users={users}
          sessions={sessions}
          selectedSessionId={selectedSessionId}
          selectedOther={selectedOther}
          messages={messages}
          input={input}
          onInputChange={setInput}
          onSend={handleSubmit}
          onSelectUser={selectUser}
          onSelectSession={selectSession}
          onSelectAIChat={selectAIChat}
          onlineUserIds={onlineUserIds}
          connected={connected}
          sessionLoading={sessionLoading}
          aiSending={aiSending}
          onToggleRightSidebar={() => setRightSidebarOpen((v) => !v)}
          rightSidebarOpen={rightSidebarOpen}
          onOpenRightSidebar={() => setRightSidebarOpen(true)}
        />
      ) : placeholder ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            {placeholder.title}
          </h2>
          <p className="text-slate-500">{placeholder.copy}</p>
        </div>
      ) : null}
    </AppShell>
  );
}
