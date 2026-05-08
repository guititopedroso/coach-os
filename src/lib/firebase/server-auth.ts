import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export interface ServerUser {
  id: string;
  email: string;
  name: string;
  clubId: string | null;
  globalRole: "super_admin" | "club_admin" | "staff" | "player";
  staffDept: "medical" | "udia" | "gr_coach" | null;
  image: string | null;
}

/**
 * Verifica o Firebase ID Token no cookie __session e devolve os dados do utilizador.
 * Usar em Server Components e páginas do lado do servidor.
 */
export async function getServerUser(): Promise<ServerUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("__session")?.value;
    if (!token) return null;

    const decoded = await adminAuth.verifyIdToken(token);
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
      image: data.avatarUrl || null,
    };
  } catch {
    return null;
  }
}
