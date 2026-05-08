import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { teams, seasons } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  ageGroup: z.string().optional(),
  color: z.string().optional(),
  seasonId: z.string().uuid(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  const url = new URL(req.url);
  const seasonId = url.searchParams.get("seasonId");

  let query = db.select().from(teams).where(eq(teams.clubId, user.clubId));

  const rows = seasonId
    ? await db
        .select()
        .from(teams)
        .where(and(eq(teams.clubId, user.clubId), eq(teams.seasonId, seasonId)))
    : await db.select().from(teams).where(eq(teams.clubId, user.clubId));

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

  const [team] = await db
    .insert(teams)
    .values({ ...parsed.data, clubId: user.clubId })
    .returning();

  return NextResponse.json(team, { status: 201 });
}
