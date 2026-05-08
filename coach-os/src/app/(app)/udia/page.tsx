"use client";

import { useState, useEffect } from "react";
import { formatDate, getInitials } from "@/lib/utils";

type Player = { id: string; name: string; number?: number; teamId: string; teamName?: string; position: string };
type UdiaSession = {
  id: string;
  date: string;
  startTime?: string;
  objectives?: string;
  notes?: string;
  clipUrls?: string[];
  players?: { playerId: string; playerName?: string; feedback?: string; clipUrls?: string[] }[];
};

export default function UdiaPage() {
  const [sessions, setSessions] = useState<UdiaSession[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedSession, setSelectedSession] = useState<UdiaSession | null>(null);
  const [viewMode, setViewMode] = useState<"sessions" | "players">("sessions");
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    startTime: "10:00",
    objectives: "",
    notes: "",
    clipUrl: "",
    selectedPlayers: [] as string[],
    feedbacks: {} as Record<string, string>,
    clipLinks: {} as Record<string, string>,
  });

  async function loadData() {
    const [sessRes, playRes] = await Promise.all([
      fetch("/api/udia-sessions"),
      fetch("/api/players"),
    ]);
    if (sessRes.ok) setSessions(await sessRes.json());
    if (playRes.ok) setAllPlayers(await playRes.json());
  }

  useEffect(() => { loadData(); }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      date: form.date,
      startTime: form.startTime || undefined,
      objectives: form.objectives || undefined,
      notes: form.notes || undefined,
      clipUrls: form.clipUrl ? [form.clipUrl] : [],
      players: form.selectedPlayers.map((id) => ({
        playerId: id,
        feedback: form.feedbacks[id] || undefined,
        clipUrls: form.clipLinks[id] ? [form.clipLinks[id]] : [],
      })),
    };

    const url = selectedSession ? `/api/udia-sessions/${selectedSession.id}` : "/api/udia-sessions";
    const method = selectedSession ? "PATCH" : "POST";

    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

    setSaving(false);
    setShowModal(false);
    loadData();
  }

  async function handleDelete(sessionId: string) {
    await fetch(`/api/udia-sessions/${sessionId}`, { method: "DELETE" });
    loadData();
  }

  function openCreate() {
    setSelectedSession(null);
    setForm({
      date: new Date().toISOString().split("T")[0],
      startTime: "10:00",
      objectives: "",
      notes: "",
      clipUrl: "",
      selectedPlayers: [],
      feedbacks: {},
      clipLinks: {},
    });
    setShowModal(true);
  }

  function openEdit(session: UdiaSession) {
    setSelectedSession(session);
    const fbs: Record<string, string> = {};
    const cls: Record<string, string> = {};
    session.players?.forEach((p) => {
      if (p.feedback) fbs[p.playerId] = p.feedback;
      if (p.clipUrls?.[0]) cls[p.playerId] = p.clipUrls[0];
    });
    setForm({
      date: session.date,
      startTime: session.startTime || "",
      objectives: session.objectives || "",
      notes: session.notes || "",
      clipUrl: session.clipUrls?.[0] || "",
      selectedPlayers: session.players?.map((p) => p.playerId) || [],
      feedbacks: fbs,
      clipLinks: cls,
    });
    setShowModal(true);
  }

  const totalSessions = sessions.length;
  const totalPlayers = [...new Set(sessions.flatMap((s) => s.players?.map((p) => p.playerId) || []))].length;
  const totalFeedbacks = sessions.reduce((acc, s) => acc + (s.players?.filter((p) => p.feedback).length || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>🎯 UDIA — Desenvolvimento Individual</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
            Sessões em pequenos grupos · Feedback personalizado · Evolução
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "0.375rem" }}>
            <button className={`btn btn-sm ${viewMode === "sessions" ? "btn-primary" : "btn-ghost"}`} onClick={() => setViewMode("sessions")}>
              Sessões
            </button>
            <button className={`btn btn-sm ${viewMode === "players" ? "btn-primary" : "btn-ghost"}`} onClick={() => setViewMode("players")}>
              Por Atleta
            </button>
          </div>
          <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Nova sessão</button>
        </div>
      </div>

      <div className="page-content">
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Sessões totais", value: totalSessions, icon: "📅", color: "#8b5cf6" },
            { label: "Atletas envolvidos", value: totalPlayers, icon: "👤", color: "#3b82f6" },
            { label: "Feedbacks dados", value: totalFeedbacks, icon: "💬", color: "#10b981" },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ background: s.color + "22", fontSize: "1.25rem" }}>{s.icon}</div>
              <div className="stat-value" style={{ fontSize: "1.5rem" }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {viewMode === "sessions" ? (
          /* Sessions list */
          <div>
            {sessions.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🎯</div>
                <h3>Sem sessões UDIA</h3>
                <p style={{ color: "var(--text-muted)", marginTop: "0.5rem", marginBottom: "1.5rem" }}>
                  Cria a primeira sessão de desenvolvimento individual.
                </p>
                <button className="btn btn-primary" onClick={openCreate}>Criar sessão</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {sessions.map((s) => (
                  <div key={s.id} className="card" style={{ borderLeft: "3px solid #8b5cf6" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                          <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>
                            🎯 Sessão UDIA — {formatDate(s.date)}
                          </span>
                          {s.startTime && (
                            <span className="badge badge-purple" style={{ fontSize: "0.6875rem" }}>
                              {s.startTime.slice(0, 5)}
                            </span>
                          )}
                          <span className="badge badge-blue" style={{ fontSize: "0.6875rem" }}>
                            {s.players?.length || 0} atletas
                          </span>
                          {s.clipUrls && s.clipUrls.length > 0 && (
                            <span className="badge badge-gray" style={{ fontSize: "0.6875rem" }}>🎬 {s.clipUrls.length} clip</span>
                          )}
                        </div>
                        {s.objectives && (
                          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                            {s.objectives}
                          </p>
                        )}
                        {/* Atletas com feedback */}
                        {s.players && s.players.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                            {s.players.map((p) => (
                              <span
                                key={p.playerId}
                                className="badge"
                                style={{
                                  background: p.feedback ? "rgba(139,92,246,0.2)" : "rgba(107,114,128,0.15)",
                                  color: p.feedback ? "#a78bfa" : "#9ca3af",
                                  fontSize: "0.6875rem",
                                }}
                              >
                                {p.feedback ? "✓ " : ""}{p.playerName || p.playerId}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", marginLeft: "1rem" }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>🗑</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* By player view */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
            {allPlayers.map((player) => {
              const playerSessions = sessions.filter((s) => s.players?.some((p) => p.playerId === player.id));
              const playerFeedbacks = sessions.flatMap((s) =>
                (s.players || [])
                  .filter((p) => p.playerId === player.id && p.feedback)
                  .map((p) => ({ ...p, date: s.date }))
              );
              if (playerSessions.length === 0) return null;
              return (
                <div key={player.id} className="card" style={{ borderTop: "2px solid #8b5cf6" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.875rem" }}>
                    <div className="avatar" style={{ background: "linear-gradient(135deg, #8b5cf6cc, #8b5cf644)" }}>
                      {getInitials(player.name)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--text-primary)" }}>{player.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {playerSessions.length} sessão(ões) · {playerFeedbacks.length} feedback(s)
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: 200, overflowY: "auto" }}>
                    {playerFeedbacks.map((fb, i) => (
                      <div key={i} style={{ padding: "0.5rem 0.75rem", background: "var(--surface-2)", borderRadius: "var(--radius-md)" }}>
                        <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                          {formatDate(fb.date, "dd/MM/yyyy")}
                        </div>
                        <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{fb.feedback}</p>
                        {fb.clipUrls && fb.clipUrls[0] && (
                          <a href={fb.clipUrls[0]} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.6875rem", color: "#60a5fa" }}>
                            🎬 Ver clip
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ marginBottom: "1.25rem" }}>{selectedSession ? "Editar Sessão UDIA" : "Nova Sessão UDIA"}</h3>
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div className="input-group">
                  <label className="input-label">Data *</label>
                  <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Hora</label>
                  <input type="time" className="input" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Objetivos da sessão</label>
                <textarea className="input" rows={2} placeholder="ex: Trabalho de velocidade de decisão em 1v1..." value={form.objectives} onChange={(e) => setForm({ ...form, objectives: e.target.value })} />
              </div>

              {/* Selecionar atletas */}
              <div className="input-group">
                <label className="input-label">Atletas da sessão ({form.selectedPlayers.length} selecionados)</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", padding: "0.75rem", background: "var(--surface-2)", borderRadius: "var(--radius-md)", border: "1px solid var(--surface-border)", maxHeight: 140, overflowY: "auto" }}>
                  {allPlayers.map((p) => {
                    const selected = form.selectedPlayers.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setForm((prev) => ({
                          ...prev,
                          selectedPlayers: selected
                            ? prev.selectedPlayers.filter((id) => id !== p.id)
                            : [...prev.selectedPlayers, p.id],
                        }))}
                        style={{
                          padding: "0.2rem 0.625rem",
                          borderRadius: 999,
                          border: selected ? "2px solid #8b5cf6" : "1px solid var(--surface-border)",
                          background: selected ? "rgba(139,92,246,0.2)" : "var(--surface-3)",
                          color: selected ? "#a78bfa" : "var(--text-secondary)",
                          cursor: "pointer",
                          fontSize: "0.8125rem",
                          fontWeight: selected ? 700 : 400,
                          transition: "all 0.15s ease",
                        }}
                      >
                        {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feedback individual por atleta */}
              {form.selectedPlayers.length > 0 && (
                <div>
                  <label className="input-label" style={{ marginBottom: "0.75rem", display: "block" }}>
                    Feedback individual
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                    {form.selectedPlayers.map((playerId) => {
                      const player = allPlayers.find((p) => p.id === playerId);
                      return (
                        <div key={playerId} style={{ padding: "0.75rem", background: "var(--surface-2)", borderRadius: "var(--radius-md)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)" }}>
                            {player?.name || playerId}
                          </div>
                          <textarea
                            className="input"
                            rows={2}
                            placeholder="Feedback para este atleta..."
                            value={form.feedbacks[playerId] || ""}
                            onChange={(e) => setForm((prev) => ({ ...prev, feedbacks: { ...prev.feedbacks, [playerId]: e.target.value } }))}
                            style={{ minHeight: 60 }}
                          />
                          <input
                            className="input"
                            type="url"
                            placeholder="Link clip individual (opcional)"
                            value={form.clipLinks[playerId] || ""}
                            onChange={(e) => setForm((prev) => ({ ...prev, clipLinks: { ...prev.clipLinks, [playerId]: e.target.value } }))}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="input-group">
                <label className="input-label">Link clip geral da sessão</label>
                <input type="url" className="input" placeholder="https://veo.co/..." value={form.clipUrl} onChange={(e) => setForm({ ...form, clipUrl: e.target.value })} />
              </div>

              <div className="input-group">
                <label className="input-label">Notas</label>
                <textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "A guardar..." : "Guardar sessão"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
