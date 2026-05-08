import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { seasons, clubs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(2),
  startDate: z.string(),
  endDate: z.string(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  const rows = await db
    .select()
    .from(seasons)
    .where(eq(seasons.clubId, user.clubId))
    .orderBy(desc(seasons.createdAt));

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

  const { name, startDate, endDate } = parsed.data;

  const [season] = await db
    .insert(seasons)
    .values({ clubId: user.clubId, name, startDate, endDate, isActive: false })
    .returning();

  return NextResponse.json(season, { status: 201 });
}
