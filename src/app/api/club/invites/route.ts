import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/firebase/auth-helpers";
import { adminDb } from "@/lib/firebase/admin";
import { z } from "zod";
import { randomBytes } from "crypto";

const createSchema = z.object({
  email: z.string().email(),
  globalRole: z.enum(["staff", "player"]),
  staffDept: z.enum(["medical", "udia", "gr_coach"]).optional(),
  teamId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const snap = await adminDb
    .collection("invites")
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

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const ref = adminDb.collection("invites").doc();
  const invite = {
    id: ref.id,
    clubId: user.clubId,
    email: parsed.data.email,
    globalRole: parsed.data.globalRole,
    staffDept: parsed.data.staffDept || null,
    teamId: parsed.data.teamId || null,
    token,
    expiresAt: expiresAt.toISOString(),
    acceptedAt: null,
    createdBy: user.id,
    createdAt: new Date().toISOString(),
  };
  await ref.set(invite);

  return NextResponse.json({
    ...invite,
    inviteLink: `${process.env.NEXT_PUBLIC_APP_URL}/convite/${token}`,
  }, { status: 201 });
}
