"use client";

import { useState, useEffect } from "react";
import { formatDate, getInitials } from "@/lib/utils";

type Player = { id: string; name: string; number?: number; teamId: string; teamName?: string };
type GrSession = {
  id: string;
  date: string;
  startTime?: string;
  objectives?: string;
  clipUrls?: string[];
  players?: { playerId: string; playerName?: string; feedback?: string; clipUrls?: string[] }[];
};

export default function GrFeedbackPage() {
  const [allGR, setAllGR] = useState<Player[]>([]);
  const [sessions, setSessions] = useState<GrSession[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ sessionId: "", feedback: "", clipUrl: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/players?position=goalkeeper")
      .then((r) => r.json())
      .then((data) => setAllGR(Array.isArray(data) ? data : []));
    fetch("/api/gr-sessions")
      .then((r) => r.json())
      .then((data) => setSessions(Array.isArray(data) ? data : []));
  }, []);

  async function saveFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlayer || !feedbackForm.sessionId) return;
    setSaving(true);

    await fetch(`/api/gr-sessions/${feedbackForm.sessionId}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerId: selectedPlayer.id,
        feedback: feedbackForm.feedback,
        clipUrls: feedbackForm.clipUrl ? [feedbackForm.clipUrl] : [],
      }),
    });

    setSaving(false);
    setShowFeedbackModal(false);
    setFeedbackForm({ sessionId: "", feedback: "", clipUrl: "" });
    // Reload sessions
    fetch("/api/gr-sessions").then((r) => r.json()).then((data) => setSessions(Array.isArray(data) ? data : []));
  }

  function getPlayerFeedbacks(playerId: string) {
    return sessions
      .filter((s) => s.players?.some((p) => p.playerId === playerId && p.feedback))
      .map((s) => {
        const playerEntry = s.players?.find((p) => p.playerId === playerId);
        return { ...playerEntry, date: s.date, sessionId: s.id };
      });
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>🎬 Feedback & Clips — GR's</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
            Feedback individual com análise de vídeo
          </p>
        </div>
      </div>

      <div className="page-content">
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "1.5rem" }}>
          {/* GR list */}
          <div>
            <h2 style={{ fontSize: "1rem", marginBottom: "0.875rem" }}>Guarda-Redes</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {allGR.map((gr) => {
                const feedbacks = getPlayerFeedbacks(gr.id);
                return (
                  <button
                    key={gr.id}
                    onClick={() => setSelectedPlayer(gr)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.875rem",
                      borderRadius: "var(--radius-md)",
                      background: selectedPlayer?.id === gr.id ? "rgba(245,158,11,0.15)" : "var(--surface-card)",
                      border: selectedPlayer?.id === gr.id ? "1px solid rgba(245,158,11,0.4)" : "1px solid var(--surface-border)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      textAlign: "left",
                    }}
                  >
                    <div className="avatar" style={{ background: "linear-gradient(135deg, #f59e0bcc, #f59e0b44)", width: 32, height: 32, fontSize: "0.75rem" }}>
                      {getInitials(gr.name)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>{gr.name}</div>
                      <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                        {gr.teamName} {feedbacks.length > 0 && `· ${feedbacks.length} feedbacks`}
                      </div>
                    </div>
                  </button>
                );
              })}
              {allGR.length === 0 && (
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Nenhum GR registado.</p>
              )}
            </div>
          </div>

          {/* Feedback view */}
          <div>
            {!selectedPlayer ? (
              <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🥅</div>
                <h3>Seleciona um guarda-redes</h3>
                <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
                  Clica num GR para ver e adicionar feedback individual.
                </p>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                  <h2 style={{ fontSize: "1.125rem" }}>🥅 {selectedPlayer.name}</h2>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setFeedbackForm({ sessionId: sessions[0]?.id || "", feedback: "", clipUrl: "" });
                      setShowFeedbackModal(true);
                    }}
                  >
                    + Adicionar feedback
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {getPlayerFeedbacks(selectedPlayer.id).length === 0 ? (
                    <div className="card" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                      <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>📝</div>
                      Sem feedback registado ainda para este GR.
                    </div>
                  ) : (
                    getPlayerFeedbacks(selectedPlayer.id).map((fb, i) => (
                      <div key={i} className="card" style={{ borderLeft: "3px solid #f59e0b" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            {formatDate(fb.date || "", "dd/MM/yyyy")}
                          </span>
                          {fb.clipUrls && fb.clipUrls.length > 0 && (
                            <a href={fb.clipUrls[0]} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.75rem", color: "var(--brand-400)" }}>
                              🎬 Ver clip
                            </a>
                          )}
                        </div>
                        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                          {fb.feedback}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback modal */}
      {showFeedbackModal && selectedPlayer && (
        <div className="modal-overlay" onClick={() => setShowFeedbackModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "1.25rem" }}>Feedback — {selectedPlayer.name}</h3>
            <form onSubmit={saveFeedback} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="input-group">
                <label className="input-label">Sessão</label>
                <select className="input" value={feedbackForm.sessionId} onChange={(e) => setFeedbackForm({ ...feedbackForm, sessionId: e.target.value })}>
                  <option value="">Selecionar sessão...</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {formatDate(s.date, "dd/MM/yyyy")} {s.startTime ? `${s.startTime.slice(0, 5)}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Feedback *</label>
                <textarea className="input" rows={4} placeholder="Descreve o desempenho, pontos a melhorar..." value={feedbackForm.feedback} onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })} required />
              </div>
              <div className="input-group">
                <label className="input-label">Link de clip (opcional)</label>
                <input type="url" className="input" placeholder="https://veo.co/..." value={feedbackForm.clipUrl} onChange={(e) => setFeedbackForm({ ...feedbackForm, clipUrl: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowFeedbackModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "A guardar..." : "Guardar feedback"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
