"use client";

import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";

type Season = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

export default function EpocasPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", startDate: "", endDate: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadSeasons() {
    const res = await fetch("/api/seasons");
    if (res.ok) setSeasons(await res.json());
    setLoading(false);
  }

  useEffect(() => { loadSeasons(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/seasons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowModal(false);
      setForm({ name: "", startDate: "", endDate: "" });
      loadSeasons();
    } else {
      const d = await res.json();
      setError(d.error || "Erro ao criar época.");
    }
    setSaving(false);
  }

  async function handleSetActive(id: string) {
    await fetch(`/api/seasons/${id}/activate`, { method: "POST" });
    loadSeasons();
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>📆 Épocas</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>Gerir épocas desportivas</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          + Nova Época
        </button>
      </div>

      <div className="page-content">
        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>A carregar...</p>
        ) : seasons.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📆</div>
            <h3>Nenhuma época criada</h3>
            <p style={{ marginTop: "0.5rem", marginBottom: "1.5rem" }}>
              Cria a tua primeira época para começar a organizar o clube.
            </p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Criar primeira época
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {seasons.map((s) => (
              <div
                key={s.id}
                className="card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                  borderLeft: s.isActive ? "3px solid var(--brand-500)" : "3px solid transparent",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--text-primary)" }}>
                      {s.name}
                    </span>
                    {s.isActive && <span className="badge badge-blue">Ativa</span>}
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                    {formatDate(s.startDate)} → {formatDate(s.endDate)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {!s.isActive && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleSetActive(s.id)}
                    >
                      Ativar
                    </button>
                  )}
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
            <h3 style={{ marginBottom: "1.25rem" }}>Nova Época</h3>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="input-group">
                <label className="input-label" htmlFor="season-name">Nome *</label>
                <input
                  id="season-name"
                  className="input"
                  placeholder="ex: 2026/27"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div className="input-group">
                  <label className="input-label" htmlFor="season-start">Data de início *</label>
                  <input
                    id="season-start"
                    type="date"
                    className="input"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label" htmlFor="season-end">Data de fim *</label>
                  <input
                    id="season-end"
                    type="date"
                    className="input"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              {error && (
                <div style={{ color: "#f87171", fontSize: "0.875rem", background: "rgba(239,68,68,0.1)", padding: "0.75rem", borderRadius: "var(--radius-md)" }}>
                  {error}
                </div>
              )}
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "A criar..." : "Criar Época"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
