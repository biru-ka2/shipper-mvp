import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await getAuth();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sessions = await prisma.session.findMany({
    where: {
      OR: [{ user1Id: auth.userId }, { user2Id: auth.userId }],
    },
    include: {
      user1: { select: { id: true, name: true, picture: true, email: true } },
      user2: { select: { id: true, name: true, picture: true, email: true } },
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { content: true, createdAt: true, senderId: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
  const list = sessions.map((s) => {
    const other = s.user1Id === auth.userId ? s.user2 : s.user1;
    const lastMessage = s.messages[0];
    return {
      id: s.id,
      otherUser: other,
      lastMessage: lastMessage
        ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
            senderId: lastMessage.senderId,
          }
        : null,
      updatedAt: s.updatedAt,
    };
  });
  return NextResponse.json(list);
}

export async function POST(request: Request) {
  const auth = await getAuth();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const otherUserId = body?.otherUserId as string | undefined;
  if (!otherUserId || otherUserId === auth.userId) {
    return NextResponse.json(
      { error: "Invalid otherUserId" },
      { status: 400 }
    );
  }
  const [id1, id2] =
    auth.userId < otherUserId
      ? [auth.userId, otherUserId]
      : [otherUserId, auth.userId];
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
    otherUser,
  });
}
