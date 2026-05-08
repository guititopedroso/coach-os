"use client";

import { useState, useEffect } from "react";
import { formatDate, ROLE_LABELS, getInitials } from "@/lib/utils";

type User = {
  id: string;
  name: string;
  email: string;
  globalRole: string;
  staffDept?: string;
  isActive: boolean;
  createdAt: string;
};

type Invite = {
  id: string;
  email: string;
  globalRole: string;
  staffDept?: string;
  teamId?: string;
  token: string;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
};

type Team = { id: string; name: string };

const GLOBAL_ROLE_OPTIONS = [
  { value: "staff", label: "Staff (Equipa Técnica)" },
  { value: "player", label: "Jogador" },
];

const STAFF_DEPT_OPTIONS = [
  { value: "", label: "Nenhum (Equipa Técnica)" },
  { value: "medical", label: "Departamento Médico" },
  { value: "udia", label: "UDIA" },
  { value: "gr_coach", label: "Treinador de GR's" },
];

export default function AcessosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    globalRole: "staff",
    staffDept: "",
    teamId: "",
  });
  const [tab, setTab] = useState<"users" | "invites">("users");

  async function loadData() {
    const [usersRes, invitesRes, teamsRes] = await Promise.all([
      fetch("/api/club/users"),
      fetch("/api/club/invites"),
      fetch("/api/teams"),
    ]);
    if (usersRes.ok) setUsers(await usersRes.json());
    if (invitesRes.ok) setInvites(await invitesRes.json());
    if (teamsRes.ok) setTeams(await teamsRes.json());
  }

  useEffect(() => { loadData(); }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);

    const res = await fetch("/api/club/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        globalRole: form.globalRole,
        staffDept: form.staffDept || undefined,
        teamId: form.teamId || undefined,
      }),
    });

    setSending(false);
    if (res.ok) {
      setShowModal(false);
      setForm({ email: "", globalRole: "staff", staffDept: "", teamId: "" });
      loadData();
    }
  }

  async function toggleUserActive(userId: string, isActive: boolean) {
    await fetch(`/api/club/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    loadData();
  }

  function copyInviteLink(token: string) {
    const link = `${window.location.origin}/convite/${token}`;
    navigator.clipboard.writeText(link);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  }

  function getRoleDisplay(user: User) {
    if (user.staffDept) {
      const deptMap: Record<string, string> = {
        medical: "Dep. Médico",
        udia: "UDIA",
        gr_coach: "Treinador GR's",
      };
      return deptMap[user.staffDept] || user.globalRole;
    }
    return ROLE_LABELS[user.globalRole] || user.globalRole;
  }

  const roleColors: Record<string, string> = {
    club_admin: "#3b82f6",
    staff: "#10b981",
    player: "#8b5cf6",
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>🔑 Acessos & Staff</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
            {users.length} utilizadores · {invites.filter((i) => !i.acceptedAt).length} convites pendentes
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          + Convidar membro
        </button>
      </div>

      <div className="page-content">
        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.375rem", marginBottom: "1.5rem" }}>
          <button className={`btn btn-sm ${tab === "users" ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab("users")}>
            Utilizadores ({users.length})
          </button>
          <button className={`btn btn-sm ${tab === "invites" ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab("invites")}>
            Convites ({invites.filter((i) => !i.acceptedAt).length} pendentes)
          </button>
        </div>

        {tab === "users" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {users.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                Sem utilizadores ainda. Convida membros para a equipa.
              </div>
            ) : (
              users.map((user) => {
                const color = roleColors[user.globalRole] || "#6b7280";
                return (
                  <div key={user.id} className="card" style={{ display: "flex", alignItems: "center", gap: "1rem", opacity: user.isActive ? 1 : 0.6 }}>
                    <div className="avatar" style={{ background: `linear-gradient(135deg, ${color}cc, ${color}44)` }}>
                      {getInitials(user.name)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                        <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--text-primary)" }}>
                          {user.name}
                        </span>
                        <span className="badge" style={{ background: color + "22", color: color, fontSize: "0.6875rem" }}>
                          {getRoleDisplay(user)}
                        </span>
                        {!user.isActive && (
                          <span className="badge badge-gray" style={{ fontSize: "0.6875rem" }}>Inativo</span>
                        )}
                      </div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{user.email}</div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        className={`btn btn-sm ${user.isActive ? "btn-ghost" : "btn-primary"}`}
                        onClick={() => toggleUserActive(user.id, user.isActive)}
                        style={{ fontSize: "0.75rem" }}
                      >
                        {user.isActive ? "Desativar" : "Ativar"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {invites.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                Sem convites enviados. Convida membros com o botão acima.
              </div>
            ) : (
              invites.map((invite) => {
                const expired = new Date(invite.expiresAt) < new Date();
                const accepted = !!invite.acceptedAt;
                return (
                  <div
                    key={invite.id}
                    className="card"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      opacity: expired || accepted ? 0.6 : 1,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.25rem" }}>
                        <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9375rem" }}>
                          {invite.email}
                        </span>
                        <span className="badge badge-gray" style={{ fontSize: "0.6875rem" }}>
                          {ROLE_LABELS[invite.globalRole] || invite.globalRole}
                        </span>
                        {accepted && <span className="badge badge-green" style={{ fontSize: "0.6875rem" }}>✅ Aceite</span>}
                        {!accepted && expired && <span className="badge badge-red" style={{ fontSize: "0.6875rem" }}>Expirado</span>}
                        {!accepted && !expired && <span className="badge badge-yellow" style={{ fontSize: "0.6875rem" }}>⏳ Pendente</span>}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        Enviado: {formatDate(invite.createdAt, "dd/MM/yyyy")} · Expira: {formatDate(invite.expiresAt, "dd/MM/yyyy")}
                      </div>
                    </div>
                    {!accepted && !expired && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => copyInviteLink(invite.token)}
                        style={{ fontSize: "0.75rem" }}
                      >
                        {copied === invite.token ? "✓ Copiado!" : "📋 Copiar link"}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Modal convite */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "1.25rem" }}>Convidar membro</h3>
            <form onSubmit={handleInvite} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="input-group">
                <label className="input-label">Email *</label>
                <input
                  type="email"
                  className="input"
                  placeholder="membro@clube.pt"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Tipo de acesso *</label>
                <select className="input" value={form.globalRole} onChange={(e) => setForm({ ...form, globalRole: e.target.value })}>
                  {GLOBAL_ROLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {form.globalRole === "staff" && (
                <div className="input-group">
                  <label className="input-label">Departamento / Função</label>
                  <select className="input" value={form.staffDept} onChange={(e) => setForm({ ...form, staffDept: e.target.value })}>
                    {STAFF_DEPT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {form.globalRole === "staff" && !form.staffDept && (
                <div className="input-group">
                  <label className="input-label">Equipa (para Equipa Técnica)</label>
                  <select className="input" value={form.teamId} onChange={(e) => setForm({ ...form, teamId: e.target.value })}>
                    <option value="">Selecionar equipa...</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div
                style={{
                  padding: "0.875rem",
                  background: "rgba(59,130,246,0.08)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.8125rem",
                  color: "var(--text-secondary)",
                }}
              >
                💡 Será gerado um link de convite único. O utilizador terá 7 dias para aceitar e criar a sua conta.
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={sending}>
                  {sending ? "A enviar..." : "Gerar convite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
