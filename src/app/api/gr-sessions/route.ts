import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/firebase/auth-helpers";
import { adminDb } from "@/lib/firebase/admin";
import { z } from "zod";

const createSchema = z.object({
  date: z.string(),
  startTime: z.string().optional(),
  ageGroupFilter: z.string().optional(),
  objectives: z.string().optional(),
  notes: z.string().optional(),
  clipUrls: z.array(z.string()).optional(),
  playerIds: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  let query = adminDb.collection("grSessions").where("clubId", "==", user.clubId) as FirebaseFirestore.Query;
  if (from) query = query.where("date", ">=", from);
  if (to) query = query.where("date", "<=", to);
  query = query.orderBy("date");

  const sessionsSnap = await query.get();

  const sessionsWithPlayers = await Promise.all(
    sessionsSnap.docs.map(async (d) => {
      const sessionData = { id: d.id, ...d.data() };
      const playersSnap = await adminDb
        .collection("grSessionPlayers")
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

  const { playerIds, ...sessionData } = parsed.data;

  const ref = adminDb.collection("grSessions").doc();
  const session = {
    id: ref.id,
    ...sessionData,
    clipUrls: sessionData.clipUrls || [],
    clubId: user.clubId,
    createdBy: user.id,
    createdAt: new Date().toISOString(),
  };
  await ref.set(session);

  if (playerIds && playerIds.length > 0) {
    const batch = adminDb.batch();
    playerIds.forEach((pid) => {
      const pRef = adminDb.collection("grSessionPlayers").doc();
      batch.set(pRef, { sessionId: ref.id, playerId: pid });
    });
    await batch.commit();
  }

  return NextResponse.json(session, { status: 201 });
}
