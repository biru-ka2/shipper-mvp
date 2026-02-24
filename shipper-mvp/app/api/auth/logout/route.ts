import { NextResponse } from "next/server";
import { getAuthCookieConfig } from "@/lib/auth";

export async function POST() {
  const config = getAuthCookieConfig();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(config.name, "", {
    ...config,
    maxAge: 0,
  });
  return response;
}
