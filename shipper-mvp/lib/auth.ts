import * as jose from "jose";
import { cookies } from "next/headers";

const JWT_COOKIE_NAME = "shipper_token";
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-in-production"
);

export type JWTPayload = { userId: string; email: string };

export async function signToken(payload: JWTPayload): Promise<string> {
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;
    const email = payload.email as string;
    if (!userId || !email) return null;
    return { userId, email };
  } catch {
    return null;
  }
}

export async function getTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(JWT_COOKIE_NAME)?.value ?? null;
}

export async function getAuth(): Promise<JWTPayload | null> {
  const token = await getTokenFromCookie();
  if (!token) return null;
  return verifyToken(token);
}

export function getAuthCookieConfig() {
  return {
    name: JWT_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
}
