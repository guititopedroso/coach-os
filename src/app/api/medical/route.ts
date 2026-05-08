import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { medicalRecords, players } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const createSchema = z.object({
  playerId: z.string().uuid(),
  teamId: z.string().uuid(),
  type: z.enum(["injury", "physio", "cryo", "massage", "other"]),
  description: z.string().min(1),
  bodyPart: z.string().optional(),
  severity: z.enum(["minor", "moderate", "severe"]).optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  const rows = await db
    .select({
      id: medicalRecords.id,
      playerId: medicalRecords.playerId,
      teamId: medicalRecords.teamId,
      type: medicalRecords.type,
      description: medicalRecords.description,
      bodyPart: medicalRecords.bodyPart,
      severity: medicalRecords.severity,
      startDate: medicalRecords.startDate,
      endDate: medicalRecords.endDate,
      isActive: medicalRecords.isActive,
      notes: medicalRecords.notes,
      createdAt: medicalRecords.createdAt,
      playerName: players.name,
    })
    .from(medicalRecords)
    .leftJoin(players, eq(medicalRecords.playerId, players.id))
    .where(eq(medicalRecords.clubId, user.clubId))
    .orderBy(medicalRecords.createdAt);

  return NextResponse.json(rows.reverse());
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const [record] = await db
    .insert(medicalRecords)
    .values({ ...parsed.data, clubId: user.clubId, createdBy: user.id })
    .returning();

  return NextResponse.json(record, { status: 201 });
}
