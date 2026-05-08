"use client";

import { useState, useEffect, useCallback } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
  parseISO,
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

const EVENT_ICONS: Record<string, string> = {
  training: "⚽",
  match: "🏆",
  rest: "😴",
  friendly: "🤝",
  cup: "🏅",
  tournament: "🎯",
  cryo: "🧊",
  cohesion: "🎉",
  stage: "🏕️",
};

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

type ModalState = {
  open: boolean;
  date?: string;
  event?: Event;
};

export default function MesPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [form, setForm] = useState({
    type: "training",
    title: "",
    startTime: "",
    endTime: "",
    arrivalTime: "",
    location: "",
    opponent: "",
    isHome: true,
    competition: "",
    matchday: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  // Buscar equipa atual
  useEffect(() => {
    fetch("/api/teams")
      .then((r) => r.json())
      .then((teams) => {
        if (teams.length > 0) setTeamId(teams[0].id);
      });
  }, []);

  const loadEvents = useCallback(async () => {
    if (!teamId) return;
    const from = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const to = format(endOfMonth(currentMonth), "yyyy-MM-dd");
    const res = await fetch(`/api/events?teamId=${teamId}&from=${from}&to=${to}`);
    if (res.ok) setEvents(await res.json());
  }, [teamId, currentMonth]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  function getEventsForDate(dateStr: string) {
    return events.filter((e) => e.date === dateStr);
  }

  function openCreate(dateStr: string) {
    setForm({
      type: "training",
      title: "",
      startTime: "",
      endTime: "",
      arrivalTime: "",
      location: "",
      opponent: "",
      isHome: true,
      competition: "",
      matchday: "",
      notes: "",
    });
    setModal({ open: true, date: dateStr });
  }

  function openEdit(ev: Event) {
    setForm({
      type: ev.type,
      title: ev.title,
      startTime: ev.startTime || "",
      endTime: ev.endTime || "",
      arrivalTime: ev.arrivalTime || "",
      location: ev.location || "",
      opponent: ev.opponent || "",
      isHome: ev.isHome ?? true,
      competition: ev.competition || "",
      matchday: ev.matchday?.toString() || "",
      notes: ev.notes || "",
    });
    setModal({ open: true, event: ev, date: ev.date });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!teamId || !modal.date) return;
    setSaving(true);

    const payload = {
      teamId,
      date: modal.date,
      type: form.type,
      title: form.title || (EVENT_TYPE_LABELS[form.type] ?? form.type),
      startTime: form.startTime || undefined,
      endTime: form.endTime || undefined,
      arrivalTime: form.arrivalTime || undefined,
      location: form.location || undefined,
      opponent: form.opponent || undefined,
      isHome: form.isHome,
      competition: form.competition || undefined,
      matchday: form.matchday ? parseInt(form.matchday) : undefined,
      notes: form.notes || undefined,
    };

    if (modal.event) {
      await fetch(`/api/events/${modal.event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setSaving(false);
    setModal({ open: false });
    loadEvents();
  }

  async function handleDelete() {
    if (!modal.event) return;
    await fetch(`/api/events/${modal.event.id}`, { method: "DELETE" });
    setModal({ open: false });
    loadEvents();
  }

  // Gera os dias do calendário (Seg→Dom)
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calDays: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    calDays.push(day);
    day = addDays(day, 1);
  }

  const isMatch = (type: string) =>
    ["match", "cup", "friendly", "tournament"].includes(type);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            ←
          </button>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, minWidth: 200, textAlign: "center" }}>
            📅 {format(currentMonth, "MMMM yyyy", { locale: pt }).replace(/^\w/, (c) => c.toUpperCase())}
          </h1>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            →
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setCurrentMonth(new Date())}
          >
            Hoje
          </button>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {Object.entries(EVENT_TYPE_LABELS)
            .slice(0, 5)
            .map(([type, label]) => (
              <span
                key={type}
                className="badge"
                style={{ background: EVENT_TYPE_COLORS[type] + "22", color: EVENT_TYPE_COLORS[type], fontSize: "0.6875rem" }}
              >
                {EVENT_ICONS[type]} {label}
              </span>
            ))}
        </div>
      </div>

      <div className="page-content" style={{ flex: 1, overflow: "auto" }}>
        {/* Weekday headers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 1,
            marginBottom: 1,
          }}
        >
          {WEEKDAYS.map((wd) => (
            <div
              key={wd}
              style={{
                textAlign: "center",
                padding: "0.5rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {wd}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="calendar-grid">
          {calDays.map((d) => {
            const dateStr = format(d, "yyyy-MM-dd");
            const dayEvents = getEventsForDate(dateStr);
            const inMonth = isSameMonth(d, currentMonth);
            const todayClass = isToday(d);

            return (
              <div
                key={dateStr}
                className={`calendar-day ${todayClass ? "today" : ""} ${!inMonth ? "other-month" : ""}`}
                onClick={() => inMonth && openCreate(dateStr)}
                style={{ minHeight: 90 }}
              >
                <div
                  className="calendar-day-number"
                  style={{
                    color: todayClass
                      ? "var(--brand-400)"
                      : inMonth
                      ? "var(--text-primary)"
                      : "var(--text-muted)",
                    fontSize: "0.8125rem",
                  }}
                >
                  {format(d, "d")}
                </div>
                {dayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="calendar-event-dot"
                    style={{
                      background: EVENT_TYPE_COLORS[ev.type] + "25",
                      color: EVENT_TYPE_COLORS[ev.type],
                      cursor: "pointer",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(ev);
                    }}
                  >
                    <span style={{ fontSize: "0.7rem" }}>{EVENT_ICONS[ev.type]}</span>
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 80,
                      }}
                    >
                      {ev.startTime ? ev.startTime.slice(0, 5) + " " : ""}
                      {isMatch(ev.type) && ev.opponent ? `vs ${ev.opponent}` : ev.title}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="modal-overlay" onClick={() => setModal({ open: false })}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3>{modal.event ? "Editar Evento" : `Novo Evento — ${modal.date}`}</h3>
              {modal.event && (
                <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                  🗑 Apagar
                </button>
              )}
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0.75rem" }}>
                <div className="input-group">
                  <label className="input-label" htmlFor="ev-type">Tipo *</label>
                  <select
                    id="ev-type"
                    className="input"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    {Object.entries(EVENT_TYPE_LABELS).map(([val, lbl]) => (
                      <option key={val} value={val}>{lbl}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label" htmlFor="ev-title">Título</label>
                  <input
                    id="ev-title"
                    className="input"
                    placeholder={EVENT_TYPE_LABELS[form.type] || "Título do evento"}
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
                <div className="input-group">
                  <label className="input-label" htmlFor="ev-start">Hora início</label>
                  <input id="ev-start" type="time" className="input" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                </div>
                <div className="input-group">
                  <label className="input-label" htmlFor="ev-end">Hora fim</label>
                  <input id="ev-end" type="time" className="input" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
                </div>
                <div className="input-group">
                  <label className="input-label" htmlFor="ev-arrival">Chegada</label>
                  <input id="ev-arrival" type="time" className="input" value={form.arrivalTime} onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })} />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="ev-location">Local</label>
                <input id="ev-location" className="input" placeholder="Campo Municipal..." value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>

              {isMatch(form.type) && (
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "0.75rem" }}>
                  <div className="input-group">
                    <label className="input-label" htmlFor="ev-opponent">Adversário</label>
                    <input id="ev-opponent" className="input" placeholder="FC Lisboa..." value={form.opponent} onChange={(e) => setForm({ ...form, opponent: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label className="input-label" htmlFor="ev-competition">Competição</label>
                    <input id="ev-competition" className="input" placeholder="Campeonato" value={form.competition} onChange={(e) => setForm({ ...form, competition: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label className="input-label" htmlFor="ev-matchday">Jornada</label>
                    <input id="ev-matchday" type="number" className="input" placeholder="6" value={form.matchday} onChange={(e) => setForm({ ...form, matchday: e.target.value })} />
                  </div>
                </div>
              )}

              <div className="input-group">
                <label className="input-label" htmlFor="ev-notes">Notas</label>
                <textarea id="ev-notes" className="input" rows={2} placeholder="Observações..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModal({ open: false })}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "A guardar..." : modal.event ? "Guardar alterações" : "Criar evento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
