"use client";

import { useState } from "react";
import Image from "next/image";

type User = {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
};

const MEDIA_IMAGES = ["/media_1.jpg", "/media_2.jpg"] as const;
const MOCK_MEDIA_BY_MONTH: { month: string; placeholders: string[] }[] = [
  { month: "May", placeholders: ["bg-amber-200", "bg-blue-200", "bg-rose-200", "bg-emerald-200", "bg-violet-200", "bg-amber-300"] },
  { month: "April", placeholders: ["bg-emerald-200", "bg-violet-200", "bg-amber-200", "bg-blue-200", "bg-rose-200"] },
  { month: "March", placeholders: ["bg-rose-200", "bg-amber-200", "bg-blue-200", "bg-violet-200"] },
];

const MOCK_LINKS = [{ title: "Design reference" }, { title: "Project brief" }];
const MOCK_DOCS = [{ title: "Meeting notes.pdf" }, { title: "Specs.docx" }];

type RightSidebarProps = {
  currentUser: User | null;
  otherUser: User | null;
  onClose?: () => void;
};

export function RightSidebar({ currentUser, otherUser, onClose }: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState<"media" | "link" | "docs">("media");
  const user = otherUser || currentUser;
  if (!user) return null;

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[#F5F5F5]">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between shrink-0">
        <h2 className="font-semibold text-gray-900 text-base">Contact Info</h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-700"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <div className="p-4 border-b border-gray-200 flex flex-col items-center text-center">
        {user.picture ? (
          <Image src={user.picture} alt="" width={80} height={80} className="rounded-full mb-3" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-2xl font-medium mb-3">
            {(user.name || user.email).slice(0, 1)}
          </div>
        )}
        <p className="font-semibold text-gray-900 text-base">{user.name || user.email}</p>
        {user.email && <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>}
        <div className="flex gap-2 mt-3 w-full">
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Audio
          </button>
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Video
          </button>
        </div>
      </div>
      <div className="px-4 pt-3 pb-2 border-b border-gray-200">
        <div className="flex gap-1">
          {(["media", "link", "docs"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 text-sm font-medium capitalize rounded-t-lg transition-colors ${
                activeTab === tab
                  ? "text-gray-900 bg-gray-200/80 border-b-2 border-teal-500 shadow-sm"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "media" && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">May</p>
              <div className="grid grid-cols-4 gap-2">
                {MEDIA_IMAGES.map((src, i) => (
                  <div key={src} className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
                    <Image src={src} alt="" fill className="object-cover" sizes="96px" />
                  </div>
                ))}
                {MOCK_MEDIA_BY_MONTH[0].placeholders.map((bg, i) => (
                  <div key={`May-${i}`} className={`aspect-square rounded-lg ${bg}`} />
                ))}
              </div>
            </div>
            {MOCK_MEDIA_BY_MONTH.slice(1).map(({ month, placeholders }) => (
              <div key={month}>
                <p className="text-sm font-semibold text-gray-700 mb-2">{month}</p>
                <div className="grid grid-cols-4 gap-2">
                  {placeholders.map((bg, i) => (
                    <div key={`${month}-${i}`} className={`aspect-square rounded-lg ${bg}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === "link" && (
          <ul className="space-y-2">
            {MOCK_LINKS.map((l, i) => (
              <li key={i} className="text-sm text-gray-700 py-1.5 border-b border-gray-100 last:border-0">
                {l.title}
              </li>
            ))}
            {MOCK_LINKS.length === 0 && <p className="text-sm text-gray-500">No links.</p>}
          </ul>
        )}
        {activeTab === "docs" && (
          <ul className="space-y-2">
            {MOCK_DOCS.map((d, i) => (
              <li key={i} className="text-sm text-gray-700 py-1.5 border-b border-gray-100 last:border-0">
                {d.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
