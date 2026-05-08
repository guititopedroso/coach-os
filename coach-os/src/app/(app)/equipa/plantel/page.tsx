"use client";

import { useState, useEffect } from "react";
import { POSITION_LABELS, getInitials } from "@/lib/utils";

type Player = {
  id: string;
  name: string;
  number?: number;
  position: string;
  birthDate?: string;
  nationality?: string;
  phone?: string;
};

const POSITIONS = ["goalkeeper", "defender", "midfielder", "forward"] as const;

const POSITION_ICONS: Record<string, string> = {
  goalkeeper: "🥅",
  defender: "🛡️",
  midfielder: "⚙️",
  forward: "⚡",
};

const POSITION_COLORS: Record<string, string> = {
  goalkeeper: "#f59e0b",
  defender: "#3b82f6",
  midfielder: "#10b981",
  forward: "#ef4444",
};

export default function PlantelPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [form, setForm] = useState({
    name: "", number: "", position: "midfielder", birthDate: "", nationality: "PT", phone: "",
  });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/teams").then(r => r.json()).then(teams => {
      if (teams.length > 0) setTeamId(teams[0].id);
    });
  }, []);

  async function loadPlayers() {
    if (!teamId) return;
    const res = await fetch(`/api/players?teamId=${teamId}`);
    if (res.ok) setPlayers(await res.json());
  }

  useEffect(() => { loadPlayers(); }, [teamId]);

  function openCreate() {
    setSelectedPlayer(null);
    setForm({ name: "", number: "", position: "midfielder", birthDate: "", nationality: "PT", phone: "" });
    setShowModal(true);
  }

  function openEdit(p: Player) {
    setSelectedPlayer(p);
    setForm({
      name: p.name,
      number: p.number?.toString() || "",
      position: p.position,
      birthDate: p.birthDate || "",
      nationality: p.nationality || "PT",
      phone: p.phone || "",
    });
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!teamId) return;
    setSaving(true);

    const payload = {
      name: form.name,
      teamId,
      number: form.number ? parseInt(form.number) : undefined,
      position: form.position,
      birthDate: form.birthDate || undefined,
      nationality: form.nationality,
      phone: form.phone || undefined,
    };

    const url = selectedPlayer ? `/api/players/${selectedPlayer.id}` : "/api/players";
    const method = selectedPlayer ? "PATCH" : "POST";

    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

    setSaving(false);
    setShowModal(false);
    loadPlayers();
  }

  const filteredPlayers = filter === "all" ? players : players.filter(p => p.position === filter);
  const byPosition = POSITIONS.reduce((acc, pos) => {
    acc[pos] = players.filter(p => p.position === pos);
    return acc;
  }, {} as Record<string, Player[]>);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>👥 Plantel</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
            {players.length} atletas
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "0.375rem" }}>
            <button
              className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setFilter("all")}
            >
              Todos
            </button>
            {POSITIONS.map(pos => (
              <button
                key={pos}
                className={`btn btn-sm ${filter === pos ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setFilter(pos)}
              >
                {POSITION_ICONS[pos]} {POSITION_LABELS[pos]}
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            + Adicionar atleta
          </button>
        </div>
      </div>

      <div className="page-content">
        {filter === "all" ? (
          /* Vista por posição */
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {POSITIONS.map(pos => {
              const group = byPosition[pos];
              if (group.length === 0) return null;
              return (
                <div key={pos}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                    <span style={{ fontSize: "1.5rem" }}>{POSITION_ICONS[pos]}</span>
                    <h2 style={{ fontSize: "1.0625rem" }}>{POSITION_LABELS[pos]}</h2>
                    <span
                      className="badge"
                      style={{ background: POSITION_COLORS[pos] + "22", color: POSITION_COLORS[pos] }}
                    >
                      {group.length}
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
                    {group.map(player => (
                      <PlayerCard
                        key={player.id}
                        player={player}
                        posColor={POSITION_COLORS[pos]}
                        onEdit={() => openEdit(player)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
            {players.length === 0 && (
              <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>👥</div>
                <h3>Plantel vazio</h3>
                <p style={{ marginTop: "0.5rem", marginBottom: "1.5rem", color: "var(--text-muted)" }}>
                  Adiciona os atletas à equipa.
                </p>
                <button className="btn btn-primary" onClick={openCreate}>Adicionar primeiro atleta</button>
              </div>
            )}
          </div>
        ) : (
          /* Vista filtrada */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
            {filteredPlayers.map(player => (
              <PlayerCard
                key={player.id}
                player={player}
                posColor={POSITION_COLORS[player.position]}
                onEdit={() => openEdit(player)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: "1.25rem" }}>{selectedPlayer ? "Editar atleta" : "Adicionar atleta"}</h3>
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.75rem" }}>
                <div className="input-group">
                  <label className="input-label">Nome *</label>
                  <input className="input" placeholder="João Silva" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Nº Camisola</label>
                  <input type="number" className="input" placeholder="10" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Posição *</label>
                <select className="input" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })}>
                  {POSITIONS.map(pos => (
                    <option key={pos} value={pos}>{POSITION_LABELS[pos]}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div className="input-group">
                  <label className="input-label">Data de nascimento</label>
                  <input type="date" className="input" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} />
                </div>
                <div className="input-group">
                  <label className="input-label">Nacionalidade</label>
                  <input className="input" placeholder="PT" value={form.nationality} onChange={e => setForm({ ...form, nationality: e.target.value })} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Telefone</label>
                <input type="tel" className="input" placeholder="+351 900 000 000" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
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

function PlayerCard({ player, posColor, onEdit }: { player: Player; posColor: string; onEdit: () => void }) {
  return (
    <div
      className="card"
      style={{ cursor: "pointer", borderTop: `2px solid ${posColor}` }}
      onClick={onEdit}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
        <div
          className="avatar"
          style={{ background: `linear-gradient(135deg, ${posColor}cc, ${posColor}66)` }}
        >
          {getInitials(player.name)}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--text-primary)" }}>
            {player.name}
          </div>
          {player.number && (
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              #{player.number}
            </div>
          )}
        </div>
      </div>
      {player.birthDate && (
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          📅 {player.birthDate}
        </div>
      )}
    </div>
  );
}
