import { NextRequest } from "next/server";
import { adminAuth } from "./admin";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  clubId: string | null;
  globalRole: "super_admin" | "club_admin" | "staff" | "player";
  staffDept: "medical" | "udia" | "gr_coach" | null;
}

/**
 * Verifica o Firebase ID Token do header Authorization e retorna os dados
 * do utilizador (claims) armazenados no Firestore.
 */
export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = req.headers.get("Authorization");
    const cookieToken = req.cookies.get("__session")?.value;
    const token = authHeader?.replace("Bearer ", "") || cookieToken;

    if (!token) return null;

    const decoded = await adminAuth.verifyIdToken(token);
    const { adminDb } = await import("./admin");

    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    if (!userDoc.exists) return null;

    const data = userDoc.data()!;
    return {
      id: decoded.uid,
      email: data.email,
      name: data.name,
      clubId: data.clubId || null,
      globalRole: data.globalRole || "staff",
      staffDept: data.staffDept || null,
    };
  } catch {
    return null;
  }
}
