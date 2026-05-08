import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { seasons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;
  const { id } = await params;

  // Desactivar todas as épocas do clube
  await db
    .update(seasons)
    .set({ isActive: false })
    .where(eq(seasons.clubId, user.clubId));

  // Activar a época escolhida
  await db
    .update(seasons)
    .set({ isActive: true })
    .where(eq(seasons.id, id));

  return NextResponse.json({ success: true });
}
