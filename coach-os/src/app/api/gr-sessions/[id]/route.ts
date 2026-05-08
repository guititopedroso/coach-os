import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { grSessions, grSessionPlayers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = await req.json();
  const { playerIds, ...data } = body;

  await db.update(grSessions).set(data).where(eq(grSessions.id, id));

  if (playerIds !== undefined) {
    await db.delete(grSessionPlayers).where(eq(grSessionPlayers.sessionId, id));
    if (playerIds.length > 0) {
      await db.insert(grSessionPlayers).values(
        playerIds.map((pid: string) => ({ sessionId: id, playerId: pid }))
      );
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  await db.delete(grSessionPlayers).where(eq(grSessionPlayers.sessionId, id));
  await db.delete(grSessions).where(eq(grSessions.id, id));
  return NextResponse.json({ success: true });
}
