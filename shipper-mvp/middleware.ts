import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

const JWT_COOKIE_NAME = "shipper_token";

function getJwtSecret() {
  return new TextEncoder().encode(
    process.env.JWT_SECRET || "dev-secret-change-in-production"
  );
}

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(JWT_COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    await jose.jwtVerify(token, getJwtSecret());
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const auth = await isAuthenticated(request);

  if (pathname.startsWith("/chat") && !auth) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if ((pathname === "/" || pathname === "/login" || pathname === "/signup") && auth) {
    const url = request.nextUrl.clone();
    url.pathname = "/chat";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/signup", "/chat", "/chat/:path*"],
};
