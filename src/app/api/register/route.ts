import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/firebase/auth-helpers";
import { adminDb } from "@/lib/firebase/admin";
import { z } from "zod";
import { randomBytes } from "crypto";

const createSchema = z.object({
  clubName: z.string().min(2).max(100),
  adminName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  slug: z.string().min(2).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos: " + parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { clubName, adminName, email, password, slug } = parsed.data;

    // Verificar slug único
    const slugSnap = await adminDb
      .collection("clubs")
      .where("slug", "==", slug)
      .limit(1)
      .get();

    const finalSlug = !slugSnap.empty ? `${slug}-${Date.now()}` : slug;

    // Criar user no Firebase Auth
    const { adminAuth } = await import("@/lib/firebase/admin");
    let firebaseUser;
    try {
      firebaseUser = await adminAuth.createUser({ email, password, displayName: adminName });
    } catch (err: any) {
      if (err.code === "auth/email-already-exists") {
        return NextResponse.json({ error: "Este email já está registado." }, { status: 409 });
      }
      throw err;
    }

    // Criar clube no Firestore
    const clubRef = adminDb.collection("clubs").doc();
    await clubRef.set({
      name: clubName,
      slug: finalSlug,
      plan: "free",
      maxTeams: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Criar perfil do utilizador no Firestore
    await adminDb.collection("users").doc(firebaseUser.uid).set({
      clubId: clubRef.id,
      email,
      name: adminName,
      globalRole: "club_admin",
      staffDept: null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Definir custom claims no token Firebase Auth
    await adminAuth.setCustomUserClaims(firebaseUser.uid, {
      clubId: clubRef.id,
      globalRole: "club_admin",
    });

    return NextResponse.json(
      { success: true, message: "Clube criado com sucesso." },
      { status: 201 }
    );
  } catch (err) {
    console.error("[REGISTER]", err);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
