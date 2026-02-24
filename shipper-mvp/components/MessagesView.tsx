"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { MdOutlineModeEditOutline } from "react-icons/md";

export type User = {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
};

export type SessionWithOther = {
  id: string;
  otherUser: User;
  lastMessage: { content: string; createdAt: string; senderId: string } | null;
  updatedAt: string;
};

export type Message = {
  id: string;
  sessionId: string;
  senderId: string;
  content: string;
  type: string;
  createdAt: string;
  sender?: { id: string; name: string | null; picture: string | null };
};

function relativeTime(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

type MessagesViewProps = {
  currentUser: User | null;
  users: User[];
  sessions: SessionWithOther[];
  selectedSessionId: string | null;
  selectedOther: User | null;
  messages: Message[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: (e: React.FormEvent) => void;
  onSelectUser: (user: User) => void;
  onSelectSession: (sessionId: string, other: User) => void;
  onSelectAIChat: () => void;
  onlineUserIds: string[];
  connected: boolean;
  sessionLoading: boolean;
  aiSending: boolean;
  onToggleRightSidebar?: () => void;
  rightSidebarOpen?: boolean;
  onOpenRightSidebar?: () => void;
};

export function MessagesView({
  currentUser,
  users,
  sessions,
  selectedSessionId,
  selectedOther,
  messages,
  input,
  onInputChange,
  onSend,
  onSelectUser,
  onSelectSession,
  onSelectAIChat,
  onlineUserIds,
  connected,
  sessionLoading,
  aiSending,
  onToggleRightSidebar,
  rightSidebarOpen,
  onOpenRightSidebar,
}: MessagesViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [contextMenuSessionId, setContextMenuSessionId] = useState<string | null>(null);
  const [listSearch, setListSearch] = useState("");
  const [modalSearch, setModalSearch] = useState("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!contextMenuSessionId) return;
    function handleClickOutside(e: MouseEvent) {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenuSessionId(null);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setContextMenuSessionId(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [contextMenuSessionId]);

  const hasAnyConversations = sessions.length > 0;
  const showEmptyState = !selectedOther && !hasAnyConversations;
  const showConversationList = hasAnyConversations || users.length > 0;

  const filteredSessions = useMemo(() => {
    if (!listSearch.trim()) return sessions;
    const q = listSearch.toLowerCase().trim();
    return sessions.filter(
      (s) =>
        (s.otherUser.name || "").toLowerCase().includes(q) ||
        (s.otherUser.email || "").toLowerCase().includes(q) ||
        (s.lastMessage?.content || "").toLowerCase().includes(q),
    );
  }, [sessions, listSearch]);

  const filteredModalUsers = useMemo(() => {
    const list = users.filter((u) => u.id !== currentUser?.id);
    if (!modalSearch.trim()) return list;
    const q = modalSearch.toLowerCase().trim();
    return list.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q),
    );
  }, [users, currentUser?.id, modalSearch]);

  const handleSelectUserFromModal = (user: User) => {
    onSelectUser(user);
    setNewMessageOpen(false);
    setModalSearch("");
  };

  return (
    <div className="flex flex-1 min-h-0">
      {/* New Message modal */}
      {newMessageOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[10%] bg-black/40"
          onClick={() => setNewMessageOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 bg-gray-50">
                <svg
                  className="w-4 h-4 text-gray-400 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search name or email"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="flex-1 min-w-0 bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {filteredModalUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelectUserFromModal(user)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                >
                  {user.picture ? (
                    <Image
                      src={user.picture}
                      alt=""
                      width={40}
                      height={40}
                      className="rounded-full shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium shrink-0">
                      {(user.name || user.email).slice(0, 1)}
                    </div>
                  )}
                  <span className="font-medium text-gray-900 truncate text-sm">
                    {user.name || user.email}
                  </span>
                  <span className="ml-auto shrink-0 text-gray-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                  </span>
                </button>
              ))}
              {filteredModalUsers.length === 0 && (
                <p className="p-4 text-sm text-gray-500 text-center">
                  No users found.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Left: conversation list */}
      {showConversationList ? (
        <aside className="w-72 shrink-0 border-r border-gray-200 flex flex-col bg-[#F5F5F5]">
          <div className="p-3 border-b border-gray-200 flex items-center justify-between gap-2">
            <h2 className="font-semibold text-gray-900 text-base">
              All Message
            </h2>
            <button
              type="button"
              onClick={() => setNewMessageOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg  bg-teal-500 text-white text-sm font-medium transition-colors"
            >
              <MdOutlineModeEditOutline />
              New Message
            </button>
          </div>
          <div className="px-3 py-2 border-b border-gray-200">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
              <svg
                className="w-4 h-4 text-gray-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search in message"
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                className="flex-1 min-w-0 bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none"
              />
              <button
                type="button"
                className="p-1 rounded text-gray-400 hover:bg-gray-100"
                title="Filter"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4h6M3 8h12M3 12h6"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredSessions.map((s) => {
              const selected = selectedSessionId === s.id;
              const lastFromMe = s.lastMessage?.senderId === currentUser?.id;
              const menuOpen = contextMenuSessionId === s.id;
              return (
                <div
                  key={s.id}
                  ref={menuOpen ? contextMenuRef : undefined}
                  className={`relative w-full flex items-center gap-2 p-3 border-b border-gray-100 ${
                    selected ? "bg-[#F0F0EE]" : "hover:bg-gray-100/80"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectSession(s.id, s.otherUser)}
                    className="flex-1 flex items-center gap-3 min-w-0 text-left"
                  >
                    <div className="relative shrink-0">
                      {s.otherUser.picture ? (
                        <Image
                          src={s.otherUser.picture}
                          alt=""
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-medium">
                          {(s.otherUser.name || s.otherUser.email).slice(0, 1)}
                        </div>
                      )}
                      {selected && (
                        <span className="absolute -inset-1 rounded-full bg-green-500/20 -z-10" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 truncate text-sm">
                          {s.otherUser.name || s.otherUser.email || "Shipper MVP"}
                        </p>
                      </div>
                      {s.lastMessage && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {s.lastMessage.content}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-0.5">
                      {s.updatedAt && (
                        <span className="text-xs text-gray-500">
                          {relativeTime(s.updatedAt)}
                        </span>
                      )}
                      {s.lastMessage && lastFromMe && (
                        <span className="text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setContextMenuSessionId(menuOpen ? null : s.id);
                    }}
                    className="shrink-0 p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    aria-label="Conversation options"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                    </svg>
                  </button>
                  {menuOpen && (
                    <div
                      className="absolute right-2 top-full mt-0.5 z-50 min-w-[200px] rounded-lg bg-white py-1 shadow-lg border border-gray-200"
                      role="menu"
                    >
                      <button type="button" role="menuitem" onClick={() => setContextMenuSessionId(null)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left">
                        <svg className="w-4 h-4 shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        Mark as unread
                      </button>
                      <button type="button" role="menuitem" onClick={() => setContextMenuSessionId(null)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left">
                        <svg className="w-4 h-4 shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                        Archive
                      </button>
                      <button type="button" role="menuitem" onClick={() => setContextMenuSessionId(null)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left">
                        <svg className="w-4 h-4 shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                        <span className="flex-1">Mute</span>
                        <svg className="w-4 h-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          onSelectSession(s.id, s.otherUser);
                          onOpenRightSidebar?.();
                          setContextMenuSessionId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                      >
                        <svg className="w-4 h-4 shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        Contact info
                      </button>
                      <button type="button" role="menuitem" onClick={() => setContextMenuSessionId(null)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left">
                        <svg className="w-4 h-4 shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Export chat
                      </button>
                      <button type="button" role="menuitem" onClick={() => setContextMenuSessionId(null)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left">
                        <svg className="w-4 h-4 shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        Clear chat
                      </button>
                      <button type="button" role="menuitem" onClick={() => setContextMenuSessionId(null)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-left">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Delete chat
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            <div className="p-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1">
                Start a chat
              </p>
              <button
                type="button"
                onClick={onSelectAIChat}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-left"
              >
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  Chat with AI
                </span>
              </button>
              {users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => onSelectUser(user)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-left"
                >
                  {user.picture ? (
                    <Image
                      src={user.picture}
                      alt=""
                      width={36}
                      height={36}
                      className="rounded-full shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-medium shrink-0">
                      {(user.name || user.email).slice(0, 1)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.name || user.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      {onlineUserIds.includes(user.id) ? "Online" : "Offline"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>
      ) : null}

      {/* Right: empty state or chat */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F5F5F5]">
        {showEmptyState ? (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">All Message</h2>
              <button
                type="button"
                onClick={() => setNewMessageOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                New Message
              </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <p className="text-gray-900 font-medium mb-1">
                You don&apos;t have any messages yet.
              </p>
              <p className="text-gray-500 text-sm mb-6">
                Send your first message to connect with other users.
              </p>
            </div>
            <form onSubmit={onSend} className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-200"
                  title="Attach"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-200"
                  title="Voice"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => onInputChange(e.target.value)}
                  placeholder="Type any message..."
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </>
        ) : selectedOther ? (
          <>
            <header className="p-4 border-b border-gray-200 flex items-center gap-3 shrink-0 bg-[#F5F5F5]">
              {selectedOther.picture ? (
                <Image
                  src={selectedOther.picture}
                  alt=""
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium text-sm">
                  {(selectedOther.name || selectedOther.email).slice(0, 1)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">
                  {selectedOther.name || selectedOther.email}
                </p>
                <p
                  className={`text-xs ${onlineUserIds.includes(selectedOther.id) ? "text-green-600" : "text-gray-500"}`}
                >
                  {onlineUserIds.includes(selectedOther.id)
                    ? "Online"
                    : "Offline"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-2 rounded-lg hover:bg-gray-200 text-gray-500"
                  title="Search"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className="p-2 rounded-lg hover:bg-gray-200 text-gray-500"
                  title="Audio call"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className="p-2 rounded-lg hover:bg-gray-200 text-gray-500"
                  title="Video call"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
                {onToggleRightSidebar && (
                  <button
                    type="button"
                    onClick={onToggleRightSidebar}
                    className="p-2 rounded-lg hover:bg-gray-200 text-gray-500"
                    title={rightSidebarOpen ? "Hide details" : "Show details"}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </header>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F5F5F5]">
              {(() => {
                const groups: { dateLabel: string; messages: Message[] }[] = [];
                let currentLabel = "";
                messages.forEach((m) => {
                  const d = new Date(m.createdAt);
                  const today = new Date();
                  const isToday = d.toDateString() === today.toDateString();
                  const yesterday = new Date(today);
                  yesterday.setDate(yesterday.getDate() - 1);
                  const isYesterday =
                    d.toDateString() === yesterday.toDateString();
                  const label = isToday
                    ? "Today"
                    : isYesterday
                      ? "Yesterday"
                      : d.toLocaleDateString();
                  if (label !== currentLabel) {
                    currentLabel = label;
                    groups.push({ dateLabel: label, messages: [m] });
                  } else {
                    groups[groups.length - 1].messages.push(m);
                  }
                });
                return (
                  <>
                    {groups.map((g) => (
                      <div key={g.dateLabel + g.messages[0]?.id}>
                        <div className="flex items-center justify-center my-3">
                          <span className="text-xs text-gray-500 bg-gray-200/80 px-3 py-1 rounded-full">
                            {g.dateLabel}
                          </span>
                        </div>
                        {g.messages.map((m) => (
                          <div
                            key={m.id}
                            className={`flex ${m.senderId === currentUser?.id ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                                m.senderId === currentUser?.id
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-200 text-gray-900"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap wrap-break-word">
                                {m.content}
                              </p>
                              <div className="flex items-center justify-end gap-1 mt-1">
                                {m.senderId === currentUser?.id && (
                                  <span className="text-green-100">
                                    <svg
                                      className="w-3.5 h-3.5 inline"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  </span>
                                )}
                                <span
                                  className={`text-xs ${m.senderId === currentUser?.id ? "text-green-100" : "text-gray-500"}`}
                                >
                                  {new Date(m.createdAt).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" },
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                );
              })()}
            </div>
            <form
              onSubmit={onSend}
              className="p-4 border-t border-gray-200 shrink-0 bg-[#F5F5F5]"
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-200"
                  title="Attach"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-200"
                  title="Voice"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => onInputChange(e.target.value)}
                  placeholder="Type any message..."
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || aiSending}
                  className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </>
        ) : hasAnyConversations ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 bg-[#F5F5F5]">
            <p className="text-sm">
              Select a conversation or start a new message.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
