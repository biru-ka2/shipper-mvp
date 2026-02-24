"use client";

import Image from "next/image";
import { IoMdHome } from "react-icons/io";
import { IoChatbubbleOutline } from "react-icons/io5";
import { FaRegCompass } from "react-icons/fa";
import { FaRegImages } from "react-icons/fa";
import { MdHomeFilled } from "react-icons/md";
import { RiFolder3Line } from "react-icons/ri";

export type NavSection = "home" | "messages" | "files" | "explore" | "images";

type User = {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
};

const NAV_ITEMS: {
  id: NavSection;
  label: string;
  icon: "home" | "messages" | "explore" | "files" | "images";
}[] = [
  { id: "home", label: "Home", icon: "home" },
  { id: "messages", label: "Messages", icon: "messages" },
  { id: "explore", label: "Explore", icon: "explore" },
  { id: "files", label: "Files", icon: "files" },
  { id: "images", label: "Images", icon: "images" },
];

function NavIcon({ icon, active }: { icon: string; active: boolean }) {
  const base = "w-6 h-6 shrink-0";
  if (icon === "home") {
    return <MdHomeFilled />;
  }
  if (icon === "messages") {
    return <IoChatbubbleOutline />;
  }
  if (icon === "explore") {
    return <FaRegCompass />;
  }
  if (icon === "files") {
    return <RiFolder3Line />;
  }
  if (icon === "images") {
    return <FaRegImages />;
  }

  return null;
}

type LeftNavProps = {
  currentUser: User | null;
  selectedSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  onNewProject?: () => void;
  onNewTask?: () => void;
  onLogout?: () => void;
};

export function LeftNav({
  currentUser,
  selectedSection,
  onSelectSection,
}: LeftNavProps) {
  return (
    <aside className="w-[72px] bg-white border-r border-gray-200 flex flex-col shrink-0 items-center py-3">
      <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center shrink-0 mb-6 overflow-hidden">
        <Image
          src="/Frame.png"
          alt=""
          width={24}
          height={24}
          className="object-contain w-6 h-6"
        />
      </div>
      <nav className="flex-1 flex flex-col items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const active = selectedSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectSection(item.id)}
              title={item.label}
              /* make the border a square with a bit rounded  corners */
              style={{ borderRadius: "10px" }}
              className={`flex items-center justify-center w-13 h-13 transition-colors  ${
                active
                  ? "bg-teal-100 text-teal-600 border-teal-600 border-[1px]"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              <NavIcon icon={item.icon} active={active} />
            </button>
          );
        })}
      </nav>
      <div className="flex flex-col items-center gap-2 pt-2 border-t border-gray-200">
        <button
          type="button"
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          title="Notifications"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </button>
        <div className="relative">
          {currentUser?.picture ? (
            <Image
              src={currentUser.picture}
              alt=""
              width={40}
              height={40}
              className="rounded-full shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-sm font-medium shrink-0">
              {(currentUser?.name || currentUser?.email || "U")
                .slice(0, 1)
                .toUpperCase()}
            </div>
          )}
          <span
            className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white"
            title="Online"
          />
        </div>
      </div>
    </aside>
  );
}
