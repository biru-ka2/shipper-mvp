import { NextResponse } from "next/server";
import { getTokenFromCookie, verifyToken } from "@/lib/auth";

export async function GET() {
  const token = await getTokenFromCookie();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  return NextResponse.json({ token });
}
