import { getServerUser } from "@/lib/firebase/server-auth";
import { adminDb } from "@/lib/firebase/admin";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { format, startOfMonth } from "date-fns";
import { pt } from "date-fns/locale";

const EVENT_ICONS: Record<string, string> = {
  training: "⚽", match: "🏆", rest: "😴", friendly: "🤝",
  cup: "🏅", tournament: "🎯", cryo: "🧊", cohesion: "🎉", stage: "🏕️",
};

const EVENT_COLORS: Record<string, string> = {
  training: "#3b82f6", match: "#10b981", rest: "#6b7280", friendly: "#8b5cf6",
  cup: "#f59e0b", tournament: "#ec4899", cryo: "#06b6d4", cohesion: "#f97316", stage: "#84cc16",
};

const EVENT_LABELS: Record<string, string> = {
  training: "Treino", match: "Jogo", rest: "Folga", friendly: "Jogo Treino",
  cup: "Taça", tournament: "Torneio", cryo: "Crioterapia", cohesion: "Coesão", stage: "Estágio",
};

export default async function JogadorPlaneamentoPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  const playerSnap = await adminDb
    .collection("players")
    .where("userId", "==", user.id)
    .limit(1)
    .get();

  if (playerSnap.empty) redirect("/jogador");

  const player = { id: playerSnap.docs[0].id, ...playerSnap.docs[0].data() } as any;

  const today = new Date().toISOString().split("T")[0];
  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const thisMonthLabel = format(new Date(), "MMMM yyyy", { locale: pt });

  // Próximos eventos
  const upcomingSnap = await adminDb
    .collection("events")
    .where("teamId", "==", player.teamId)
    .where("isPublished", "==", true)
    .where("date", ">=", today)
    .orderBy("date")
    .limit(20)
    .get();
  const upcomingEvents = upcomingSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];

  // Eventos do mês
  const monthSnap = await adminDb
    .collection("events")
    .where("teamId", "==", player.teamId)
    .where("isPublished", "==", true)
    .where("date", ">=", monthStart)
    .orderBy("date")
    .get();
  const monthEvents = monthSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>📅 Planeamento</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
            Próximos eventos da tua equipa
          </p>
        </div>
      </div>

      <div className="page-content">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "2rem" }}>
          {/* Próximos eventos */}
          <div>
            <h2 style={{ fontSize: "1.0625rem", marginBottom: "1rem" }}>📋 Próximos Eventos</h2>
            {upcomingEvents.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📅</div>
                Sem eventos planeados para os próximos dias.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {upcomingEvents.map((ev: any) => {
                  const color = EVENT_COLORS[ev.type] || "#6b7280";
                  const isToday = ev.date === today;
                  return (
                    <div
                      key={ev.id}
                      className="card"
                      style={{
                        display: "flex",
                        gap: "1rem",
                        alignItems: "flex-start",
                        borderLeft: `3px solid ${color}`,
                        background: isToday ? color + "0a" : undefined,
                      }}
                    >
                      <div style={{ fontSize: "1.5rem", flexShrink: 0 }}>
                        {EVENT_ICONS[ev.type] || "📌"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--text-primary)" }}>
                            {ev.opponent ? `vs ${ev.opponent}` : ev.title}
                          </span>
                          <span className="badge" style={{ background: color + "22", color, fontSize: "0.6875rem" }}>
                            {EVENT_LABELS[ev.type] || ev.type}
                          </span>
                          {isToday && (
                            <span className="badge badge-blue" style={{ fontSize: "0.6875rem" }}>
                              Hoje
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", display: "flex", gap: "1rem" }}>
                          <span>📅 {formatDate(ev.date, "EEEE, d 'de' MMMM")}</span>
                          {ev.startTime && <span>🕐 {ev.startTime.slice(0, 5)}</span>}
                        </div>
                        {ev.arrivalTime && (
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                            Chegada: {ev.arrivalTime.slice(0, 5)}
                          </div>
                        )}
                        {ev.location && (
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                            📍 {ev.location}
                          </div>
                        )}
                        {ev.competition && (
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                            🏅 {ev.competition}
                            {ev.matchday && ` · Jornada ${ev.matchday}`}
                          </div>
                        )}
                        {ev.notes && (
                          <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "0.5rem", fontStyle: "italic" }}>
                            {ev.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Este mês */}
          <div>
            <h2 style={{ fontSize: "1.0625rem", marginBottom: "1rem", textTransform: "capitalize" }}>
              📆 {thisMonthLabel}
            </h2>
            <div className="card" style={{ padding: "1.25rem" }}>
              {monthEvents.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", textAlign: "center" }}>
                  Sem eventos este mês.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {monthEvents.map((ev: any) => {
                    const color = EVENT_COLORS[ev.type] || "#6b7280";
                    const isPast = ev.date < today;
                    return (
                      <div
                        key={ev.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.5rem 0.75rem",
                          borderRadius: "var(--radius-md)",
                          background: color + "10",
                          opacity: isPast ? 0.5 : 1,
                        }}
                      >
                        <span style={{ fontSize: "1rem" }}>{EVENT_ICONS[ev.type] || "📌"}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)" }}>
                            {ev.date === today ? "Hoje" : format(new Date(ev.date + "T12:00:00"), "d MMM", { locale: pt })}
                          </div>
                          <div style={{ fontSize: "0.6875rem", color }}>
                            {EVENT_LABELS[ev.type]}
                            {ev.opponent && ` vs ${ev.opponent}`}
                          </div>
                        </div>
                        {ev.startTime && (
                          <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                            {ev.startTime.slice(0, 5)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
