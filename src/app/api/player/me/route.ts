import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { players } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  const [player] = await db
    .select()
    .from(players)
    .where(eq(players.userId, user.id))
    .limit(1);

  if (!player) return NextResponse.json({ error: "Jogador não encontrado" }, { status: 404 });

  return NextResponse.json(player);
}
