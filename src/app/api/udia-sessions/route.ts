import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/firebase/auth-helpers";
import { adminDb } from "@/lib/firebase/admin";
import { z } from "zod";

const createSchema = z.object({
  date: z.string(),
  startTime: z.string().optional(),
  objectives: z.string().optional(),
  notes: z.string().optional(),
  clipUrls: z.array(z.string()).optional(),
  players: z.array(z.object({
    playerId: z.string(),
    feedback: z.string().optional(),
    clipUrls: z.array(z.string()).optional(),
  })).optional(),
});

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessionsSnap = await adminDb
    .collection("udiaSessions")
    .where("clubId", "==", user.clubId)
    .orderBy("date", "desc")
    .get();

  const sessionsWithPlayers = await Promise.all(
    sessionsSnap.docs.map(async (d) => {
      const sessionData = { id: d.id, ...d.data() };
      const playersSnap = await adminDb
        .collection("udiaSessionPlayers")
        .where("sessionId", "==", d.id)
        .get();

      const players = await Promise.all(
        playersSnap.docs.map(async (p) => {
          const pd = p.data();
          const playerDoc = await adminDb.collection("players").doc(pd.playerId).get();
          return {
            ...pd,
            playerName: playerDoc.exists ? playerDoc.data()?.name : null,
          };
        })
      );
      return { ...sessionData, players };
    })
  );

  return NextResponse.json(sessionsWithPlayers);
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const { players: sessionPlayers, ...sessionData } = parsed.data;

  const ref = adminDb.collection("udiaSessions").doc();
  const session = {
    id: ref.id,
    ...sessionData,
    clipUrls: sessionData.clipUrls || [],
    clubId: user.clubId,
    createdBy: user.id,
    createdAt: new Date().toISOString(),
  };
  await ref.set(session);

  if (sessionPlayers && sessionPlayers.length > 0) {
    const batch = adminDb.batch();
    sessionPlayers.forEach((p) => {
      const pRef = adminDb.collection("udiaSessionPlayers").doc();
      batch.set(pRef, {
        sessionId: ref.id,
        playerId: p.playerId,
        feedback: p.feedback || null,
        clipUrls: p.clipUrls || [],
      });
    });
    await batch.commit();
  }

  return NextResponse.json(session, { status: 201 });
}
