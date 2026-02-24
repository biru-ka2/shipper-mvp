import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const AI_EMAIL = "ai@system.shipper";

export async function POST(request: Request) {
  const auth = await getAuth();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  if (!content) {
    return NextResponse.json(
      { error: "Missing or invalid content" },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "AI chat is not configured",
        message: {
          id: "no-ai",
          content: "Sorry, the AI assistant is not configured (missing OPENAI_API_KEY).",
          type: "ai",
          senderId: "",
          createdAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
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
  });

  await prisma.message.create({
    data: {
      sessionId: session.id,
      senderId: auth.userId,
      content,
      type: "user",
    },
  });

  let aiContent: string;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful, concise assistant in a chat app. Keep replies brief and friendly.",
          },
          { role: "user", content },
        ],
        max_tokens: 500,
      }),
    });
    const data = await res.json();
    aiContent =
      data?.choices?.[0]?.message?.content?.trim() ||
      "I couldn't generate a reply.";
  } catch (err) {
    console.error("OpenAI error:", err);
    aiContent = "Sorry, something went wrong. Please try again.";
  }

  const aiMessage = await prisma.message.create({
    data: {
      sessionId: session.id,
      senderId: aiUser.id,
      content: aiContent,
      type: "ai",
    },
    include: {
      sender: { select: { id: true, name: true, picture: true } },
    },
  });

  return NextResponse.json({
    message: {
      id: aiMessage.id,
      sessionId: aiMessage.sessionId,
      senderId: aiMessage.senderId,
      content: aiMessage.content,
      type: aiMessage.type,
      createdAt: aiMessage.createdAt,
      sender: aiMessage.sender,
    },
  });
}
