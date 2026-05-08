"use client";

import { useState, useEffect, useCallback } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isToday,
} from "date-fns";
import { pt } from "date-fns/locale";
import { getInitials } from "@/lib/utils";

type Player = {
  id: string;
  name: string;
  number?: number;
  position: string;
  teamId: string;
  teamName?: string;
};

type GrSession = {
  id: string;
  date: string;
  startTime?: string;
  ageGroupFilter?: string;
  objectives?: string;
  notes?: string;
  clipUrls?: string[];
  players?: { playerId: string; playerName?: string; feedback?: string }[];
};

const WEEKDAYS_PT = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

export default function GrAgendaPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [sessions, setSessions] = useState<GrSession[]>([]);
  const [allGR, setAllGR] = useState<Player[]>([]);
  const [ageGroups, setAgeGroups] = useState<string[]>([]);
  const [ageFilter, setAgeFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSession, setSelectedSession] = useState<GrSession | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    startTime: "09:00",
    ageGroupFilter: "all",
    objectives: "",
    notes: "",
    clipUrl: "",
    selectedPlayers: [] as string[],
  });

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    // Buscar todos os GR's do clube
    fetch("/api/players?position=goalkeeper")
      .then((r) => r.json())
      .then((data) => {
        setAllGR(Array.isArray(data) ? data : []);
        const groups = [...new Set((Array.isArray(data) ? data : []).map((p: Player) => p.teamName || "").filter(Boolean))];
        setAgeGroups(groups);
      });
  }, []);

  const loadSessions = useCallback(async () => {
    const from = format(weekStart, "yyyy-MM-dd");
    const to = format(weekEnd, "yyyy-MM-dd");
    const res = await fetch(`/api/gr-sessions?from=${from}&to=${to}`);
    if (res.ok) setSessions(await res.json());
  }, [currentWeek]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  function getSessionsForDay(d: Date) {
    const dateStr = format(d, "yyyy-MM-dd");
    return sessions.filter((s) => s.date === dateStr);
  }

  function openCreate(dateStr: string) {
    setSelectedDate(dateStr);
    setSelectedSession(null);
    setForm({
      startTime: "09:00",
      ageGroupFilter: "all",
      objectives: "",
      notes: "",
      clipUrl: "",
      selectedPlayers: [],
    });
    setShowModal(true);
  }

  function openEdit(session: GrSession) {
    setSelectedDate(session.date);
    setSelectedSession(session);
    setForm({
      startTime: session.startTime || "",
      ageGroupFilter: session.ageGroupFilter || "all",
      objectives: session.objectives || "",
      notes: session.notes || "",
      clipUrl: "",
      selectedPlayers: session.players?.map((p) => p.playerId) || [],
    });
    setShowModal(true);
  }

  const filteredGR =
    form.ageGroupFilter === "all"
      ? allGR
      : allGR.filter((p) => p.teamName === form.ageGroupFilter);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      date: selectedDate,
      startTime: form.startTime || undefined,
      ageGroupFilter: form.ageGroupFilter === "all" ? undefined : form.ageGroupFilter,
      objectives: form.objectives || undefined,
      notes: form.notes || undefined,
      clipUrls: form.clipUrl ? [form.clipUrl] : [],
      playerIds: form.selectedPlayers,
    };

    if (selectedSession) {
      await fetch(`/api/gr-sessions/${selectedSession.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/gr-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setSaving(false);
    setShowModal(false);
    loadSessions();
  }

  async function handleDelete() {
    if (!selectedSession) return;
    await fetch(`/api/gr-sessions/${selectedSession.id}`, { method: "DELETE" });
    setShowModal(false);
    loadSessions();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
            ← Anterior
          </button>
          <h1 style={{ fontSize: "1.125rem", fontWeight: 700, minWidth: 240, textAlign: "center" }}>
            🥅 {format(weekStart, "d MMM", { locale: pt })} — {format(weekEnd, "d MMM yyyy", { locale: pt })}
          </h1>
          <button className="btn btn-ghost btn-sm" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
            Seguinte →
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setCurrentWeek(new Date())}>Hoje</button>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {/* Filtro escalão */}
          <select
            className="input"
            style={{ width: 160 }}
            value={ageFilter}
            onChange={(e) => setAgeFilter(e.target.value)}
          >
            <option value="all">Todos os escalões</option>
            {ageGroups.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <div style={{ display: "flex", gap: "0.375rem" }}>
            <span className="badge badge-yellow" style={{ fontSize: "0.75rem" }}>
              🥅 {allGR.length} GR's no clube
            </span>
          </div>
        </div>
      </div>

      {/* Weekly grid */}
      <div className="page-content" style={{ flex: 1, overflow: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.75rem" }}>
          {weekDays.map((d, i) => {
            const dayStr = format(d, "yyyy-MM-dd");
            const daySessions = getSessionsForDay(d);
            const todayDay = isToday(d);

            return (
              <div key={dayStr} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {/* Day header */}
                <div
                  style={{
                    textAlign: "center",
                    padding: "0.625rem 0.5rem",
                    borderRadius: "var(--radius-md)",
                    background: todayDay ? "rgba(245,158,11,0.15)" : "var(--surface-2)",
                    border: todayDay ? "1px solid rgba(245,158,11,0.3)" : "1px solid var(--surface-border)",
                    cursor: "pointer",
                  }}
                  onClick={() => openCreate(dayStr)}
                >
                  <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {WEEKDAYS_PT[i].slice(0, 3)}
                  </div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 700, color: todayDay ? "#fbbf24" : "var(--text-primary)" }}>
                    {format(d, "d")}
                  </div>
                  <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                    {format(d, "MMM", { locale: pt })}
                  </div>
                </div>

                {/* Sessions */}
                {daySessions.map((session) => (
                  <div
                    key={session.id}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "var(--radius-md)",
                      background: "rgba(245,158,11,0.12)",
                      border: "1px solid rgba(245,158,11,0.3)",
                      cursor: "pointer",
                    }}
                    onClick={() => openEdit(session)}
                  >
                    <div style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>🥅</div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#fbbf24", marginBottom: "0.25rem" }}>
                      Sessão GR's
                    </div>
                    {session.startTime && (
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                        {session.startTime.slice(0, 5)}
                      </div>
                    )}
                    {session.ageGroupFilter && (
                      <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                        {session.ageGroupFilter}
                      </div>
                    )}
                    <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                      {session.players?.length || 0} GR's
                    </div>
                    {session.clipUrls && session.clipUrls.length > 0 && (
                      <div style={{ fontSize: "0.6875rem", color: "#60a5fa", marginTop: "0.25rem" }}>🎬 {session.clipUrls.length} clip(s)</div>
                    )}
                  </div>
                ))}

                {/* Add button */}
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: "0.75rem", border: "1px dashed var(--surface-border)", color: "var(--text-muted)" }}
                  onClick={() => openCreate(dayStr)}
                >
                  + Sessão
                </button>
              </div>
            );
          })}
        </div>

        {/* GR's list overview */}
        <div style={{ marginTop: "2rem" }}>
          <h2 style={{ fontSize: "1.0625rem", marginBottom: "1rem" }}>
            🧤 Todos os Guarda-Redes do Clube
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.75rem" }}>
            {(ageFilter === "all" ? allGR : allGR.filter((p) => p.teamName === ageFilter)).map((gr) => (
              <div key={gr.id} className="card" style={{ borderTop: "2px solid #f59e0b", padding: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.5rem" }}>
                  <div
                    className="avatar"
                    style={{ background: "linear-gradient(135deg, #f59e0bcc, #f59e0b66)", width: 32, height: 32, fontSize: "0.75rem" }}
                  >
                    {getInitials(gr.name)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                      {gr.name}
                    </div>
                    {gr.number && (
                      <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>#{gr.number}</div>
                    )}
                  </div>
                </div>
                {gr.teamName && (
                  <span className="badge badge-yellow" style={{ fontSize: "0.6875rem" }}>{gr.teamName}</span>
                )}
              </div>
            ))}
            {allGR.length === 0 && (
              <div style={{ color: "var(--text-muted)", fontSize: "0.875rem", gridColumn: "1/-1" }}>
                Nenhum GR registado no clube ainda.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3>{selectedSession ? "Editar Sessão GR's" : `Nova Sessão — ${selectedDate}`}</h3>
              {selectedSession && (
                <button className="btn btn-danger btn-sm" onClick={handleDelete}>🗑 Apagar</button>
              )}
            </div>
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div className="input-group">
                  <label className="input-label">Hora de início</label>
                  <input type="time" className="input" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                </div>
                <div className="input-group">
                  <label className="input-label">Filtro escalão</label>
                  <select className="input" value={form.ageGroupFilter} onChange={(e) => setForm({ ...form, ageGroupFilter: e.target.value })}>
                    <option value="all">Todos os escalões</option>
                    {ageGroups.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Objetivos da sessão</label>
                <textarea className="input" rows={2} placeholder="ex: Trabalho de posicionamento em cruzamentos..." value={form.objectives} onChange={(e) => setForm({ ...form, objectives: e.target.value })} />
              </div>

              {/* Selecionar GR's */}
              <div className="input-group">
                <label className="input-label">GR's presentes ({form.selectedPlayers.length} selecionados)</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", padding: "0.75rem", background: "var(--surface-2)", borderRadius: "var(--radius-md)", border: "1px solid var(--surface-border)", maxHeight: 180, overflowY: "auto" }}>
                  {filteredGR.map((gr) => {
                    const selected = form.selectedPlayers.includes(gr.id);
                    return (
                      <button
                        key={gr.id}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            selectedPlayers: selected
                              ? prev.selectedPlayers.filter((id) => id !== gr.id)
                              : [...prev.selectedPlayers, gr.id],
                          }));
                        }}
                        style={{
                          padding: "0.25rem 0.75rem",
                          borderRadius: 999,
                          border: selected ? "2px solid #f59e0b" : "1px solid var(--surface-border)",
                          background: selected ? "rgba(245,158,11,0.2)" : "var(--surface-3)",
                          color: selected ? "#fbbf24" : "var(--text-secondary)",
                          cursor: "pointer",
                          fontSize: "0.8125rem",
                          fontWeight: selected ? 700 : 400,
                          transition: "all 0.15s ease",
                        }}
                      >
                        {gr.name}
                        {gr.teamName && <span style={{ opacity: 0.6, marginLeft: 4, fontSize: "0.7rem" }}>({gr.teamName})</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Link de vídeo/clip (Veo, Drive...)</label>
                <input className="input" type="url" placeholder="https://veo.co/..." value={form.clipUrl} onChange={(e) => setForm({ ...form, clipUrl: e.target.value })} />
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
