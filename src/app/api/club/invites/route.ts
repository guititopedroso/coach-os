import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { invites } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { z } from "zod";

const createSchema = z.object({
  email: z.string().email(),
  globalRole: z.enum(["staff", "player"]),
  staffDept: z.enum(["medical", "udia", "gr_coach"]).optional(),
  teamId: z.string().uuid().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  const rows = await db
    .select()
    .from(invites)
    .where(eq(invites.clubId, user.clubId))
    .orderBy(invites.createdAt);

  return NextResponse.json(rows.reverse());
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

  const [invite] = await db
    .insert(invites)
    .values({
      clubId: user.clubId,
      email: parsed.data.email,
      globalRole: parsed.data.globalRole,
      staffDept: parsed.data.staffDept,
      teamId: parsed.data.teamId,
      token,
      expiresAt,
      createdBy: user.id,
    })
    .returning();

  return NextResponse.json({
    ...invite,
    inviteLink: `${process.env.NEXTAUTH_URL}/convite/${token}`,
  }, { status: 201 });
}
