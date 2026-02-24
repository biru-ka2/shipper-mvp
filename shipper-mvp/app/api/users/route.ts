import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await getAuth();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const users = await prisma.user.findMany({
    where: {
      id: { not: auth.userId },
      email: { not: "ai@system.shipper" },
    },
    select: {
      id: true,
      email: true,
      name: true,
      picture: true,
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(users);
}
