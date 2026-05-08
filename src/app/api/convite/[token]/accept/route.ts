import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
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

  const snap = await adminDb
    .collection("invites")
    .where("token", "==", token)
    .limit(1)
    .get();

  if (snap.empty) return NextResponse.json({ error: "Convite inválido." }, { status: 404 });

  const inviteDoc = snap.docs[0];
  const invite = inviteDoc.data() as any;

  if (invite.acceptedAt) return NextResponse.json({ error: "Convite já utilizado." }, { status: 400 });
  if (new Date(invite.expiresAt) < new Date()) return NextResponse.json({ error: "Convite expirado." }, { status: 400 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const { name, password } = parsed.data;

  // Criar utilizador no Firebase Auth
  let firebaseUser;
  try {
    firebaseUser = await adminAuth.createUser({
      email: invite.email,
      password,
      displayName: name,
    });
  } catch (err: any) {
    if (err.code === "auth/email-already-exists") {
      return NextResponse.json({ error: "Já existe uma conta com este email." }, { status: 409 });
    }
    throw err;
  }

  // Criar perfil no Firestore
  await adminDb.collection("users").doc(firebaseUser.uid).set({
    clubId: invite.clubId,
    email: invite.email,
    name,
    globalRole: invite.globalRole,
    staffDept: invite.staffDept || null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Definir custom claims
  await adminAuth.setCustomUserClaims(firebaseUser.uid, {
    clubId: invite.clubId,
    globalRole: invite.globalRole,
  });

  // Marcar convite como aceite
  await inviteDoc.ref.update({ acceptedAt: new Date().toISOString() });

  return NextResponse.json({ success: true });
}
