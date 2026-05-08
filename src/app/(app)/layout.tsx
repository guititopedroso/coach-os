import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppSidebar from "@/components/layout/AppSidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="app-layout">
      <AppSidebar user={session.user as any} />
      <main className="main-content">{children}</main>
    </div>
  );
}
