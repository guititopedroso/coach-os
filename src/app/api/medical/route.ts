import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/firebase/auth-helpers";
import { adminDb } from "@/lib/firebase/admin";
import { z } from "zod";

const createSchema = z.object({
  playerId: z.string(),
  teamId: z.string(),
  type: z.enum(["injury", "physio", "cryo", "massage", "other"]),
  description: z.string().min(1),
  bodyPart: z.string().optional(),
  severity: z.enum(["minor", "moderate", "severe"]).optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const snap = await adminDb
    .collection("medicalRecords")
    .where("clubId", "==", user.clubId)
    .orderBy("createdAt", "desc")
    .get();

  // Enriquecer com nome do jogador
  const rows = await Promise.all(
    snap.docs.map(async (d) => {
      const data = d.data();
      let playerName = null;
      if (data.playerId) {
        const playerDoc = await adminDb.collection("players").doc(data.playerId).get();
        if (playerDoc.exists) playerName = playerDoc.data()?.name;
      }
      return { id: d.id, ...data, playerName };
    })
  );

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const ref = adminDb.collection("medicalRecords").doc();
  const record = {
    id: ref.id,
    ...parsed.data,
    clubId: user.clubId,
    createdBy: user.id,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await ref.set(record);
  return NextResponse.json(record, { status: 201 });
}
