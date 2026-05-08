"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { slugify } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    clubName: "",
    adminName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("As passwords não coincidem.");
      return;
    }
    if (form.password.length < 8) {
      setError("A password deve ter pelo menos 8 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubName: form.clubName,
          adminName: form.adminName,
          email: form.email,
          password: form.password,
          slug: slugify(form.clubName),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao criar conta.");
        return;
      }

      router.push("/login?registered=1");
    } catch {
      setError("Erro inesperado. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(132,204,22,0.08) 0%, transparent 60%), var(--surface-0)",
        padding: "1rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: 460, animation: "slideUp 0.3s ease" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(135deg, var(--brand-600), var(--brand-400))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.375rem",
                fontWeight: 800,
                color: "#fff",
              }}
            >
              C
            </div>
            <span style={{ fontSize: "1.375rem", fontWeight: 800 }}>
              Coach<span style={{ color: "var(--brand-400)" }}>OS</span>
            </span>
          </Link>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Cria o teu clube
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Começa com 1 equipa grátis — sem cartão de crédito
          </p>
        </div>

        <div className="card-elevated">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="input-group">
              <label className="input-label" htmlFor="clubName">Nome do Clube *</label>
              <input
                id="clubName"
                type="text"
                className="input"
                placeholder="ex: Sporting Clube de Braga"
                value={form.clubName}
                onChange={(e) => setForm({ ...form, clubName: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="adminName">O teu nome *</label>
              <input
                id="adminName"
                type="text"
                className="input"
                placeholder="ex: João Silva"
                value={form.adminName}
                onChange={(e) => setForm({ ...form, adminName: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="reg-email">Email *</label>
              <input
                id="reg-email"
                type="email"
                className="input"
                placeholder="joao@clube.pt"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div className="input-group">
                <label className="input-label" htmlFor="reg-password">Password *</label>
                <input
                  id="reg-password"
                  type="password"
                  className="input"
                  placeholder="Min. 8 caracteres"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="confirm-password">Confirmar *</label>
                <input
                  id="confirm-password"
                  type="password"
                  className="input"
                  placeholder="Repetir password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            {error && (
              <div
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.75rem",
                  fontSize: "0.875rem",
                  color: "#f87171",
                }}
              >
                {error}
              </div>
            )}

            {/* Plan info */}
            <div
              style={{
                background: "rgba(59,130,246,0.08)",
                border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: "var(--radius-md)",
                padding: "0.875rem",
                fontSize: "0.8125rem",
                color: "var(--text-secondary)",
              }}
            >
              🎉 <strong style={{ color: "var(--brand-400)" }}>Plano Free</strong> — 1 equipa, 3 membros de staff.
              Sem limite de tempo.
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginTop: "0.5rem", height: 44 }}
            >
              {loading ? "A criar clube..." : "Criar clube grátis →"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Já tens conta?{" "}
          <Link href="/login" style={{ color: "var(--brand-400)", fontWeight: 600 }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
