import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const auth = await getAuth();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { sessionId } = await params;
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  if (session.user1Id !== auth.userId && session.user2Id !== auth.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const messages = await prisma.message.findMany({
    where: { sessionId },
    include: {
      sender: {
        select: { id: true, name: true, picture: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(
    messages.map((m) => ({
      id: m.id,
      sessionId: m.sessionId,
      senderId: m.senderId,
      content: m.content,
      type: m.type,
      createdAt: m.createdAt,
      sender: m.sender,
    }))
  );
}
