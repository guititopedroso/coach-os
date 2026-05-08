import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      globalRole: users.globalRole,
      staffDept: users.staffDept,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(and(eq(users.clubId, user.clubId), ne(users.id, user.id)))
    .orderBy(users.createdAt);

  return NextResponse.json(rows);
}
