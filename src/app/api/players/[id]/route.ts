import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/firebase/auth-helpers";
import { adminDb } from "@/lib/firebase/admin";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().optional(),
  number: z.number().optional(),
  position: z.enum(["goalkeeper", "defender", "midfielder", "forward"]).optional(),
  birthDate: z.string().optional(),
  nationality: z.string().optional(),
  phone: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  await adminDb.collection("players").doc(id).update(parsed.data);
  const doc = await adminDb.collection("players").doc(id).get();
  return NextResponse.json({ id: doc.id, ...doc.data() });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(_req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  await adminDb.collection("players").doc(id).update({ isActive: false });
  return NextResponse.json({ success: true });
}
