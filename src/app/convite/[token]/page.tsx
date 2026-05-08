"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type InviteInfo = {
  email: string;
  globalRole: string;
  staffDept?: string;
  clubName: string;
  expiresAt: string;
};

export default function ConvitePage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const [token, setToken] = useState<string>("");
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", password: "", confirmPassword: "" });

  useEffect(() => {
    params.then(({ token: t }) => {
      setToken(t);
      fetch(`/api/convite/${t}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.error) setError(data.error);
          else setInvite(data);
          setLoading(false);
        })
        .catch(() => { setError("Convite inválido ou expirado."); setLoading(false); });
    });
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("As palavras-passe não coincidem.");
      return;
    }
    setSubmitting(true);

    const res = await fetch(`/api/convite/${token}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, password: form.password }),
    });

    if (res.ok) {
      router.push("/login?registered=1");
    } else {
      const data = await res.json();
      setError(data.error || "Erro ao aceitar convite.");
      setSubmitting(false);
    }
  }

  const DEPT_LABELS: Record<string, string> = {
    medical: "Departamento Médico",
    udia: "UDIA",
    gr_coach: "Treinador de GR's",
  };

  const ROLE_LABELS: Record<string, string> = {
    staff: "Equipa Técnica",
    player: "Jogador",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--surface-0)",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "var(--surface-1)",
          border: "1px solid var(--surface-border)",
          borderRadius: "var(--radius-xl)",
          padding: "2.5rem",
          boxShadow: "var(--shadow-elevated)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "linear-gradient(135deg, var(--brand-600), var(--brand-400))",
              fontSize: "1.25rem",
              fontWeight: 800,
              color: "#fff",
              marginBottom: "0.75rem",
            }}
          >
            C
          </div>
          <h1 style={{ fontSize: "1.5rem", color: "var(--text-primary)" }}>
            Coach<span style={{ color: "var(--brand-400)" }}>OS</span>
          </h1>
        </div>

        {loading && (
          <div style={{ textAlign: "center", color: "var(--text-muted)" }}>A verificar convite...</div>
        )}

        {!loading && error && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>❌</div>
            <h3 style={{ color: "#f87171", marginBottom: "0.5rem" }}>Convite inválido</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>{error}</p>
            <a href="/login" className="btn btn-primary">
              Ir para o login
            </a>
          </div>
        )}

        {!loading && !error && invite && (
          <>
            <div
              style={{
                padding: "1rem",
                background: "rgba(59,130,246,0.08)",
                border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: "var(--radius-md)",
                marginBottom: "1.5rem",
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
              }}
            >
              <div style={{ marginBottom: "0.25rem" }}>
                🏛️ <strong style={{ color: "var(--text-primary)" }}>{invite.clubName}</strong> convidou-te para
              </div>
              <div>
                🎯 <strong style={{ color: "var(--brand-400)" }}>
                  {invite.staffDept
                    ? DEPT_LABELS[invite.staffDept] || invite.staffDept
                    : ROLE_LABELS[invite.globalRole] || invite.globalRole}
                </strong>
              </div>
            </div>

            <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem", textAlign: "center" }}>
              Criar a tua conta
            </h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="input-group">
                <label className="input-label">Email</label>
                <input
                  className="input"
                  value={invite.email}
                  disabled
                  style={{ opacity: 0.6, cursor: "not-allowed" }}
                />
              </div>

              <div className="input-group">
                <label className="input-label">O teu nome *</label>
                <input
                  className="input"
                  placeholder="João Silva"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Palavra-passe *</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Confirmar palavra-passe *</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Repete a palavra-passe"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                />
              </div>

              {error && (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: "var(--radius-md)",
                    color: "#f87171",
                    fontSize: "0.875rem",
                  }}
                >
                  {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} style={{ marginTop: "0.5rem" }}>
                {submitting ? "A criar conta..." : "Criar conta e entrar"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
