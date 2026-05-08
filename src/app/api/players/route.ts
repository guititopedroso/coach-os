import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/firebase/auth-helpers";
import { adminDb } from "@/lib/firebase/admin";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  teamId: z.string(),
  number: z.number().optional(),
  position: z.enum(["goalkeeper", "defender", "midfielder", "forward"]).default("midfielder"),
  birthDate: z.string().optional(),
  nationality: z.string().optional(),
  phone: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const teamId = url.searchParams.get("teamId");

  let query = adminDb
    .collection("players")
    .where("clubId", "==", user.clubId)
    .where("isActive", "==", true);

  if (teamId) {
    query = query.where("teamId", "==", teamId) as any;
  }

  const snap = await query.get();
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos: " + parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const ref = adminDb.collection("players").doc();
  const player = {
    id: ref.id,
    ...parsed.data,
    clubId: user.clubId,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  await ref.set(player);

  return NextResponse.json(player, { status: 201 });
}
