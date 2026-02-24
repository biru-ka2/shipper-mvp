import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, getAuthCookieConfig } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body as {
      email?: string;
      password?: string;
      name?: string;
    };

    const emailTrim = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!emailTrim) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }
    if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: emailTrim },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: emailTrim,
        name: typeof name === "string" && name.trim() ? name.trim() : null,
        picture: null,
        passwordHash,
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
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "Sign up failed" },
      { status: 500 }
    );
  }
}
