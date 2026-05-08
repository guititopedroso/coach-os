"use client";

import { useState, useEffect, useCallback } from "react";
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, isToday } from "date-fns";
import { pt } from "date-fns/locale";
import { getInitials } from "@/lib/utils";

type Player = { id: string; name: string; number?: number };
type Event = {
  id: string;
  type: string;
  title: string;
  date: string;
  startTime?: string;
  attendances?: { playerId: string; status: string }[];
};

const STATUS_CONFIG = {
  present:  { label: "Presente",  color: "#10b981", icon: "✓" },
  absent:   { label: "Ausente",   color: "#ef4444", icon: "✗" },
  justified: { label: "Justificado", color: "#f59e0b", icon: "J" },
  injured:  { label: "Lesionado", color: "#8b5cf6", icon: "🩹" },
  late:     { label: "Atraso",    color: "#f97316", icon: "⏱" },
};

type AttendanceStatus = keyof typeof STATUS_CONFIG;

export default function PresencasPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [players, setPlayers] = useState<Player[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<Record<string, Record<string, AttendanceStatus>>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  useEffect(() => {
    fetch("/api/teams").then((r) => r.json()).then((teams) => {
      if (teams.length > 0) setTeamId(teams[0].id);
    });
  }, []);

  const loadData = useCallback(async () => {
    if (!teamId) return;

    const from = format(weekStart, "yyyy-MM-dd");
    const to = format(weekEnd, "yyyy-MM-dd");

    const [playersRes, eventsRes] = await Promise.all([
      fetch(`/api/players?teamId=${teamId}`),
      fetch(`/api/events?teamId=${teamId}&from=${from}&to=${to}`),
    ]);

    const playersData = playersRes.ok ? await playersRes.json() : [];
    let eventsData = eventsRes.ok ? await eventsRes.json() : [];

    // Filtrar apenas treinos e jogos
    eventsData = eventsData.filter((e: Event) => ["training", "match", "cup", "friendly", "tournament"].includes(e.type));

    setPlayers(playersData);
    setEvents(eventsData);

    // Carregar presenças existentes
    const attData: Record<string, Record<string, AttendanceStatus>> = {};
    for (const event of eventsData) {
      const attRes = await fetch(`/api/attendance?eventId=${event.id}`);
      if (attRes.ok) {
        const rows: { playerId: string; status: string }[] = await attRes.json();
        attData[event.id] = {};
        rows.forEach((r) => {
          attData[event.id][r.playerId] = r.status as AttendanceStatus;
        });
      }
    }
    setAttendance(attData);
  }, [teamId, currentWeek]);

  useEffect(() => { loadData(); }, [loadData]);

  async function setStatus(eventId: string, playerId: string, status: AttendanceStatus) {
    const key = `${eventId}-${playerId}`;
    setSaving(key);

    setAttendance((prev) => ({
      ...prev,
      [eventId]: { ...prev[eventId], [playerId]: status },
    }));

    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, playerId, status }),
    });

    setSaving(null);
  }

  function cycleStatus(eventId: string, playerId: string) {
    const current = attendance[eventId]?.[playerId];
    const statuses = Object.keys(STATUS_CONFIG) as AttendanceStatus[];
    if (!current) {
      setStatus(eventId, playerId, "present");
    } else {
      const idx = statuses.indexOf(current);
      const next = statuses[(idx + 1) % statuses.length];
      setStatus(eventId, playerId, next);
    }
  }

  const EVENT_ICONS: Record<string, string> = {
    training: "⚽", match: "🏆", cup: "🏅", friendly: "🤝", tournament: "🎯",
  };

  // Statistics for each event
  function getEventStats(eventId: string) {
    const att = attendance[eventId] || {};
    const present = Object.values(att).filter((s) => s === "present" || s === "late").length;
    const absent = Object.values(att).filter((s) => s === "absent" || s === "justified" || s === "injured").length;
    return { present, absent, total: players.length };
  }

  // Statistics per player
  function getPlayerStats(playerId: string) {
    let present = 0, absent = 0, total = 0;
    events.forEach((ev) => {
      const s = attendance[ev.id]?.[playerId];
      if (s) {
        total++;
        if (s === "present" || s === "late") present++;
        else absent++;
      }
    });
    return { present, absent, total, rate: total > 0 ? Math.round((present / total) * 100) : null };
  }

  const weekLabel = `${format(weekStart, "d MMM", { locale: pt })} — ${format(weekEnd, "d MMM yyyy", { locale: pt })}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>← Anterior</button>
          <h1 style={{ fontSize: "1.125rem", fontWeight: 700, textAlign: "center", minWidth: 220 }}>
            ✅ Presenças — {weekLabel}
          </h1>
          <button className="btn btn-ghost btn-sm" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>Seguinte →</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setCurrentWeek(new Date())}>Hoje</button>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <span key={key} className="badge" style={{ background: cfg.color + "22", color: cfg.color, fontSize: "0.6875rem" }}>
              {cfg.icon} {cfg.label}
            </span>
          ))}
        </div>
      </div>

      <div className="page-content" style={{ flex: 1, overflow: "auto", padding: "1.5rem" }}>
        {events.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📋</div>
            <h3>Sem treinos ou jogos esta semana</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
              Adiciona eventos no{" "}
              <a href="/equipa/semana" style={{ color: "var(--brand-400)" }}>Planeamento Semanal</a>.
            </p>
          </div>
        ) : players.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>👥</div>
            <h3>Sem atletas no plantel</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
              Adiciona atletas no{" "}
              <a href="/equipa/plantel" style={{ color: "var(--brand-400)" }}>Plantel</a>.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ minWidth: 600 }}>
              <thead>
                <tr>
                  <th style={{ width: 180, textAlign: "left" }}>Atleta</th>
                  {events.map((ev) => {
                    const stats = getEventStats(ev.id);
                    return (
                      <th key={ev.id} style={{ textAlign: "center", minWidth: 110 }}>
                        <div style={{ fontSize: "0.9rem" }}>{EVENT_ICONS[ev.type] || "📌"}</div>
                        <div style={{ fontWeight: 600, fontSize: "0.75rem", color: "var(--text-primary)" }}>
                          {format(new Date(ev.date + "T12:00:00"), "EEE d/MM", { locale: pt })}
                        </div>
                        <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                          {ev.startTime ? ev.startTime.slice(0, 5) : ""}
                        </div>
                        <div style={{ fontSize: "0.6875rem" }}>
                          <span style={{ color: "#10b981" }}>{stats.present}</span>
                          <span style={{ color: "var(--text-muted)" }}>/</span>
                          <span style={{ color: "var(--text-muted)" }}>{stats.total}</span>
                        </div>
                      </th>
                    );
                  })}
                  <th style={{ textAlign: "center", minWidth: 80 }}>% Presenças</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => {
                  const stats = getPlayerStats(player.id);
                  return (
                    <tr key={player.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                          <div className="avatar" style={{ width: 28, height: 28, fontSize: "0.6875rem" }}>
                            {getInitials(player.name)}
                          </div>
                          <div>
                            <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                              {player.name}
                            </div>
                            {player.number && (
                              <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>#{player.number}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      {events.map((ev) => {
                        const status = attendance[ev.id]?.[player.id];
                        const cfg = status ? STATUS_CONFIG[status] : null;
                        const key = `${ev.id}-${player.id}`;
                        return (
                          <td key={ev.id} style={{ textAlign: "center" }}>
                            <button
                              onClick={() => cycleStatus(ev.id, player.id)}
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                border: cfg ? `2px solid ${cfg.color}` : "1px dashed var(--surface-border)",
                                background: cfg ? cfg.color + "22" : "transparent",
                                color: cfg ? cfg.color : "var(--text-muted)",
                                cursor: "pointer",
                                fontSize: status === "injured" ? "0.9rem" : "0.875rem",
                                fontWeight: 700,
                                transition: "all 0.15s ease",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: saving === key ? 0.5 : 1,
                              }}
                              title={cfg?.label || "Clica para marcar presença"}
                            >
                              {cfg ? cfg.icon : "·"}
                            </button>
                          </td>
                        );
                      })}
                      <td style={{ textAlign: "center" }}>
                        {stats.rate !== null ? (
                          <span
                            style={{
                              fontSize: "0.875rem",
                              fontWeight: 700,
                              color: stats.rate >= 80 ? "#10b981" : stats.rate >= 60 ? "#f59e0b" : "#ef4444",
                            }}
                          >
                            {stats.rate}%
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
