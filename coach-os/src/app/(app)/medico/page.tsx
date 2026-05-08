"use client";

import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";

type MedRecord = {
  id: string;
  playerId: string;
  playerName?: string;
  type: string;
  description: string;
  bodyPart?: string;
  severity?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  notes?: string;
};

type Team = { id: string; name: string };
type Player = { id: string; name: string; teamId: string };

const TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  injury: { label: "Lesão", icon: "🩹", color: "#ef4444" },
  physio: { label: "Fisioterapia", icon: "💊", color: "#3b82f6" },
  cryo: { label: "Crioterapia", icon: "🧊", color: "#06b6d4" },
  massage: { label: "Massagem", icon: "💆", color: "#8b5cf6" },
  other: { label: "Outro", icon: "📋", color: "#6b7280" },
};

const SEVERITY_LABELS: Record<string, { label: string; color: string }> = {
  minor: { label: "Ligeiro", color: "#f59e0b" },
  moderate: { label: "Moderado", color: "#f97316" },
  severe: { label: "Grave", color: "#ef4444" },
};

export default function MedicoPage() {
  const [records, setRecords] = useState<MedRecord[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    playerId: "",
    type: "injury",
    description: "",
    bodyPart: "",
    severity: "minor",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/teams").then(r => r.json()).then(setTeams);
    fetch("/api/players").then(r => r.json()).then(setPlayers);
    loadRecords();
  }, []);

  async function loadRecords() {
    const res = await fetch("/api/medical");
    if (res.ok) setRecords(await res.json());
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const player = players.find(p => p.id === form.playerId);
    await fetch("/api/medical", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        teamId: player?.teamId,
        endDate: form.endDate || undefined,
        bodyPart: form.bodyPart || undefined,
        notes: form.notes || undefined,
      }),
    });

    setSaving(false);
    setShowModal(false);
    loadRecords();
  }

  async function handleClose(id: string) {
    await fetch(`/api/medical/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: false, endDate: new Date().toISOString().split("T")[0] }),
    });
    loadRecords();
  }

  const filteredPlayers = teamFilter === "all" ? players : players.filter(p => p.teamId === teamFilter);

  const filteredRecords = records
    .filter(r => typeFilter === "all" || r.type === typeFilter)
    .filter(r => {
      if (teamFilter === "all") return true;
      const player = players.find(p => p.id === r.playerId);
      return player?.teamId === teamFilter;
    });

  const activeInjuries = records.filter(r => r.type === "injury" && r.isActive).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>🏥 Departamento Médico</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
            {activeInjuries} lesões ativas
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <select
            className="input"
            style={{ width: 160 }}
            value={teamFilter}
            onChange={e => setTeamFilter(e.target.value)}
          >
            <option value="all">Todas as equipas</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            + Novo registo
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Type tabs */}
        <div style={{ display: "flex", gap: "0.375rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <button className={`btn btn-sm ${typeFilter === "all" ? "btn-primary" : "btn-ghost"}`} onClick={() => setTypeFilter("all")}>
            Todos
          </button>
          {Object.entries(TYPE_LABELS).map(([key, { label, icon }]) => (
            <button
              key={key}
              className={`btn btn-sm ${typeFilter === key ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setTypeFilter(key)}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {filteredRecords.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🏥</div>
            <h3>Sem registos</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "0.5rem", marginBottom: "1.5rem" }}>
              Adiciona o primeiro registo médico.
            </p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>Novo registo</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {filteredRecords.map(record => {
              const cfg = TYPE_LABELS[record.type] || TYPE_LABELS.other;
              const sev = record.severity ? SEVERITY_LABELS[record.severity] : null;
              return (
                <div
                  key={record.id}
                  className="card"
                  style={{
                    borderLeft: `3px solid ${record.isActive ? cfg.color : "var(--surface-3)"}`,
                    opacity: record.isActive ? 1 : 0.65,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.375rem" }}>
                        <span style={{ fontSize: "1.125rem" }}>{cfg.icon}</span>
                        <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--text-primary)" }}>
                          {record.playerName || record.playerId}
                        </span>
                        <span className="badge" style={{ background: cfg.color + "22", color: cfg.color, fontSize: "0.6875rem" }}>
                          {cfg.label}
                        </span>
                        {sev && (
                          <span className="badge" style={{ background: sev.color + "22", color: sev.color, fontSize: "0.6875rem" }}>
                            {sev.label}
                          </span>
                        )}
                        {record.isActive && (
                          <span className="badge badge-red" style={{ fontSize: "0.6875rem" }}>Ativo</span>
                        )}
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                        {record.description}
                        {record.bodyPart && <span style={{ color: "var(--text-muted)" }}> · {record.bodyPart}</span>}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        📅 {formatDate(record.startDate)}
                        {record.endDate && <span> → {formatDate(record.endDate)}</span>}
                      </div>
                      {record.notes && (
                        <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "0.375rem", fontStyle: "italic" }}>
                          {record.notes}
                        </div>
                      )}
                    </div>
                    {record.isActive && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleClose(record.id)}
                        style={{ fontSize: "0.75rem", marginLeft: "1rem" }}
                      >
                        Fechar
                      </button>
                    )}
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
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: "1.25rem" }}>Novo Registo Médico</h3>
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div className="input-group">
                  <label className="input-label">Equipa (filtro)</label>
                  <select className="input" value={teamFilter} onChange={e => setTeamFilter(e.target.value)}>
                    <option value="all">Todas</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Atleta *</label>
                  <select className="input" value={form.playerId} onChange={e => setForm({ ...form, playerId: e.target.value })} required>
                    <option value="">Selecionar atleta...</option>
                    {filteredPlayers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div className="input-group">
                  <label className="input-label">Tipo *</label>
                  <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                {form.type === "injury" && (
                  <div className="input-group">
                    <label className="input-label">Gravidade</label>
                    <select className="input" value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>
                      {Object.entries(SEVERITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="input-group">
                <label className="input-label">Descrição *</label>
                <input className="input" placeholder="ex: Entorse joelho direito" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                <div className="input-group">
                  <label className="input-label">Zona corporal</label>
                  <input className="input" placeholder="ex: Joelho direito" value={form.bodyPart} onChange={e => setForm({ ...form, bodyPart: e.target.value })} />
                </div>
                <div className="input-group">
                  <label className="input-label">Data início *</label>
                  <input type="date" className="input" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Data fim (prevista)</label>
                  <input type="date" className="input" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Notas / Observações</label>
                <textarea className="input" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "A guardar..." : "Guardar registo"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
