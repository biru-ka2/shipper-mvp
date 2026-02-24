import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, getAuthCookieConfig } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body as { email?: string; password?: string };

    const emailTrim = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!emailTrim || typeof password !== "string" || !password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: emailTrim },
    });
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

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
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Log in failed" },
      { status: 500 }
    );
  }
}
