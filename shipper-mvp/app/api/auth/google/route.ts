import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "@/lib/prisma";
import { signToken, getAuthCookieConfig } from "@/lib/auth";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { credential } = body as { credential?: string };
    if (!credential) {
      return NextResponse.json({ error: "Missing credential" }, { status: 400 });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: [
        process.env.GOOGLE_CLIENT_ID || "",
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      ].filter(Boolean),
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      return NextResponse.json({ error: "Invalid token payload" }, { status: 401 });
    }

    const user = await prisma.user.upsert({
      where: { email: payload.email },
      update: {
        name: payload.name ?? undefined,
        picture: payload.picture ?? undefined,
        googleId: payload.sub,
      },
      create: {
        email: payload.email,
        name: payload.name ?? null,
        picture: payload.picture ?? null,
        googleId: payload.sub,
      },
    });

    const accessToken = await signToken({
      userId: user.id,
      email: user.email,
    });

    const config = getAuthCookieConfig();
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
      accessToken,
    });
    response.cookies.set(config.name, accessToken, {
      httpOnly: config.httpOnly,
      secure: config.secure,
      sameSite: config.sameSite,
      path: config.path,
      maxAge: config.maxAge,
    });
    return response;
  } catch (err) {
    console.error("Auth error:", err);
    const isDbError =
      err &&
      typeof err === "object" &&
      ("code" in err || "message" in err) &&
      String((err as { message?: string }).message ?? "").toLowerCase().includes("can't reach database");
    return NextResponse.json(
      {
        error: isDbError
          ? "Database unavailable. Check DATABASE_URL in .env and that PostgreSQL is running (or use a hosted DB like Neon/Supabase)."
          : "Authentication failed",
      },
      { status: 500 }
    );
  }
}
