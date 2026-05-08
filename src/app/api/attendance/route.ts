import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/firebase/auth-helpers";
import { adminDb } from "@/lib/firebase/admin";
import { z } from "zod";

const createSchema = z.object({
  eventId: z.string(),
  playerId: z.string(),
  status: z.enum(["present", "absent", "justified", "injured", "late"]),
  note: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const eventId = url.searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId obrigatório" }, { status: 400 });

  const snap = await adminDb
    .collection("attendances")
    .where("eventId", "==", eventId)
    .get();

  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const { eventId, playerId, status, note } = parsed.data;

  // Upsert: verificar se já existe
  const existing = await adminDb
    .collection("attendances")
    .where("eventId", "==", eventId)
    .where("playerId", "==", playerId)
    .limit(1)
    .get();

  const data = {
    eventId,
    playerId,
    status,
    note: note || null,
    updatedAt: new Date().toISOString(),
  };

  if (!existing.empty) {
    await existing.docs[0].ref.update(data);
  } else {
    await adminDb.collection("attendances").add({
      ...data,
      createdAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({ success: true });
}
