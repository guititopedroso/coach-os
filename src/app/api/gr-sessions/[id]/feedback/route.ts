import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/firebase/auth-helpers";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const { playerId, feedback, clipUrls } = await req.json();

  const existingSnap = await adminDb
    .collection("grSessionPlayers")
    .where("sessionId", "==", id)
    .where("playerId", "==", playerId)
    .limit(1)
    .get();

  if (!existingSnap.empty) {
    await existingSnap.docs[0].ref.update({ feedback, clipUrls: clipUrls || [] });
  } else {
    await adminDb.collection("grSessionPlayers").add({
      sessionId: id,
      playerId,
      feedback: feedback || null,
      clipUrls: clipUrls || [],
    });
  }

  return NextResponse.json({ success: true });
}
