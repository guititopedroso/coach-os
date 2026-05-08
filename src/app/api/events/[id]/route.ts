import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/firebase/auth-helpers";
import { adminDb } from "@/lib/firebase/admin";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().optional(),
  date: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  arrivalTime: z.string().optional(),
  location: z.string().optional(),
  opponent: z.string().optional(),
  isHome: z.boolean().optional(),
  competition: z.string().optional(),
  matchday: z.number().optional(),
  notes: z.string().optional(),
  isPublished: z.boolean().optional(),
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

  await adminDb.collection("events").doc(id).update({
    ...parsed.data,
    updatedAt: new Date().toISOString(),
  });

  const doc = await adminDb.collection("events").doc(id).get();
  return NextResponse.json({ id: doc.id, ...doc.data() });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(_req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  await adminDb.collection("events").doc(id).delete();
  return NextResponse.json({ success: true });
}
