import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/firebase/auth-helpers";
import { adminDb } from "@/lib/firebase/admin";
import { z } from "zod";

const createSchema = z.object({
  teamId: z.string(),
  type: z.enum(["psr", "pse", "post_match"]),
  eventId: z.string().optional(),
  date: z.string(),
  answers: z.record(z.string(), z.any()),
});

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const teamId = url.searchParams.get("teamId");
  const type = url.searchParams.get("type");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const playerId = url.searchParams.get("playerId");

  if (!teamId) return NextResponse.json({ error: "teamId obrigatório" }, { status: 400 });

  let query = adminDb.collection("questionnaireResponses").where("teamId", "==", teamId) as FirebaseFirestore.Query;
  if (type) query = query.where("type", "==", type);
  if (from) query = query.where("date", ">=", from);
  if (to) query = query.where("date", "<=", to);
  if (playerId) query = query.where("playerId", "==", playerId);
  query = query.orderBy("date");

  const snap = await query.get();

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

  const { teamId, type, eventId, date, answers } = parsed.data;
  let playerId = body.playerId;

  if (!playerId && user.globalRole === "player") {
    const playerSnap = await adminDb
      .collection("players")
      .where("userId", "==", user.id)
      .limit(1)
      .get();
    if (!playerSnap.empty) playerId = playerSnap.docs[0].id;
  }

  if (!playerId) return NextResponse.json({ error: "playerId obrigatório" }, { status: 400 });

  // Calcular sequence number
  const countSnap = await adminDb
    .collection("questionnaireResponses")
    .where("playerId", "==", playerId)
    .where("type", "==", type)
    .get();

  const sequenceNumber = countSnap.size + 1;

  const ref = adminDb.collection("questionnaireResponses").doc();
  const response = {
    id: ref.id,
    playerId,
    teamId,
    type,
    eventId: eventId || null,
    date,
    answers,
    sequenceNumber,
    submittedAt: new Date().toISOString(),
  };
  await ref.set(response);

  return NextResponse.json(response, { status: 201 });
}
