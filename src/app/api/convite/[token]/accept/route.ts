import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invites, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  password: z.string().min(6),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const [invite] = await db
    .select()
    .from(invites)
    .where(eq(invites.token, token))
    .limit(1);

  if (!invite) return NextResponse.json({ error: "Convite inválido." }, { status: 404 });
  if (invite.acceptedAt) return NextResponse.json({ error: "Convite já utilizado." }, { status: 400 });
  if (new Date(invite.expiresAt) < new Date()) return NextResponse.json({ error: "Convite expirado." }, { status: 400 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const { name, password } = parsed.data;

  // Verificar se o email já existe
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, invite.email)).limit(1);
  if (existing.length > 0) return NextResponse.json({ error: "Já existe uma conta com este email." }, { status: 409 });

  const hashedPassword = await bcrypt.hash(password, 12);

  await db.insert(users).values({
    clubId: invite.clubId,
    email: invite.email,
    name,
    hashedPassword,
    globalRole: invite.globalRole as any,
    staffDept: invite.staffDept as any,
    isActive: true,
  });

  // Marcar convite como aceite
  await db
    .update(invites)
    .set({ acceptedAt: new Date() })
    .where(eq(invites.token, token));

  return NextResponse.json({ success: true });
}
