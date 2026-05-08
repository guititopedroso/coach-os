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
  const { playerIds, ...data } = body;

  if (Object.keys(data).length > 0) {
    await adminDb.collection("grSessions").doc(id).update(data);
  }

  if (playerIds !== undefined) {
    const existingSnap = await adminDb
      .collection("grSessionPlayers")
      .where("sessionId", "==", id)
      .get();

    const batch = adminDb.batch();
    existingSnap.docs.forEach((d) => batch.delete(d.ref));

    if (playerIds.length > 0) {
      playerIds.forEach((pid: string) => {
        const pRef = adminDb.collection("grSessionPlayers").doc();
        batch.set(pRef, { sessionId: id, playerId: pid });
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
    .collection("grSessionPlayers")
    .where("sessionId", "==", id)
    .get();

  const batch = adminDb.batch();
  playersSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(adminDb.collection("grSessions").doc(id));
  await batch.commit();

  return NextResponse.json({ success: true });
}
