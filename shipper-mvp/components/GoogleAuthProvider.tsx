"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

const clientId =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export const isGoogleOAuthConfigured =
  !!clientId && !clientId.startsWith("missing-");

export function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
  if (!clientId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md text-center text-slate-700">
          <p className="font-medium mb-2">Google sign-in not configured</p>
          <p className="text-sm">
            Set <code className="bg-slate-200 px-1 rounded">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> in your{" "}
            <code className="bg-slate-200 px-1 rounded">.env</code> file. See .env.example and the README for Google Cloud setup.
          </p>
        </div>
      </div>
    );
  }
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
