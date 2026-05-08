import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invites, clubs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const [invite] = await db
    .select({
      id: invites.id,
      email: invites.email,
      globalRole: invites.globalRole,
      staffDept: invites.staffDept,
      expiresAt: invites.expiresAt,
      acceptedAt: invites.acceptedAt,
      clubId: invites.clubId,
      clubName: clubs.name,
    })
    .from(invites)
    .leftJoin(clubs, eq(invites.clubId, clubs.id))
    .where(eq(invites.token, token))
    .limit(1);

  if (!invite) return NextResponse.json({ error: "Convite não encontrado." }, { status: 404 });
  if (invite.acceptedAt) return NextResponse.json({ error: "Este convite já foi utilizado." }, { status: 400 });
  if (new Date(invite.expiresAt) < new Date()) return NextResponse.json({ error: "Este convite expirou." }, { status: 400 });

  return NextResponse.json({
    email: invite.email,
    globalRole: invite.globalRole,
    staffDept: invite.staffDept,
    expiresAt: invite.expiresAt,
    clubName: invite.clubName,
  });
}
