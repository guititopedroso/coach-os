import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function GrHomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>🥅 Portal — Treinador de GR's</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
            Gestão de sessões e desenvolvimento de guarda-redes
          </p>
        </div>
        <Link href="/gr/agenda" className="btn btn-primary btn-sm">
          Ver agenda →
        </Link>
      </div>
      <div className="page-content">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
          {[
            { href: "/gr/agenda", label: "Agenda Semanal", icon: "📅", desc: "Agenda de sessões de GR por semana. Filtro por escalão." },
            { href: "/gr/guardas-redes", label: "Guarda-Redes", icon: "🧤", desc: "Lista de todos os GR's do clube. Perfil e histórico." },
            { href: "/gr/feedback", label: "Feedback & Clips", icon: "🎬", desc: "Feedback individual com análise de vídeo por atleta." },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="card" style={{ cursor: "pointer", borderTop: "2px solid #f59e0b" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{item.icon}</div>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)", marginBottom: "0.375rem" }}>
                {item.label}
              </div>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
