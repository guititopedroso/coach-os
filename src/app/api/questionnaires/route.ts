import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { questionnaireResponses, players, users } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { z } from "zod";

const createSchema = z.object({
  teamId: z.string().uuid(),
  type: z.enum(["psr", "pse", "post_match"]),
  eventId: z.string().uuid().optional(),
  date: z.string(),
  answers: z.record(z.string(), z.any()),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const teamId = url.searchParams.get("teamId");
  const type = url.searchParams.get("type");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const playerId = url.searchParams.get("playerId");

  if (!teamId) return NextResponse.json({ error: "teamId obrigatório" }, { status: 400 });

  const conditions: any[] = [eq(questionnaireResponses.teamId, teamId)];
  if (type) conditions.push(eq(questionnaireResponses.type, type as any));
  if (from) conditions.push(gte(questionnaireResponses.date, from));
  if (to) conditions.push(lte(questionnaireResponses.date, to));
  if (playerId) conditions.push(eq(questionnaireResponses.playerId, playerId));

  // Join com players para obter nome
  const rows = await db
    .select({
      id: questionnaireResponses.id,
      playerId: questionnaireResponses.playerId,
      teamId: questionnaireResponses.teamId,
      type: questionnaireResponses.type,
      eventId: questionnaireResponses.eventId,
      sequenceNumber: questionnaireResponses.sequenceNumber,
      date: questionnaireResponses.date,
      answers: questionnaireResponses.answers,
      submittedAt: questionnaireResponses.submittedAt,
      playerName: players.name,
    })
    .from(questionnaireResponses)
    .leftJoin(players, eq(questionnaireResponses.playerId, players.id))
    .where(and(...conditions))
    .orderBy(questionnaireResponses.date, questionnaireResponses.submittedAt);

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { teamId, type, eventId, date, answers } = parsed.data;

  // Obter playerId do utilizador (se for jogador)
  let playerId = body.playerId;

  if (!playerId && user.globalRole === "player") {
    const [player] = await db
      .select({ id: players.id })
      .from(players)
      .where(eq(players.userId, user.id))
      .limit(1);
    if (player) playerId = player.id;
  }

  if (!playerId) {
    return NextResponse.json({ error: "playerId obrigatório" }, { status: 400 });
  }

  // Calcular sequence number
  const existingCount = await db
    .select({ id: questionnaireResponses.id })
    .from(questionnaireResponses)
    .where(
      and(
        eq(questionnaireResponses.playerId, playerId),
        eq(questionnaireResponses.type, type)
      )
    );

  const sequenceNumber = existingCount.length + 1;

  const [response] = await db
    .insert(questionnaireResponses)
    .values({
      playerId,
      teamId,
      type,
      eventId: eventId || null,
      date,
      answers,
      sequenceNumber,
    })
    .returning();

  return NextResponse.json(response, { status: 201 });
}
