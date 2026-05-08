"use client";

import { useState, useEffect } from "react";
import { format, eachMonthOfInterval, parseISO } from "date-fns";
import { pt } from "date-fns/locale";

type Event = {
  id: string;
  type: string;
  title: string;
  date: string;
};

type MonthStats = {
  training: number;
  match: number;
  rest: number;
  cup: number;
  friendly: number;
  tournament: number;
  other: number;
};

const MATCH_TYPES = ["match", "cup", "friendly", "tournament"];

export default function MacroCicloPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [seasonStart, setSeasonStart] = useState("2026-07-01");
  const [seasonEnd, setSeasonEnd] = useState("2027-06-30");

  useEffect(() => {
    fetch("/api/teams").then(r => r.json()).then(teams => {
      if (teams.length > 0) setTeamId(teams[0].id);
    });
  }, []);

  useEffect(() => {
    if (!teamId) return;
    fetch(`/api/events?teamId=${teamId}&from=${seasonStart}&to=${seasonEnd}`)
      .then(r => r.json())
      .then(setEvents);
  }, [teamId, seasonStart, seasonEnd]);

  const months = eachMonthOfInterval({ start: parseISO(seasonStart), end: parseISO(seasonEnd) });

  function getMonthStats(month: Date): MonthStats {
    const monthStr = format(month, "yyyy-MM");
    const monthEvents = events.filter(e => e.date.startsWith(monthStr));

    return {
      training: monthEvents.filter(e => e.type === "training").length,
      match: monthEvents.filter(e => MATCH_TYPES.includes(e.type)).length,
      rest: monthEvents.filter(e => e.type === "rest").length,
      cup: monthEvents.filter(e => e.type === "cup").length,
      friendly: monthEvents.filter(e => e.type === "friendly").length,
      tournament: monthEvents.filter(e => e.type === "tournament").length,
      other: monthEvents.filter(e => !["training", "rest", ...MATCH_TYPES].includes(e.type)).length,
    };
  }

  const totals = {
    training: events.filter(e => e.type === "training").length,
    match: events.filter(e => MATCH_TYPES.includes(e.type)).length,
    rest: events.filter(e => e.type === "rest").length,
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>📈 Macrociclo</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
            Visão global da época — {seasonStart.slice(0, 4)}/{seasonEnd.slice(2, 4)}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <div className="input-group" style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
            <label className="input-label" style={{ whiteSpace: "nowrap", margin: 0 }}>Época:</label>
            <input type="date" className="input" style={{ width: 140 }} value={seasonStart} onChange={e => setSeasonStart(e.target.value)} />
            <span style={{ color: "var(--text-muted)" }}>→</span>
            <input type="date" className="input" style={{ width: 140 }} value={seasonEnd} onChange={e => setSeasonEnd(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Totais da época */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Treinos (total)", value: totals.training, icon: "⚽", color: "#3b82f6" },
            { label: "Jogos/Competição", value: totals.match, icon: "🏆", color: "#10b981" },
            { label: "Dias de folga", value: totals.rest, icon: "😴", color: "#6b7280" },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ background: s.color + "22", fontSize: "1.25rem" }}>{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Legenda */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          {[
            { key: "training", label: "Treinos", color: "#3b82f6", icon: "⚽" },
            { key: "match", label: "Jogos", color: "#10b981", icon: "🏆" },
            { key: "rest", label: "Folgas", color: "#6b7280", icon: "😴" },
            { key: "other", label: "Outros", color: "#f59e0b", icon: "📌" },
          ].map(l => (
            <span key={l.key} className="badge" style={{ background: l.color + "22", color: l.color }}>
              {l.icon} {l.label}
            </span>
          ))}
        </div>

        {/* Grid de meses */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {months.map(month => {
            const stats = getMonthStats(month);
            const monthLabel = format(month, "MMMM yyyy", { locale: pt });
            const total = stats.training + stats.match + stats.rest + stats.other;

            return (
              <div key={month.toISOString()} className="card">
                {/* Month header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h4 style={{ fontSize: "0.9375rem", textTransform: "capitalize" }}>{monthLabel}</h4>
                  <span className="badge badge-gray" style={{ fontSize: "0.6875rem" }}>
                    {total} eventos
                  </span>
                </div>

                {/* Bars */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {[
                    { key: "training", label: "Treinos", count: stats.training, color: "#3b82f6" },
                    { key: "match", label: "Jogos", count: stats.match, color: "#10b981" },
                    { key: "rest", label: "Folgas", count: stats.rest, color: "#6b7280" },
                    ...(stats.other > 0 ? [{ key: "other", label: "Outros", count: stats.other, color: "#f59e0b" }] : []),
                  ].map(item => (
                    <div key={item.key} style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                      <div style={{ width: 60, fontSize: "0.75rem", color: "var(--text-muted)", flexShrink: 0 }}>
                        {item.label}
                      </div>
                      <div className="progress-bar" style={{ flex: 1 }}>
                        <div
                          className="progress-fill"
                          style={{
                            width: total > 0 ? `${(item.count / total) * 100}%` : "0%",
                            background: item.color,
                          }}
                        />
                      </div>
                      <div style={{ width: 24, textAlign: "right", fontSize: "0.8125rem", fontWeight: 700, color: item.color }}>
                        {item.count}
                      </div>
                    </div>
                  ))}
                </div>

                {total === 0 && (
                  <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.8125rem", marginTop: "0.5rem" }}>
                    Sem eventos planeados
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
