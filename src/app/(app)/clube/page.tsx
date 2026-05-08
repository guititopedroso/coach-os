import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { clubs, seasons, teams, users, players } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";
import Link from "next/link";

export default async function ClubePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as any;
  if (!["club_admin", "super_admin"].includes(user.globalRole)) {
    redirect("/dashboard");
  }

  // Buscar dados do clube
  const [club] = await db
    .select()
    .from(clubs)
    .where(eq(clubs.id, user.clubId))
    .limit(1);

  if (!club) redirect("/login");

  // Épocas
  const allSeasons = await db
    .select()
    .from(seasons)
    .where(eq(seasons.clubId, club.id))
    .orderBy(seasons.createdAt);

  const activeSeason = allSeasons.find((s) => s.isActive);

  // Equipas da época ativa
  const activeTeams = activeSeason
    ? await db
        .select()
        .from(teams)
        .where(eq(teams.seasonId, activeSeason.id))
    : [];

  // Staff total
  const staffCount = await db
    .select({ count: count() })
    .from(users)
    .where(and(eq(users.clubId, club.id), eq(users.isActive, true)));

  // Atletas total
  const playersCount = await db
    .select({ count: count() })
    .from(players)
    .where(and(eq(players.clubId, club.id), eq(players.isActive, true)));

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
              value: staffCount[0]?.count ?? 0,
              icon: "👤",
              color: "#8b5cf6",
            },
            {
              label: "Atletas",
              value: playersCount[0]?.count ?? 0,
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
                {activeTeams.map((team) => (
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
