"use client";

import { useState, useEffect } from "react";

type Season = { id: string; name: string; isActive: boolean };
type Team = { id: string; name: string; ageGroup?: string; color: string; seasonId: string };

const TEAM_COLORS = [
  "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b",
  "#ef4444", "#06b6d4", "#f97316", "#84cc16",
];

export default function EquipasPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    ageGroup: "",
    color: "#3b82f6",
    seasonId: "",
  });

  async function loadData() {
    const [seasonsRes, teamsRes] = await Promise.all([
      fetch("/api/seasons"),
      fetch("/api/teams"),
    ]);
    const seasonsData = seasonsRes.ok ? await seasonsRes.json() : [];
    const teamsData = teamsRes.ok ? await teamsRes.json() : [];
    setSeasons(seasonsData);
    setTeams(teamsData);

    const active = seasonsData.find((s: Season) => s.isActive);
    if (active) setSelectedSeason(active.id);
    else if (seasonsData.length > 0) setSelectedSeason(seasonsData[0].id);
  }

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (selectedSeason) setForm((prev) => ({ ...prev, seasonId: selectedSeason }));
  }, [selectedSeason]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, seasonId: form.seasonId || selectedSeason }),
    });
    setSaving(false);
    setShowModal(false);
    setForm({ name: "", ageGroup: "", color: "#3b82f6", seasonId: selectedSeason });
    loadData();
  }

  const filteredTeams = teams.filter((t) => t.seasonId === selectedSeason);
  const activeSeason = seasons.find((s) => s.id === selectedSeason);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>⚽ Equipas</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
            {filteredTeams.length} equipa(s) na época selecionada
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <select
            className="input"
            style={{ width: 160 }}
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
          >
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.isActive ? "(ativa)" : ""}
              </option>
            ))}
          </select>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowModal(true)}
            disabled={!selectedSeason}
          >
            + Nova equipa
          </button>
        </div>
      </div>

      <div className="page-content">
        {seasons.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📆</div>
            <h3>Nenhuma época criada</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
              Cria primeiro uma época na página{" "}
              <a href="/clube/epocas" style={{ color: "var(--brand-400)" }}>Épocas</a>.
            </p>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⚽</div>
            <h3>Sem equipas em {activeSeason?.name}</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "0.5rem", marginBottom: "1.5rem" }}>
              Cria a primeira equipa para esta época.
            </p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Criar equipa
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
            {filteredTeams.map((team) => (
              <div
                key={team.id}
                className="card"
                style={{ borderLeft: `4px solid ${team.color || "#3b82f6"}` }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.875rem" }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "var(--radius-md)",
                      background: (team.color || "#3b82f6") + "22",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.25rem",
                    }}
                  >
                    ⚽
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>
                      {team.name}
                    </div>
                    {team.ageGroup && (
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{team.ageGroup}</div>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <a
                    href={`/equipa`}
                    className="btn btn-ghost btn-sm"
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    Workspace →
                  </a>
                  <a
                    href={`/equipa/plantel`}
                    className="btn btn-ghost btn-sm"
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    Plantel →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "1.25rem" }}>Nova Equipa</h3>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="input-group">
                <label className="input-label">Época *</label>
                <select
                  className="input"
                  value={form.seasonId}
                  onChange={(e) => setForm({ ...form, seasonId: e.target.value })}
                  required
                >
                  {seasons.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.75rem" }}>
                <div className="input-group">
                  <label className="input-label">Nome da equipa *</label>
                  <input
                    className="input"
                    placeholder="ex: Infantis A"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Escalão</label>
                  <input
                    className="input"
                    placeholder="ex: Sub-12"
                    value={form.ageGroup}
                    onChange={(e) => setForm({ ...form, ageGroup: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Cor da equipa</label>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {TEAM_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm({ ...form, color })}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: color,
                        border: form.color === color ? `3px solid white` : "3px solid transparent",
                        cursor: "pointer",
                        outline: form.color === color ? `2px solid ${color}` : "none",
                        transition: "all 0.15s ease",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "A criar..." : "Criar equipa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
