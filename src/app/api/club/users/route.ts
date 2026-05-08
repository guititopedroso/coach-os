import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/firebase/auth-helpers";
import { adminDb } from "@/lib/firebase/admin";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const snap = await adminDb
    .collection("users")
    .where("clubId", "==", user.clubId)
    .get();

  const rows = snap.docs
    .filter((d) => d.id !== user.id)
    .map((d) => ({
      id: d.id,
      name: d.data().name,
      email: d.data().email,
      globalRole: d.data().globalRole,
      staffDept: d.data().staffDept,
      isActive: d.data().isActive,
      createdAt: d.data().createdAt,
    }));

  return NextResponse.json(rows);
}
