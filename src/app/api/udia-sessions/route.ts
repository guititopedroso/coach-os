import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { udiaSessions, udiaSessionPlayers, players } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
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
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  const sessions = await db
    .select()
    .from(udiaSessions)
    .where(eq(udiaSessions.clubId, user.clubId))
    .orderBy(udiaSessions.date);

  const sessionsWithPlayers = await Promise.all(
    sessions.map(async (s) => {
      const sessionPlayers = await db
        .select({
          playerId: udiaSessionPlayers.playerId,
          feedback: udiaSessionPlayers.feedback,
          clipUrls: udiaSessionPlayers.clipUrls,
          playerName: players.name,
        })
        .from(udiaSessionPlayers)
        .leftJoin(players, eq(udiaSessionPlayers.playerId, players.id))
        .where(eq(udiaSessionPlayers.sessionId, s.id));
      return { ...s, players: sessionPlayers };
    })
  );

  return NextResponse.json(sessionsWithPlayers.reverse());
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const { players: sessionPlayers, ...sessionData } = parsed.data;

  const [udiaSession] = await db
    .insert(udiaSessions)
    .values({ ...sessionData, clubId: user.clubId, createdBy: user.id })
    .returning();

  if (sessionPlayers && sessionPlayers.length > 0) {
    await db.insert(udiaSessionPlayers).values(
      sessionPlayers.map((p) => ({
        sessionId: udiaSession.id,
        playerId: p.playerId,
        feedback: p.feedback,
        clipUrls: p.clipUrls || [],
      }))
    );
  }

  return NextResponse.json(udiaSession, { status: 201 });
}
