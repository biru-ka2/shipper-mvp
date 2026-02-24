"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { LeftNav, type NavSection } from "./LeftNav";

type User = {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
};

type AppShellProps = {
  currentUser: User | null;
  selectedSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  onLogout?: () => void;
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
  onCloseRightSidebar?: () => void;
};

export function AppShell({
  currentUser,
  selectedSection,
  onSelectSection,
  onLogout,
  children,
  rightSidebar,
  onCloseRightSidebar,
}: AppShellProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [gearMenuOpen, setGearMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const gearMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) setUserMenuOpen(false);
      if (gearMenuRef.current && !gearMenuRef.current.contains(target)) setGearMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen bg-white">
      <LeftNav
        currentUser={currentUser}
        selectedSection={selectedSection}
        onSelectSection={onSelectSection}
        onNewProject={() => {}}
        onNewTask={() => {}}
        onLogout={onLogout}
      />
      <div className="flex flex-1 min-w-0 flex-col">
        <header className="h-12 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center shrink-0 overflow-hidden">
              <Image src="/Frame.png" alt="" width={20} height={20} className="object-contain w-5 h-5" />
            </div>
            <span className="text-gray-900 font-medium text-sm">Chat AI</span>
          </div>
          <div className="flex-1 flex items-center justify-center max-w-md">
            <div className="w-full flex items-center gap-2 rounded-lg bg-gray-100 border border-gray-200 px-3 py-1.5">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search"
                className="flex-1 min-w-0 bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none"
              />
              <kbd className="hidden sm:inline text-xs text-gray-500 border border-gray-300 rounded px-1.5 py-0.5">⌘K</kbd>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button type="button" className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors" title="Notifications" aria-label="Notifications">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="relative" ref={gearMenuRef}>
              <button
                type="button"
                onClick={() => setGearMenuOpen((o) => !o)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                title="Settings"
                aria-label="Settings"
                aria-expanded={gearMenuOpen}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              {gearMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-72 rounded-lg bg-white shadow-lg border border-gray-200 py-2 z-50">
                  <a href="/" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Go back to dashboard
                  </a>
                  {currentUser?.email && (
                    <p className="px-3 py-2 text-sm text-gray-600 truncate border-t border-gray-100">{currentUser.email}</p>
                  )}
                  <div className="px-3 py-2 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Credits</p>
                    <p className="text-sm font-medium text-gray-900">20 left</p>
                    <div className="h-2 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full w-[80%] bg-green-500 rounded-full" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Renews in 6h 24m</p>
                    <p className="text-xs text-gray-500">5 of 25 used today · +25 tomorrow</p>
                  </div>
                  <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                    Win free credits
                  </button>
                  <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m18 0h-1m-6.364-3.636l.707-.707M6.343 6.343l-.707-.707m12.728 12.728l.707.707M6.343 17.657l-.707.707" />
                    </svg>
                    Theme Style
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGearMenuOpen(false);
                      onLogout?.();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Log out
                  </button>
                </div>
              )}
            </div>
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-1 p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                {currentUser?.picture ? (
                  <Image src={currentUser.picture} alt="" width={28} height={28} className="rounded-full" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-medium">
                    {(currentUser?.name || currentUser?.email || "U").slice(0, 1).toUpperCase()}
                  </div>
                )}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 rounded-lg bg-white shadow-lg border border-gray-200 py-1 z-50">
                  {currentUser?.email && (
                    <p className="px-3 py-2 text-sm text-gray-600 truncate border-b border-gray-100">{currentUser.email}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      onLogout?.();
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="flex flex-1 min-h-0 relative">
          <main className="flex-1 min-w-0 bg-[#F5F5F5] flex flex-col overflow-hidden">
            {children}
          </main>
          {rightSidebar != null ? (
            <>
              <button
                type="button"
                onClick={onCloseRightSidebar}
                className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black/25 z-40 cursor-default"
                aria-label="Close sidebar"
              />
              <aside
                className="fixed top-0 right-0 z-50 w-72 h-screen flex flex-col overflow-hidden bg-white border-l border-gray-200"
                style={{ boxShadow: '-12px 0 48px rgba(0,0,0,0.22), -4px 0 20px rgba(0,0,0,0.15)' }}
                role="dialog"
                aria-label="Contact info"
              >
                {rightSidebar}
              </aside>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
