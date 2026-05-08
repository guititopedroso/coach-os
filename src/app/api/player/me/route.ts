import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/firebase/auth-helpers";
import { adminDb } from "@/lib/firebase/admin";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const snap = await adminDb
    .collection("players")
    .where("userId", "==", user.id)
    .limit(1)
    .get();

  if (snap.empty) return NextResponse.json({ error: "Jogador não encontrado" }, { status: 404 });

  const doc = snap.docs[0];
  return NextResponse.json({ id: doc.id, ...doc.data() });
}
