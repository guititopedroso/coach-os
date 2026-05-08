import { getServerUser } from "@/lib/firebase/server-auth";
import { adminDb } from "@/lib/firebase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ClubePage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  if (!["club_admin", "super_admin"].includes(user.globalRole)) {
    redirect("/dashboard");
  }

  // Buscar dados do clube
  const clubDoc = await adminDb.collection("clubs").doc(user.clubId!).get();
  if (!clubDoc.exists) redirect("/login");
  const club = { id: clubDoc.id, ...clubDoc.data() } as any;

  // Épocas
  const seasonsSnap = await adminDb
    .collection("seasons")
    .where("clubId", "==", club.id)
    .orderBy("createdAt", "desc")
    .get();
  const allSeasons = seasonsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];

  const activeSeason = allSeasons.find((s: any) => s.isActive);

  // Equipas da época ativa
  const activeTeams: any[] = activeSeason
    ? await adminDb
        .collection("teams")
        .where("seasonId", "==", activeSeason.id)
        .get()
        .then((snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    : [];

  // Staff total
  const staffSnap = await adminDb
    .collection("users")
    .where("clubId", "==", club.id)
    .where("isActive", "==", true)
    .get();
  const staffCount = staffSnap.size;

  // Atletas total
  const playersSnap = await adminDb
    .collection("players")
    .where("clubId", "==", club.id)
    .where("isActive", "==", true)
    .get();
  const playersCount = playersSnap.size;

  const planColors: Record<string, string> = {
    free: "#6b7280",
    starter: "#3b82f6",
    pro: "#8b5cf6",
    elite: "#f59e0b",
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
            🏛️ {club.name}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
            Portal de Coordenação
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span
            className="badge"
            style={{
              background: planColors[club.plan] + "22",
              color: planColors[club.plan],
            }}
          >
            Plano {club.plan.charAt(0).toUpperCase() + club.plan.slice(1)}
          </span>
          <Link href="/clube/epocas" className="btn btn-primary btn-sm">
            + Nova Época
          </Link>
        </div>
      </div>

      <div className="page-content">
        {/* Stats overview */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {[
            {
              label: "Época Ativa",
              value: activeSeason?.name ?? "—",
              icon: "📆",
              color: "#3b82f6",
            },
            {
              label: "Equipas",
              value: activeTeams.length,
              icon: "⚽",
              color: "#10b981",
            },
            {
              label: "Staff",
              value: staffCount,
              icon: "👤",
              color: "#8b5cf6",
            },
            {
              label: "Atletas",
              value: playersCount,
              icon: "🏃",
              color: "#f59e0b",
            },
          ].map((stat) => (
            <div key={stat.label} className="stat-card">
              <div
                className="stat-icon"
                style={{
                  background: stat.color + "22",
                  fontSize: "1.25rem",
                }}
              >
                {stat.icon}
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Equipas da época ativa */}
        {activeSeason && (
          <div style={{ marginBottom: "2rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <h2 style={{ fontSize: "1.125rem" }}>
                Equipas — {activeSeason.name}
              </h2>
              <Link href="/clube/equipas" className="btn btn-ghost btn-sm">
                Gerir equipas →
              </Link>
            </div>

            {activeTeams.length === 0 ? (
              <div
                className="card"
                style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>⚽</div>
                <p>Ainda não criaste nenhuma equipa nesta época.</p>
                <Link
                  href="/clube/equipas"
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: "1rem" }}
                >
                  Criar primeira equipa
                </Link>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: "1rem",
                }}
              >
                {activeTeams.map((team: any) => (
                  <div
                    key={team.id}
                    className="card"
                    style={{ borderLeft: `3px solid ${team.color || "#3b82f6"}` }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "1rem",
                        marginBottom: "0.25rem",
                        color: "var(--text-primary)",
                      }}
                    >
                      {team.name}
                    </div>
                    {team.ageGroup && (
                      <div
                        className="badge badge-gray"
                        style={{ marginBottom: "0.75rem", fontSize: "0.75rem" }}
                      >
                        {team.ageGroup}
                      </div>
                    )}
                    <Link
                      href={`/equipa/${team.id}`}
                      className="btn btn-ghost btn-sm"
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      Ver workspace →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick links */}
        <div>
          <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>
            Acesso Rápido
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "0.75rem",
            }}
          >
            {[
              { href: "/clube/acessos", label: "Gerir Acessos", icon: "🔑", desc: "Convidar staff e jogadores" },
              { href: "/clube/epocas", label: "Épocas", icon: "📆", desc: "Criar e gerir épocas" },
              { href: "/clube/subscricao", label: "Subscrição", icon: "💳", desc: `Plano ${club.plan} — Gerir plano` },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="card" style={{ cursor: "pointer" }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{link.icon}</div>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                  {link.label}
                </div>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{link.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
