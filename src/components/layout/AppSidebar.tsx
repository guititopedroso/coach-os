"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut as firebaseSignOut } from "firebase/auth";
import { auth as firebaseAuth } from "@/lib/firebase/client";
import { cn, getInitials, ROLE_LABELS } from "@/lib/utils";
import { useState } from "react";

type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  clubId?: string;
  globalRole?: string;
  staffDept?: string;
};

const CLUB_ADMIN_NAV = [
  {
    section: "Coordenação",
    items: [
      { href: "/clube", label: "Visão Global", icon: "🏛️" },
      { href: "/clube/epocas", label: "Épocas", icon: "📆" },
      { href: "/clube/equipas", label: "Equipas", icon: "👥" },
      { href: "/clube/acessos", label: "Acessos & Staff", icon: "🔑" },
      { href: "/clube/subscricao", label: "Subscrição", icon: "💳" },
    ],
  },
];

const COACH_NAV = [
  {
    section: "Equipa Técnica",
    items: [
      { href: "/equipa", label: "Home", icon: "🏠" },
      { href: "/equipa/mes", label: "Mês", icon: "📅" },
      { href: "/equipa/semana", label: "Semana", icon: "📋" },
      { href: "/equipa/macrociclo", label: "Macrociclo", icon: "📈" },
      { href: "/equipa/plantel", label: "Plantel", icon: "👥" },
      { href: "/equipa/questionarios", label: "Questionários", icon: "📊" },
      { href: "/equipa/presencas", label: "Presenças", icon: "✅" },
      { href: "/equipa/clips", label: "Clips & Análise", icon: "🎬" },
    ],
  },
];

const PLAYER_NAV = [
  {
    section: "Jogador",
    items: [
      { href: "/jogador", label: "Home", icon: "🏠" },
      { href: "/jogador/planeamento", label: "Planeamento", icon: "📅" },
      { href: "/jogador/questionarios", label: "Questionários", icon: "📊" },
      { href: "/jogador/feedback", label: "Feedback", icon: "💬" },
    ],
  },
];

const MEDICAL_NAV = [
  {
    section: "Departamento Médico",
    items: [
      { href: "/medico", label: "Overview", icon: "🏥" },
      { href: "/medico/lesoes", label: "Lesões", icon: "🩹" },
      { href: "/medico/sessoes", label: "Sessões", icon: "💊" },
      { href: "/medico/historico", label: "Histórico", icon: "📋" },
    ],
  },
];

const UDIA_NAV = [
  {
    section: "UDIA",
    items: [
      { href: "/udia", label: "Sessões & Feedback", icon: "🎯" },
    ],
  },
];

const GR_NAV = [
  {
    section: "Treinador GR's",
    items: [
      { href: "/gr", label: "Home", icon: "🥅" },
      { href: "/gr/agenda", label: "Agenda Semanal", icon: "📅" },
      { href: "/gr/feedback", label: "Feedback & Clips", icon: "🎬" },
    ],
  },
];

function getNavByRole(user: User) {
  switch (user.globalRole) {
    case "super_admin":
    case "club_admin":
      return CLUB_ADMIN_NAV;
    case "player":
      return PLAYER_NAV;
    case "staff":
      if (user.staffDept === "medical") return MEDICAL_NAV;
      if (user.staffDept === "udia") return UDIA_NAV;
      if (user.staffDept === "gr_coach") return GR_NAV;
      return COACH_NAV;
    default:
      return COACH_NAV;
  }
}

function getRoleLabel(user: User): string {
  if (user.globalRole === "player") return "Jogador";
  if (user.globalRole === "club_admin") return "Coordenação";
  if (user.staffDept) {
    const map: Record<string, string> = {
      medical: "Dep. Médico",
      udia: "UDIA",
      gr_coach: "Treinador GR's",
    };
    return map[user.staffDept] || "Staff";
  }
  return "Equipa Técnica";
}

export default function AppSidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const navGroups = getNavByRole(user);

  return (
    <aside className="sidebar" style={{ width: collapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)" }}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, var(--brand-600), var(--brand-400))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1rem",
            fontWeight: 800,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          C
        </div>
        {!collapsed && (
          <span style={{ fontSize: "1.0625rem", fontWeight: 800, color: "var(--text-primary)" }}>
            Coach<span style={{ color: "var(--brand-400)" }}>OS</span>
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            marginLeft: "auto",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            padding: "0.25rem",
            borderRadius: 4,
            fontSize: "0.875rem",
          }}
          title={collapsed ? "Expandir" : "Colapsar"}
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navGroups.map((group) => (
          <div key={group.section}>
            {!collapsed && (
              <div className="nav-section-title">{group.section}</div>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn("nav-item", isActive && "active")}
                  title={collapsed ? item.label : undefined}
                  style={collapsed ? { justifyContent: "center" } : undefined}
                >
                  <span style={{ fontSize: "1.125rem", flexShrink: 0 }}>{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div
        style={{
          borderTop: "1px solid var(--surface-border)",
          padding: "1rem 0.75rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "0.75rem",
          }}
        >
          <div className="avatar">
            {getInitials(user.name || user.email || "U")}
          </div>
          {!collapsed && (
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.name}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {getRoleLabel(user)}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={async () => {
            await firebaseSignOut(firebaseAuth);
            document.cookie = "__session=; path=/; max-age=0";
            window.location.href = "/login";
          }}
          className="btn btn-ghost btn-sm"
          style={{ width: "100%", justifyContent: collapsed ? "center" : "flex-start" }}
        >
          <span>🚪</span>
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}
