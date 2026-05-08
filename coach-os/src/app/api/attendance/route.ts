import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { attendances } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const createSchema = z.object({
  eventId: z.string().uuid(),
  playerId: z.string().uuid(),
  status: z.enum(["present", "absent", "justified", "injured", "late"]),
  note: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const eventId = url.searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId obrigatório" }, { status: 400 });

  const rows = await db
    .select()
    .from(attendances)
    .where(eq(attendances.eventId, eventId));

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const { eventId, playerId, status, note } = parsed.data;

  // Upsert
  const existing = await db
    .select()
    .from(attendances)
    .where(and(eq(attendances.eventId, eventId), eq(attendances.playerId, playerId)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(attendances)
      .set({ status, note, updatedAt: new Date() })
      .where(and(eq(attendances.eventId, eventId), eq(attendances.playerId, playerId)));
  } else {
    await db.insert(attendances).values({ eventId, playerId, status, note });
  }

  return NextResponse.json({ success: true });
}
