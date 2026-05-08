import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/firebase/server-auth";

export default async function DashboardPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  const { globalRole, staffDept } = user;

  if (globalRole === "club_admin" || globalRole === "super_admin") {
    redirect("/clube");
  }
  if (globalRole === "player") {
    redirect("/jogador");
  }
  if (globalRole === "staff") {
    if (staffDept === "medical") redirect("/medico");
    if (staffDept === "udia") redirect("/udia");
    if (staffDept === "gr_coach") redirect("/gr");
    redirect("/equipa");
  }

  redirect("/equipa");
}
