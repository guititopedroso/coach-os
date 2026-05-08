import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const snap = await adminDb
    .collection("invites")
    .where("token", "==", token)
    .limit(1)
    .get();

  if (snap.empty) return NextResponse.json({ error: "Convite não encontrado." }, { status: 404 });

  const invite = { id: snap.docs[0].id, ...snap.docs[0].data() } as any;

  if (invite.acceptedAt) return NextResponse.json({ error: "Este convite já foi utilizado." }, { status: 400 });
  if (new Date(invite.expiresAt) < new Date()) return NextResponse.json({ error: "Este convite expirou." }, { status: 400 });

  // Buscar nome do clube
  let clubName = null;
  if (invite.clubId) {
    const clubDoc = await adminDb.collection("clubs").doc(invite.clubId).get();
    if (clubDoc.exists) clubName = clubDoc.data()?.name;
  }

  return NextResponse.json({
    email: invite.email,
    globalRole: invite.globalRole,
    staffDept: invite.staffDept,
    expiresAt: invite.expiresAt,
    clubName,
  });
}
