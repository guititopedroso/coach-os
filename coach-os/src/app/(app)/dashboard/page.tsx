import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = (session.user as any).globalRole;
  const staffDept = (session.user as any).staffDept;

  if (role === "club_admin" || role === "super_admin") {
    redirect("/clube");
  }
  if (role === "player") {
    redirect("/jogador");
  }
  if (role === "staff") {
    if (staffDept === "medical") redirect("/medico");
    if (staffDept === "udia") redirect("/udia");
    if (staffDept === "gr_coach") redirect("/gr");
    redirect("/equipa");
  }

  redirect("/equipa");
}
