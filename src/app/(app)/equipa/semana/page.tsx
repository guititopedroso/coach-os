"use client";

import { useState, useEffect, useCallback } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameDay,
  isToday,
} from "date-fns";
import { pt } from "date-fns/locale";
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from "@/lib/utils";

type Event = {
  id: string;
  type: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  arrivalTime?: string;
  location?: string;
  opponent?: string;
  isHome?: boolean;
  competition?: string;
  matchday?: number;
  trainingUnitNumber?: number;
  notes?: string;
};

const WEEKDAYS_PT = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

const EVENT_ICONS: Record<string, string> = {
  training: "⚽", match: "🏆", rest: "😴", friendly: "🤝",
  cup: "🏅", tournament: "🎯", cryo: "🧊", cohesion: "🎉", stage: "🏕️",
};

export default function SemanaPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [form, setForm] = useState({ type: "training", title: "", startTime: "", endTime: "", arrivalTime: "", location: "", opponent: "", competition: "", matchday: "", notes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/teams").then(r => r.json()).then(teams => {
      if (teams.length > 0) setTeamId(teams[0].id);
    });
  }, []);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const loadEvents = useCallback(async () => {
    if (!teamId) return;
    const from = format(weekStart, "yyyy-MM-dd");
    const to = format(weekEnd, "yyyy-MM-dd");
    const res = await fetch(`/api/events?teamId=${teamId}&from=${from}&to=${to}`);
    if (res.ok) setEvents(await res.json());
  }, [teamId, currentWeek]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  function getEventsForDay(d: Date) {
    const dateStr = format(d, "yyyy-MM-dd");
    return events.filter(e => e.date === dateStr).sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
  }

  function openCreate(dateStr: string) {
    setSelectedDate(dateStr);
    setSelectedEvent(null);
    setForm({ type: "training", title: "", startTime: "10:00", endTime: "12:00", arrivalTime: "", location: "", opponent: "", competition: "", matchday: "", notes: "" });
    setShowModal(true);
  }

  function openEdit(ev: Event) {
    setSelectedDate(ev.date);
    setSelectedEvent(ev);
    setForm({ type: ev.type, title: ev.title, startTime: ev.startTime || "", endTime: ev.endTime || "", arrivalTime: ev.arrivalTime || "", location: ev.location || "", opponent: ev.opponent || "", competition: ev.competition || "", matchday: ev.matchday?.toString() || "", notes: ev.notes || "" });
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!teamId) return;
    setSaving(true);

    const payload = {
      teamId,
      date: selectedDate,
      type: form.type,
      title: form.title || EVENT_TYPE_LABELS[form.type],
      startTime: form.startTime || undefined,
      endTime: form.endTime || undefined,
      arrivalTime: form.arrivalTime || undefined,
      location: form.location || undefined,
      opponent: form.opponent || undefined,
      competition: form.competition || undefined,
      matchday: form.matchday ? parseInt(form.matchday) : undefined,
      notes: form.notes || undefined,
    };

    if (selectedEvent) {
      await fetch(`/api/events/${selectedEvent.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } else {
      await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }

    setSaving(false);
    setShowModal(false);
    loadEvents();
  }

  async function handleDelete() {
    if (!selectedEvent) return;
    await fetch(`/api/events/${selectedEvent.id}`, { method: "DELETE" });
    setShowModal(false);
    loadEvents();
  }

  async function duplicatePreviousWeek() {
    if (!teamId) return;
    const prevWeekStart = format(addDays(weekStart, -7), "yyyy-MM-dd");
    const prevWeekEnd = format(addDays(weekEnd, -7), "yyyy-MM-dd");
    const res = await fetch(`/api/events?teamId=${teamId}&from=${prevWeekStart}&to=${prevWeekEnd}`);
    if (!res.ok) return;
    const prevEvents: Event[] = await res.json();

    for (const ev of prevEvents) {
      const origDate = new Date(ev.date + "T12:00:00");
      const newDate = addDays(origDate, 7);
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId,
          type: ev.type,
          title: ev.title,
          date: format(newDate, "yyyy-MM-dd"),
          startTime: ev.startTime,
          endTime: ev.endTime,
          arrivalTime: ev.arrivalTime,
          location: ev.location,
          notes: ev.notes,
        }),
      });
    }
    loadEvents();
  }

  const isMatch = (type: string) => ["match", "cup", "friendly", "tournament"].includes(type);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>← Semana anterior</button>
          <h1 style={{ fontSize: "1.125rem", fontWeight: 700, minWidth: 220, textAlign: "center" }}>
            📋 {format(weekStart, "d MMM", { locale: pt })} — {format(weekEnd, "d MMM yyyy", { locale: pt })}
          </h1>
          <button className="btn btn-ghost btn-sm" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>Semana seguinte →</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setCurrentWeek(new Date())}>Hoje</button>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={duplicatePreviousWeek} title="Duplicar todos os eventos da semana anterior">
          ↻ Duplicar semana anterior
        </button>
      </div>

      <div className="page-content" style={{ flex: 1, overflow: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.75rem" }}>
          {weekDays.map((d, i) => {
            const dayEvents = getEventsForDay(d);
            const dateStr = format(d, "yyyy-MM-dd");
            const todayDay = isToday(d);

            return (
              <div key={dateStr} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {/* Day header */}
                <div
                  style={{
                    textAlign: "center",
                    padding: "0.625rem 0.5rem",
                    borderRadius: "var(--radius-md)",
                    background: todayDay ? "rgba(59,130,246,0.15)" : "var(--surface-2)",
                    border: todayDay ? "1px solid rgba(59,130,246,0.3)" : "1px solid var(--surface-border)",
                    cursor: "pointer",
                  }}
                  onClick={() => openCreate(dateStr)}
                >
                  <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {WEEKDAYS_PT[i].slice(0, 3)}
                  </div>
                  <div
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: todayDay ? "var(--brand-400)" : "var(--text-primary)",
                    }}
                  >
                    {format(d, "d")}
                  </div>
                  <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                    {format(d, "MMM", { locale: pt })}
                  </div>
                </div>

                {/* Events */}
                {dayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    style={{
                      padding: "0.625rem 0.75rem",
                      borderRadius: "var(--radius-md)",
                      background: EVENT_TYPE_COLORS[ev.type] + "18",
                      border: `1px solid ${EVENT_TYPE_COLORS[ev.type]}40`,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onClick={() => openEdit(ev)}
                  >
                    <div style={{ fontSize: "1rem", marginBottom: "0.2rem" }}>{EVENT_ICONS[ev.type]}</div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 600, color: EVENT_TYPE_COLORS[ev.type], marginBottom: "0.2rem" }}>
                      {EVENT_TYPE_LABELS[ev.type]}
                    </div>
                    {ev.startTime && (
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                        {ev.startTime.slice(0, 5)}{ev.endTime ? `–${ev.endTime.slice(0, 5)}` : ""}
                      </div>
                    )}
                    {ev.opponent && (
                      <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                        vs {ev.opponent}
                      </div>
                    )}
                    {ev.location && (
                      <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                        📍 {ev.location}
                      </div>
                    )}
                    {ev.arrivalTime && (
                      <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                        🕐 Chegada: {ev.arrivalTime.slice(0, 5)}
                      </div>
                    )}
                  </div>
                ))}

                {/* Add button */}
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: "0.75rem", border: "1px dashed var(--surface-border)", color: "var(--text-muted)" }}
                  onClick={() => openCreate(dateStr)}
                >
                  + Adicionar
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3>{selectedEvent ? "Editar Evento" : `Novo Evento — ${selectedDate}`}</h3>
              {selectedEvent && (
                <button className="btn btn-danger btn-sm" onClick={handleDelete}>🗑 Apagar</button>
              )}
            </div>
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0.75rem" }}>
                <div className="input-group">
                  <label className="input-label">Tipo *</label>
                  <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    {Object.entries(EVENT_TYPE_LABELS).map(([val, lbl]) => (
                      <option key={val} value={val}>{lbl}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Título</label>
                  <input className="input" placeholder={EVENT_TYPE_LABELS[form.type]} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
                <div className="input-group">
                  <label className="input-label">Hora início</label>
                  <input type="time" className="input" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
                </div>
                <div className="input-group">
                  <label className="input-label">Hora fim</label>
                  <input type="time" className="input" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
                </div>
                <div className="input-group">
                  <label className="input-label">Hora chegada</label>
                  <input type="time" className="input" value={form.arrivalTime} onChange={e => setForm({ ...form, arrivalTime: e.target.value })} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Local</label>
                <input className="input" placeholder="Campo Municipal..." value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              </div>
              {isMatch(form.type) && (
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "0.75rem" }}>
                  <div className="input-group">
                    <label className="input-label">Adversário</label>
                    <input className="input" value={form.opponent} onChange={e => setForm({ ...form, opponent: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Competição</label>
                    <input className="input" value={form.competition} onChange={e => setForm({ ...form, competition: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Jornada</label>
                    <input type="number" className="input" value={form.matchday} onChange={e => setForm({ ...form, matchday: e.target.value })} />
                  </div>
                </div>
              )}
              <div className="input-group">
                <label className="input-label">Notas</label>
                <textarea className="input" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "A guardar..." : "Guardar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
