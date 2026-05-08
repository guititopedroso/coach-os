import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/firebase/auth-helpers";
import { adminDb } from "@/lib/firebase/admin";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(2),
  startDate: z.string(),
  endDate: z.string(),
});

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const snap = await adminDb
    .collection("seasons")
    .where("clubId", "==", user.clubId)
    .orderBy("createdAt", "desc")
    .get();

  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const ref = adminDb.collection("seasons").doc();
  const season = {
    id: ref.id,
    clubId: user.clubId,
    ...parsed.data,
    isActive: false,
    createdAt: new Date().toISOString(),
  };
  await ref.set(season);
  return NextResponse.json(season, { status: 201 });
}
