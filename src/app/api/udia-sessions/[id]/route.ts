import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { udiaSessions, udiaSessionPlayers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = await req.json();
  const { players: sessionPlayers, ...data } = body;

  if (Object.keys(data).length > 0) {
    await db.update(udiaSessions).set(data).where(eq(udiaSessions.id, id));
  }

  if (sessionPlayers !== undefined) {
    await db.delete(udiaSessionPlayers).where(eq(udiaSessionPlayers.sessionId, id));
    if (sessionPlayers.length > 0) {
      await db.insert(udiaSessionPlayers).values(
        sessionPlayers.map((p: any) => ({
          sessionId: id,
          playerId: p.playerId,
          feedback: p.feedback,
          clipUrls: p.clipUrls || [],
        }))
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

  await db.delete(udiaSessionPlayers).where(eq(udiaSessionPlayers.sessionId, id));
  await db.delete(udiaSessions).where(eq(udiaSessions.id, id));
  return NextResponse.json({ success: true });
}
