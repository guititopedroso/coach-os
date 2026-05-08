import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { players } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  teamId: z.string().uuid(),
  number: z.number().optional(),
  position: z.enum(["goalkeeper", "defender", "midfielder", "forward"]).default("midfielder"),
  birthDate: z.string().optional(),
  nationality: z.string().optional(),
  phone: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  const url = new URL(req.url);
  const teamId = url.searchParams.get("teamId");

  const rows = teamId
    ? await db
        .select()
        .from(players)
        .where(and(eq(players.clubId, user.clubId), eq(players.teamId, teamId), eq(players.isActive, true)))
    : await db
        .select()
        .from(players)
        .where(and(eq(players.clubId, user.clubId), eq(players.isActive, true)));

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos: " + parsed.error.issues[0].message }, { status: 400 });
  }

  const [player] = await db
    .insert(players)
    .values({ ...parsed.data, clubId: user.clubId })
    .returning();

  return NextResponse.json(player, { status: 201 });
}
