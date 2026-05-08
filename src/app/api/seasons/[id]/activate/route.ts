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

  // Desactivar todas as épocas do clube
  const allSnap = await adminDb
    .collection("seasons")
    .where("clubId", "==", user.clubId)
    .get();

  const batch = adminDb.batch();
  allSnap.docs.forEach((d) => batch.update(d.ref, { isActive: false }));
  batch.update(adminDb.collection("seasons").doc(id), { isActive: true });
  await batch.commit();

  return NextResponse.json({ success: true });
}
