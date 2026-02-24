import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const AI_EMAIL = "ai@system.shipper";

export async function GET() {
  const auth = await getAuth();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let aiUser = await prisma.user.findUnique({
    where: { email: AI_EMAIL },
  });
  if (!aiUser) {
    aiUser = await prisma.user.create({
      data: {
        email: AI_EMAIL,
        name: "Chat with AI",
        picture: null,
      },
    });
  }
  const [id1, id2] =
    auth.userId < aiUser.id ? [auth.userId, aiUser.id] : [aiUser.id, auth.userId];
  const session = await prisma.session.upsert({
    where: {
      user1Id_user2Id: { user1Id: id1, user2Id: id2 },
    },
    create: { user1Id: id1, user2Id: id2 },
    update: {},
    include: {
      user1: { select: { id: true, name: true, picture: true, email: true } },
      user2: { select: { id: true, name: true, picture: true, email: true } },
    },
  });
  const otherUser =
    session.user1Id === auth.userId ? session.user2 : session.user1;
  return NextResponse.json({
    id: session.id,
    otherUser: {
      id: otherUser.id,
      email: otherUser.email,
      name: otherUser.name,
      picture: otherUser.picture,
    },
  });
}
