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
  await adminDb.collection("users").doc(id).update({
    ...body,
    updatedAt: new Date().toISOString(),
  });

  const doc = await adminDb.collection("users").doc(id).get();
  return NextResponse.json({ id: doc.id, isActive: doc.data()?.isActive });
}
