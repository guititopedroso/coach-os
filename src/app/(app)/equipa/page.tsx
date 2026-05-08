import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { teams, seasons, players, events, questionnaireResponses } from "@/lib/db/schema";
import { eq, and, count, gte } from "drizzle-orm";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function EquipaHomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as any;

  // Para club_admin, redirecionar para /clube
  if (user.globalRole === "club_admin") redirect("/clube");

  // Buscar equipa ativa para este utilizador (simplificado - pega primeira equipa do clube)
  const allTeams = await db
    .select()
    .from(teams)
    .where(eq(teams.clubId, user.clubId))
    .limit(5);

  if (allTeams.length === 0) {
    return (
      <div>
        <div className="page-header">
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>⚽ Equipa Técnica</h1>
        </div>
        <div className="page-content">
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⚽</div>
            <h3>Ainda não foste atribuído a nenhuma equipa</h3>
            <p style={{ marginTop: "0.5rem", color: "var(--text-muted)" }}>
              Contacta a coordenação para seres adicionado a uma equipa.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const team = allTeams[0];
  const today = new Date().toISOString().split("T")[0];

  // Próximos eventos (próximos 7 dias)
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split("T")[0];

  const upcomingEvents = await db
    .select()
    .from(events)
    .where(and(eq(events.teamId, team.id), gte(events.date, today)))
    .orderBy(events.date)
    .limit(5);

  const totalPlayers = await db
    .select({ count: count() })
    .from(players)
    .where(and(eq(players.teamId, team.id), eq(players.isActive, true)));

  // PSR hoje - quantos responderam
  const psrToday = await db
    .select({ count: count() })
    .from(questionnaireResponses)
    .where(
      and(
        eq(questionnaireResponses.teamId, team.id),
        eq(questionnaireResponses.type, "psr"),
        eq(questionnaireResponses.date, today)
      )
    );

  const EVENT_TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
    training: { label: "Treino", color: "#3b82f6", icon: "⚽" },
    match: { label: "Jogo", color: "#10b981", icon: "🏆" },
    rest: { label: "Folga", color: "#6b7280", icon: "😴" },
    friendly: { label: "Jogo Treino", color: "#8b5cf6", icon: "🤝" },
    cup: { label: "Taça", color: "#f59e0b", icon: "🏅" },
    tournament: { label: "Torneio", color: "#ec4899", icon: "🎯" },
    cryo: { label: "Crioterapia", color: "#06b6d4", icon: "🧊" },
    cohesion: { label: "Coesão", color: "#f97316", icon: "🎉" },
    stage: { label: "Estágio", color: "#84cc16", icon: "🏕️" },
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
            ⚽ {team.name}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
            Workspace da Equipa Técnica
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link href="/equipa/semana" className="btn btn-ghost btn-sm">Ver semana</Link>
          <Link href="/equipa/mes" className="btn btn-primary btn-sm">Planeamento</Link>
        </div>
      </div>

      <div className="page-content">
        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {[
            { label: "Atletas", value: totalPlayers[0]?.count ?? 0, icon: "👥", color: "#3b82f6" },
            { label: "PSR Hoje", value: `${psrToday[0]?.count ?? 0}/${totalPlayers[0]?.count ?? 0}`, icon: "📊", color: "#10b981" },
            { label: "Próx. Evento", value: upcomingEvents[0] ? formatDate(upcomingEvents[0].date, "dd/MM") : "—", icon: "📅", color: "#8b5cf6" },
            { label: "Eventos (7d)", value: upcomingEvents.length, icon: "📋", color: "#f59e0b" },
          ].map((stat) => (
            <div key={stat.label} className="stat-card">
              <div
                className="stat-icon"
                style={{ background: stat.color + "22", fontSize: "1.125rem" }}
              >
                {stat.icon}
              </div>
              <div className="stat-value" style={{ fontSize: "1.5rem" }}>{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          {/* Próximos eventos */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.0625rem" }}>Próximos Eventos</h2>
              <Link href="/equipa/mes" className="btn btn-ghost btn-sm">Ver todos →</Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {upcomingEvents.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "1.5rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                  Nenhum evento planeado nos próximos 7 dias.
                </div>
              ) : (
                upcomingEvents.map((ev) => {
                  const cfg = EVENT_TYPE_CONFIG[ev.type] || { label: ev.type, color: "#6b7280", icon: "📌" };
                  return (
                    <div
                      key={ev.id}
                      className="card"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.875rem",
                        padding: "0.875rem 1rem",
                        borderLeft: `3px solid ${cfg.color}`,
                      }}
                    >
                      <div style={{ fontSize: "1.25rem" }}>{cfg.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                          {ev.title}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {formatDate(ev.date)} {ev.startTime ? `• ${ev.startTime.slice(0, 5)}` : ""}
                        </div>
                      </div>
                      <span className="badge" style={{ background: cfg.color + "22", color: cfg.color, fontSize: "0.6875rem" }}>
                        {cfg.label}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div>
            <h2 style={{ fontSize: "1.0625rem", marginBottom: "1rem" }}>Acesso Rápido</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {[
                { href: "/equipa/mes", label: "Plano Mês", icon: "📅" },
                { href: "/equipa/semana", label: "Plano Semana", icon: "📋" },
                { href: "/equipa/macrociclo", label: "Macrociclo", icon: "📈" },
                { href: "/equipa/plantel", label: "Plantel", icon: "👥" },
                { href: "/equipa/questionarios", label: "Questionários", icon: "📊" },
                { href: "/equipa/clips", label: "Clips", icon: "🎬" },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="card" style={{ cursor: "pointer", padding: "1rem", textAlign: "center" }}>
                  <div style={{ fontSize: "1.75rem", marginBottom: "0.375rem" }}>{link.icon}</div>
                  <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)" }}>{link.label}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
