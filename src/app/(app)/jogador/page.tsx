import { getServerUser } from "@/lib/firebase/server-auth";
import { adminDb } from "@/lib/firebase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

const EVENT_ICONS: Record<string, string> = {
  training: "⚽", match: "🏆", rest: "😴", friendly: "🤝",
  cup: "🏅", tournament: "🎯", cryo: "🧊", cohesion: "🎉", stage: "🏕️",
};

export default async function JogadorHomePage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  // Buscar o jogador ligado a este utilizador
  const playerSnap = await adminDb
    .collection("players")
    .where("userId", "==", user.id)
    .limit(1)
    .get();

  if (playerSnap.empty) {
    return (
      <div>
        <div className="page-header">
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>🏠 Olá, {user.name}!</h1>
        </div>
        <div className="page-content">
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⚽</div>
            <h3>Ainda não estás associado a nenhuma equipa</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
              Aguarda que o treinador te adicione ao plantel.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const player = { id: playerSnap.docs[0].id, ...playerSnap.docs[0].data() } as any;
  const today = new Date().toISOString().split("T")[0];

  // Próximos eventos
  const nextEventsSnap = await adminDb
    .collection("events")
    .where("teamId", "==", player.teamId)
    .where("date", ">=", today)
    .where("isPublished", "==", true)
    .orderBy("date")
    .limit(5)
    .get();
  const nextEvents = nextEventsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];

  // Questionários de hoje
  const todayResponsesSnap = await adminDb
    .collection("questionnaireResponses")
    .where("playerId", "==", player.id)
    .where("date", "==", today)
    .get();
  const todayResponses = todayResponsesSnap.docs.map((d) => d.data()) as any[];

  const answeredPSR = todayResponses.some((r) => r.type === "psr");
  const todayMatchEvents = nextEvents.filter((e) => e.date === today && ["match", "cup"].includes(e.type));
  const todayTrainEvents = nextEvents.filter((e) => e.date === today && e.type === "training");

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
            🏠 Olá, {user.name?.split(" ")[0]}!
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
            {formatDate(today, "EEEE, d 'de' MMMM")}
          </p>
        </div>
      </div>

      <div className="page-content">
        {/* Questionários pendentes */}
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.0625rem", marginBottom: "1rem" }}>📊 Questionários Pendentes</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {!answeredPSR && (
              <div
                className="card"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderLeft: "3px solid var(--brand-500)",
                  animation: "pulse-glow 2s ease infinite",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                    📊 PSR — Perceção Subjetiva de Recuperação
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                    Responde após acordar — diário
                  </div>
                </div>
                <Link href="/jogador/questionarios" className="btn btn-primary btn-sm">
                  Responder →
                </Link>
              </div>
            )}

            {todayTrainEvents.map((ev: any) => {
              const answered = todayResponses.some((r) => r.type === "pse");
              if (answered) return null;
              return (
                <div
                  key={ev.id}
                  className="card"
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: "3px solid #10b981" }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>💪 PSE — {ev.title}</div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>Perceção Subjetiva de Esforço</div>
                  </div>
                  <Link href="/jogador/questionarios" className="btn btn-primary btn-sm">Responder →</Link>
                </div>
              );
            })}

            {todayMatchEvents.map((ev: any) => {
              const answered = todayResponses.some((r) => r.type === "post_match");
              if (answered) return null;
              return (
                <div
                  key={ev.id + "_pm"}
                  className="card"
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: "3px solid #f59e0b" }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>🏆 Pós-Jogo — {ev.title}</div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>Autoavaliação pós-jogo</div>
                  </div>
                  <Link href="/jogador/questionarios" className="btn btn-primary btn-sm">Responder →</Link>
                </div>
              );
            })}

            {answeredPSR && todayTrainEvents.length === 0 && todayMatchEvents.length === 0 && (
              <div
                className="card"
                style={{ textAlign: "center", padding: "1.5rem", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>✅</div>
                <div style={{ fontWeight: 600, color: "#34d399" }}>Todos os questionários de hoje respondidos!</div>
              </div>
            )}
          </div>
        </div>

        {/* Próximos eventos */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.0625rem" }}>📅 Próximos Eventos</h2>
            <Link href="/jogador/planeamento" className="btn btn-ghost btn-sm">Ver tudo →</Link>
          </div>
          {nextEvents.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "1.5rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              Sem eventos planeados nos próximos dias.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {nextEvents.map((ev: any) => (
                <div key={ev.id} className="card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ fontSize: "1.25rem" }}>{EVENT_ICONS[ev.type] || "📌"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                      {ev.title}
                      {ev.opponent && <span style={{ color: "var(--text-muted)", fontWeight: 400 }}> vs {ev.opponent}</span>}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {formatDate(ev.date)} {ev.startTime ? `• ${ev.startTime.slice(0, 5)}` : ""}
                      {ev.location ? ` • ${ev.location}` : ""}
                    </div>
                  </div>
                  {ev.arrivalTime && (
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "right" }}>
                      🕐 Chegada<br />{ev.arrivalTime.slice(0, 5)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
