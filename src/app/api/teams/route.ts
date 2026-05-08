import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/firebase/auth-helpers";
import { adminDb } from "@/lib/firebase/admin";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  ageGroup: z.string().optional(),
  color: z.string().optional(),
  seasonId: z.string(),
});

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const seasonId = url.searchParams.get("seasonId");

  let query = adminDb.collection("teams").where("clubId", "==", user.clubId) as FirebaseFirestore.Query;
  if (seasonId) query = query.where("seasonId", "==", seasonId);

  const snap = await query.get();
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const ref = adminDb.collection("teams").doc();
  const team = {
    id: ref.id,
    ...parsed.data,
    clubId: user.clubId,
    createdAt: new Date().toISOString(),
  };
  await ref.set(team);
  return NextResponse.json(team, { status: 201 });
}
