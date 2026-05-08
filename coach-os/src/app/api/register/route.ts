import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clubs, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  clubName: z.string().min(2).max(100),
  adminName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  slug: z.string().min(2).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos: " + parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { clubName, adminName, email, password, slug } = parsed.data;

    // Verificar se email já existe
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Este email já está registado." },
        { status: 409 }
      );
    }

    // Verificar slug único
    const existingClub = await db
      .select({ id: clubs.id })
      .from(clubs)
      .where(eq(clubs.slug, slug))
      .limit(1);

    const finalSlug =
      existingClub.length > 0 ? `${slug}-${Date.now()}` : slug;

    // Criar clube
    const [club] = await db
      .insert(clubs)
      .values({
        name: clubName,
        slug: finalSlug,
        plan: "free",
        maxTeams: 1,
      })
      .returning();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar utilizador admin
    await db.insert(users).values({
      clubId: club.id,
      email,
      name: adminName,
      hashedPassword,
      globalRole: "club_admin",
    });

    return NextResponse.json(
      { success: true, message: "Clube criado com sucesso." },
      { status: 201 }
    );
  } catch (err) {
    console.error("[REGISTER]", err);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
