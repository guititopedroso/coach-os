import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/firebase/auth-helpers";
import { adminDb } from "@/lib/firebase/admin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = await req.json();
  const { players: sessionPlayers, ...data } = body;

  if (Object.keys(data).length > 0) {
    await adminDb.collection("udiaSessions").doc(id).update(data);
  }

  if (sessionPlayers !== undefined) {
    // Apagar jogadores anteriores
    const existingSnap = await adminDb
      .collection("udiaSessionPlayers")
      .where("sessionId", "==", id)
      .get();

    const batch = adminDb.batch();
    existingSnap.docs.forEach((d) => batch.delete(d.ref));

    if (sessionPlayers.length > 0) {
      sessionPlayers.forEach((p: any) => {
        const pRef = adminDb.collection("udiaSessionPlayers").doc();
        batch.set(pRef, {
          sessionId: id,
          playerId: p.playerId,
          feedback: p.feedback || null,
          clipUrls: p.clipUrls || [],
        });
      });
    }
    await batch.commit();
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const playersSnap = await adminDb
    .collection("udiaSessionPlayers")
    .where("sessionId", "==", id)
    .get();

  const batch = adminDb.batch();
  playersSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(adminDb.collection("udiaSessions").doc(id));
  await batch.commit();

  return NextResponse.json({ success: true });
}
