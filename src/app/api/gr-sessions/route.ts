import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { grSessions, grSessionPlayers, players } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
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
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  let conditions: any[] = [eq(grSessions.clubId, user.clubId)];
  if (from) conditions.push(gte(grSessions.date, from));
  if (to) conditions.push(lte(grSessions.date, to));

  const sessions = await db
    .select()
    .from(grSessions)
    .where(and(...conditions))
    .orderBy(grSessions.date);

  // Buscar jogadores por sessão
  const sessionsWithPlayers = await Promise.all(
    sessions.map(async (s) => {
      const sessionPlayers = await db
        .select({
          playerId: grSessionPlayers.playerId,
          feedback: grSessionPlayers.feedback,
          clipUrls: grSessionPlayers.clipUrls,
          playerName: players.name,
        })
        .from(grSessionPlayers)
        .leftJoin(players, eq(grSessionPlayers.playerId, players.id))
        .where(eq(grSessionPlayers.sessionId, s.id));
      return { ...s, players: sessionPlayers };
    })
  );

  return NextResponse.json(sessionsWithPlayers);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const { playerIds, ...sessionData } = parsed.data;

  const [grSession] = await db
    .insert(grSessions)
    .values({ ...sessionData, clubId: user.clubId, createdBy: user.id })
    .returning();

  if (playerIds && playerIds.length > 0) {
    await db.insert(grSessionPlayers).values(
      playerIds.map((pid) => ({ sessionId: grSession.id, playerId: pid }))
    );
  }

  return NextResponse.json(grSession, { status: 201 });
}
