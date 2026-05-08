import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { grSessionPlayers } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const { playerId, feedback, clipUrls } = await req.json();

  // Check if already exists
  const existing = await db
    .select()
    .from(grSessionPlayers)
    .where(and(eq(grSessionPlayers.sessionId, id), eq(grSessionPlayers.playerId, playerId)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(grSessionPlayers)
      .set({ feedback, clipUrls })
      .where(and(eq(grSessionPlayers.sessionId, id), eq(grSessionPlayers.playerId, playerId)));
  } else {
    await db.insert(grSessionPlayers).values({ sessionId: id, playerId, feedback, clipUrls });
  }

  return NextResponse.json({ success: true });
}
