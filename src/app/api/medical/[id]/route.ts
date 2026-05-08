import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { medicalRecords } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = await req.json();
  const [updated] = await db
    .update(medicalRecords)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(medicalRecords.id, id))
    .returning();

  return NextResponse.json(updated);
}
