import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, fmt = "dd/MM/yyyy") {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, fmt, { locale: pt });
}

export function formatDateTime(date: string | Date) {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd/MM/yyyy HH:mm", { locale: pt });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export const EVENT_TYPE_LABELS: Record<string, string> = {
  training: "Treino",
  match: "Jogo",
  rest: "Folga",
  friendly: "Jogo de Treino",
  cup: "Taça",
  tournament: "Torneio",
  cryo: "Crioterapia",
  cohesion: "Coesão",
  stage: "Estágio",
};

export const EVENT_TYPE_COLORS: Record<string, string> = {
  training: "#3b82f6",
  match: "#10b981",
  rest: "#6b7280",
  friendly: "#8b5cf6",
  cup: "#f59e0b",
  tournament: "#ec4899",
  cryo: "#06b6d4",
  cohesion: "#f97316",
  stage: "#84cc16",
};

export const POSITION_LABELS: Record<string, string> = {
  goalkeeper: "Guarda-Redes",
  defender: "Defesa",
  midfielder: "Médio",
  forward: "Avançado",
};

export const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  club_admin: "Coordenação",
  head_coach: "Treinador Principal",
  assistant: "Treinador Adjunto",
  analyst: "Analista",
  fitness: "Preparador Físico",
  delegate: "Delegado",
  team_manager: "Team Manager",
  medical: "Dep. Médico",
  udia: "UDIA",
  gr_coach: "Treinador de GR's",
  player: "Jogador",
};
