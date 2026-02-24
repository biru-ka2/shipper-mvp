"use client";

import Image from "next/image";

type AuthLayoutProps = {
  variant: "login" | "signup";
  children: React.ReactNode;
};

const COPY = {
  login: {
    headline: "Welcome back",
    subtext: "Pick up where you left off.",
    trust: "Secure sign-in · We never share your data.",
  },
  signup: {
    headline: "Create your account",
    subtext: "Start chatting with your team and AI in seconds.",
    trust: "Secure sign-in · We never share your data.",
  },
} as const;

export function AuthLayout({ variant, children }: AuthLayoutProps) {
  const { headline, subtext, trust } = COPY[variant];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left: brand / value panel */}
      <div className="flex flex-col justify-center px-8 py-12 md:py-16 md:px-12 lg:px-16 md:w-[45%] lg:w-[40%] bg-gradient-to-br from-teal-50 via-white to-emerald-50/80 border-b md:border-b-0 md:border-r border-gray-200/60">
        <div className="w-full max-w-sm mx-auto md:mx-0">
          <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center shrink-0 overflow-hidden mb-8">
            <Image src="/Frame.png" alt="" width={28} height={28} className="object-contain" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-2">
            {headline}
          </h1>
          <p className="text-gray-600 text-base md:text-lg mb-8">{subtext}</p>
          <p className="text-sm text-gray-500">{trust}</p>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 md:py-16 bg-white min-h-0">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
