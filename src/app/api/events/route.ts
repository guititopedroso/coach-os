import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/firebase/auth-helpers";
import { adminDb } from "@/lib/firebase/admin";
import { z } from "zod";

const createSchema = z.object({
  teamId: z.string(),
  type: z.enum(["training", "match", "rest", "friendly", "cup", "tournament", "cryo", "cohesion", "stage"]),
  title: z.string().min(1),
  date: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  arrivalTime: z.string().optional(),
  location: z.string().optional(),
  opponent: z.string().optional(),
  isHome: z.boolean().optional(),
  competition: z.string().optional(),
  matchday: z.number().optional(),
  trainingUnitNumber: z.number().optional(),
  weekNumber: z.number().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const teamId = url.searchParams.get("teamId");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if (!teamId) return NextResponse.json({ error: "teamId obrigatório" }, { status: 400 });

  let query = adminDb.collection("events").where("teamId", "==", teamId) as FirebaseFirestore.Query;
  if (from) query = query.where("date", ">=", from);
  if (to) query = query.where("date", "<=", to);
  query = query.orderBy("date");

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
    return NextResponse.json({ error: "Dados inválidos: " + parsed.error.issues[0].message }, { status: 400 });
  }

  const ref = adminDb.collection("events").doc();
  const event = {
    id: ref.id,
    ...parsed.data,
    isPublished: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await ref.set(event);
  return NextResponse.json(event, { status: 201 });
}
