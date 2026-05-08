"use client";

import Link from "next/link";
import { useState } from "react";

const features = [
  {
    icon: "📅",
    title: "Planeamento Completo",
    desc: "Vista de Mês, Semana e Macrociclo. Organiza treinos, jogos e folgas com facilidade.",
    color: "#3b82f6",
  },
  {
    icon: "📊",
    title: "Questionários com Gráficos",
    desc: "PSR diário, PSE por sessão e Autoavaliação Pós-jogo. Dashboards em tempo real.",
    color: "#10b981",
  },
  {
    icon: "🏥",
    title: "Departamento Médico",
    desc: "Registo de lesões, fisioterapia e terapias. Histórico por atleta e por equipa.",
    color: "#ef4444",
  },
  {
    icon: "👥",
    title: "Multi-Equipa",
    desc: "Infantis, Iniciados, Juniores... Cada equipa com o seu workspace. Coordenação com visão global.",
    color: "#8b5cf6",
  },
  {
    icon: "🎯",
    title: "UDIA & Treinador GR's",
    desc: "Unidades de desenvolvimento individual. Sessões de GR's com filtro por escalão e feedback.",
    color: "#f59e0b",
  },
  {
    icon: "📹",
    title: "Análise de Vídeo",
    desc: "Anexa links Veo, Drive ou YouTube a atletas ou sessões. Feedback com clips individuais.",
    color: "#06b6d4",
  },
];

const plans = [
  {
    name: "Free",
    price: "0",
    teams: "1 equipa",
    staff: "3 membros",
    color: "#6b7280",
    features: ["Planeamento básico", "Questionários", "Plantel"],
    cta: "Começar grátis",
  },
  {
    name: "Starter",
    price: "29",
    teams: "3 equipas",
    staff: "10 membros",
    color: "#3b82f6",
    features: ["Tudo do Free", "Dep. Médico", "Export Excel", "Clips"],
    cta: "Começar trial",
    popular: true,
  },
  {
    name: "Pro",
    price: "79",
    teams: "8 equipas",
    staff: "30 membros",
    color: "#8b5cf6",
    features: ["Tudo do Starter", "UDIA", "Treinador GR's", "Analytics"],
    cta: "Começar trial",
  },
  {
    name: "Elite",
    price: "149",
    teams: "Ilimitadas",
    staff: "Ilimitados",
    color: "#f59e0b",
    features: ["Tudo do Pro", "API access", "Suporte prioritário", "Custom"],
    cta: "Contactar",
  },
];

const stats = [
  { value: "500+", label: "Clubes Ativos" },
  { value: "12K+", label: "Atletas na Plataforma" },
  { value: "98%", label: "Satisfação" },
  { value: "6", label: "Portais Especializados" },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div style={{ background: "var(--surface-0)", minHeight: "100vh" }}>
      {/* NAVBAR */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "1rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(10, 15, 30, 0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--surface-border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, var(--brand-600), var(--brand-400))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              fontWeight: 800,
              color: "#fff",
            }}
          >
            C
          </div>
          <span style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--text-primary)" }}>
            Coach<span style={{ color: "var(--brand-400)" }}>OS</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="#funcionalidades" className="btn btn-ghost btn-sm" style={{ display: "none" }}>
            Funcionalidades
          </Link>
          <Link href="#precos" className="btn btn-ghost btn-sm">
            Preços
          </Link>
          <Link href="/login" className="btn btn-ghost btn-sm">
            Entrar
          </Link>
          <Link href="/register" className="btn btn-primary btn-sm">
            Criar clube
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="landing-hero" style={{ paddingTop: "7rem" }}>
        {/* Glow orbs */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "15%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "30%",
            right: "15%",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(132,204,22,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Badge */}
        <div
          className="badge badge-blue animate-fade-in"
          style={{ marginBottom: "1.5rem", fontSize: "0.8125rem" }}
        >
          ⚽ Plataforma SaaS para Clubes de Futebol
        </div>

        <h1
          className="gradient-text animate-slide-up"
          style={{ maxWidth: 800, marginBottom: "1.5rem" }}
        >
          A plataforma que o teu clube merecia ter
        </h1>

        <p
          className="animate-slide-up"
          style={{
            maxWidth: 560,
            fontSize: "1.125rem",
            color: "var(--text-secondary)",
            marginBottom: "2.5rem",
            lineHeight: 1.7,
            animationDelay: "0.1s",
          }}
        >
          Planeamento, questionários, análise de vídeo, departamento médico e muito mais.
          Tudo num único workspace por equipa.
        </p>

        <div
          className="animate-slide-up"
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            justifyContent: "center",
            animationDelay: "0.2s",
          }}
        >
          <Link href="/register" className="btn btn-primary btn-lg">
            Criar clube grátis →
          </Link>
          <Link href="/login" className="btn btn-ghost btn-lg">
            Ver demo
          </Link>
        </div>

        {/* Stats strip */}
        <div
          className="glass-card animate-slide-up"
          style={{
            marginTop: "4rem",
            padding: "1.5rem 2.5rem",
            display: "flex",
            gap: "3rem",
            flexWrap: "wrap",
            justifyContent: "center",
            animationDelay: "0.3s",
          }}
        >
          {stats.map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--text-muted)",
                  marginTop: "0.25rem",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="funcionalidades"
        style={{ padding: "6rem 2rem", maxWidth: 1200, margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <div className="badge badge-blue" style={{ marginBottom: "1rem" }}>
            Funcionalidades
          </div>
          <h2 style={{ marginBottom: "1rem" }}>
            Tudo o que precisas,{" "}
            <span className="gradient-text">num só lugar</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.0625rem", maxWidth: 540, margin: "0 auto" }}>
            Desde o treinador principal ao departamento médico — cada área com o seu workspace especializado.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {features.map((f) => (
            <div
              key={f.title}
              className="card"
              style={{ cursor: "default" }}
            >
              <div
                className="stat-icon"
                style={{ background: f.color + "22", fontSize: "1.5rem", marginBottom: "0.75rem" }}
              >
                {f.icon}
              </div>
              <h4 style={{ marginBottom: "0.5rem" }}>{f.title}</h4>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PORTALS SHOWCASE */}
      <section
        style={{
          padding: "6rem 2rem",
          background: "linear-gradient(180deg, transparent, rgba(59,130,246,0.04), transparent)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="badge badge-purple" style={{ marginBottom: "1rem" }}>
              6 Portais Especializados
            </div>
            <h2>
              Cada pessoa vê{" "}
              <span className="gradient-text">o que precisa</span>
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1rem",
            }}
          >
            {[
              {
                portal: "🏛️ Coordenação",
                desc: "Gere épocas, equipas, staff e subscrição. Visão global do clube.",
                badge: "club_admin",
                color: "#3b82f6",
              },
              {
                portal: "⚽ Equipa Técnica",
                desc: "Planeamento Mês/Semana/Macrociclo, Plantel, Questionários e Clips.",
                badge: "head_coach",
                color: "#10b981",
              },
              {
                portal: "🧍 Jogador",
                desc: "Ver treinos publicados e responder a PSR, PSE e Pós-jogo.",
                badge: "player",
                color: "#8b5cf6",
              },
              {
                portal: "🏥 Dep. Médico",
                desc: "Registo de lesões e terapias por equipa. Histórico completo por atleta.",
                badge: "medical",
                color: "#ef4444",
              },
              {
                portal: "🎯 UDIA",
                desc: "Sessões de desenvolvimento individual. Feedback personalizado com clips.",
                badge: "udia",
                color: "#f59e0b",
              },
              {
                portal: "🥅 Treinador GR's",
                desc: "Agenda semanal para todos os GR's. Filtro por escalão e feedback individual.",
                badge: "gr_coach",
                color: "#06b6d4",
              },
            ].map((p) => (
              <div
                key={p.portal}
                className="card"
                style={{ borderLeft: `3px solid ${p.color}`, cursor: "default" }}
              >
                <div style={{ fontSize: "1.375rem", marginBottom: "0.75rem" }}>
                  {p.portal.split(" ").slice(1).join(" ")}
                </div>
                <div style={{ fontSize: "1.0625rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--text-primary)" }}>
                  {p.portal}
                </div>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="precos" style={{ padding: "6rem 2rem", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <div className="badge badge-green" style={{ marginBottom: "1rem" }}>
            Preços Simples
          </div>
          <h2>
            Começa com <span className="gradient-text">1 equipa gratuita</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.75rem" }}>
            Sem compromissos. Escala conforme o teu clube cresce.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "1.25rem",
            alignItems: "start",
          }}
        >
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={plan.popular ? "card-elevated" : "card"}
              style={{
                position: "relative",
                borderColor: plan.popular ? plan.color + "50" : undefined,
              }}
            >
              {plan.popular && (
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: plan.color,
                    color: "#fff",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    padding: "0.25rem 0.875rem",
                    borderRadius: 999,
                    whiteSpace: "nowrap",
                  }}
                >
                  MAIS POPULAR
                </div>
              )}

              <div style={{ marginBottom: "1.25rem" }}>
                <div
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: plan.color,
                    marginBottom: "0.5rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {plan.name}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
                  <span style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--text-primary)" }}>
                    €{plan.price}
                  </span>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>/mês</span>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                  <span className="badge badge-gray">{plan.teams}</span>
                  <span className="badge badge-gray">{plan.staff}</span>
                </div>
              </div>

              <ul style={{ listStyle: "none", marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {plan.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.875rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <span style={{ color: plan.color }}>✓</span> {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className="btn btn-ghost"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  borderColor: plan.color + "50",
                  color: plan.color,
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: "6rem 2rem", textAlign: "center" }}>
        <div
          className="glass-card"
          style={{
            maxWidth: 700,
            margin: "0 auto",
            padding: "4rem 2rem",
            background: "radial-gradient(ellipse at center, rgba(59,130,246,0.1) 0%, transparent 70%), var(--surface-card)",
          }}
        >
          <h2 style={{ marginBottom: "1rem" }}>
            Pronto para elevar o teu clube?
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "1.0625rem" }}>
            Começa hoje com 1 equipa grátis. Sem cartão de crédito.
          </p>
          <Link href="/register" className="btn btn-primary btn-lg">
            Criar o meu clube agora →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: "1px solid var(--surface-border)",
          padding: "2rem",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "0.875rem",
        }}
      >
        <div style={{ marginBottom: "0.5rem" }}>
          <span style={{ fontWeight: 800, color: "var(--text-secondary)" }}>CoachOS</span>
          {" "}© {new Date().getFullYear()} — Plataforma SaaS para Clubes de Futebol
        </div>
        <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center" }}>
          <Link href="/login" style={{ color: "var(--text-muted)" }}>Entrar</Link>
          <Link href="/register" style={{ color: "var(--text-muted)" }}>Registar</Link>
          <Link href="#precos" style={{ color: "var(--text-muted)" }}>Preços</Link>
        </div>
      </footer>
    </div>
  );
}
