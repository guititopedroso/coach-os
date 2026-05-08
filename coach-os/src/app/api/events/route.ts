import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { z } from "zod";

const createSchema = z.object({
  teamId: z.string().uuid(),
  type: z.enum(["training", "match", "rest", "friendly", "cup", "tournament", "cryo", "cohesion", "stage"]),
  title: z.string().min(1),
  date: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  arrivalTime: z.string().optional(),
  location: z.string().optional(),
  opponent: z.string().optional(),
  isHome: z.boolean().optional(),
  competition: z.string().optional(),
  matchday: z.number().optional(),
  trainingUnitNumber: z.number().optional(),
  weekNumber: z.number().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const teamId = url.searchParams.get("teamId");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if (!teamId) return NextResponse.json({ error: "teamId obrigatório" }, { status: 400 });

  let conditions = [eq(events.teamId, teamId)];
  if (from) conditions.push(gte(events.date, from));
  if (to) conditions.push(lte(events.date, to));

  const rows = await db
    .select()
    .from(events)
    .where(and(...conditions))
    .orderBy(events.date, events.startTime);

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos: " + parsed.error.issues[0].message }, { status: 400 });
  }

  const [event] = await db.insert(events).values(parsed.data).returning();
  return NextResponse.json(event, { status: 201 });
}
