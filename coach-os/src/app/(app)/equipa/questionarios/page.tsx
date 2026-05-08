"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatDate } from "@/lib/utils";

type QResponse = {
  id: string;
  playerId: string;
  playerName?: string;
  type: string;
  date: string;
  sequenceNumber?: number;
  answers: Record<string, any>;
  submittedAt: string;
};

type Player = { id: string; name: string };

const TAB_LABELS: Record<string, string> = {
  psr: "PSR — Recuperação",
  pse: "PSE — Esforço",
  post_match: "Pós-Jogo",
};

const PSR_QUESTIONS = [
  { key: "q1", label: "Qualidade do sono", type: "scale5" },
  { key: "q2", label: "Sensação física", type: "scale5" },
  { key: "q3", label: "Estado mental/emocional", type: "scale5" },
  { key: "q4", label: "Dor ou desconforto muscular", type: "yesno" },
  { key: "q5", label: "Nível de energia geral", type: "scale5" },
];

const PSE_QUESTIONS = [
  { key: "q1", label: "Intensidade percebida (Borg 1-10)", type: "borg" },
  { key: "q2", label: "Minutos de participação ativa", type: "number" },
  { key: "q3", label: "Desconforto físico específico", type: "yesno" },
  { key: "q4", label: "Zona corporal afetada", type: "text" },
  { key: "q5", label: "Volume da sessão", type: "volume" },
  { key: "q6", label: "Estado mental durante a sessão", type: "scale5" },
];

const POST_MATCH_QUESTIONS = [
  { key: "q1", label: "Desempenho individual (1-10)", type: "scale10" },
  { key: "q2", label: "O que correu bem", type: "text" },
  { key: "q3", label: "O que precisas de melhorar", type: "text" },
  { key: "q4", label: "Desempenho coletivo da equipa (1-10)", type: "scale10" },
  { key: "q5", label: "Motivação durante o jogo", type: "motivation" },
  { key: "q6", label: "Comentário adicional", type: "text" },
];

const COLORS_5 = ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981"];
const COLORS_YN = ["#10b981", "#ef4444"];
const BORG_COLORS = ["#10b981", "#84cc16", "#f59e0b", "#f97316", "#ef4444"];

function getQuestionsForType(type: string) {
  if (type === "psr") return PSR_QUESTIONS;
  if (type === "pse") return PSE_QUESTIONS;
  return POST_MATCH_QUESTIONS;
}

function buildChartData(responses: QResponse[], qKey: string, qType: string) {
  const values = responses.map(r => r.answers[qKey]).filter(v => v !== undefined && v !== null);

  if (qType === "scale5") {
    const counts = [0, 0, 0, 0, 0];
    values.forEach(v => { if (v >= 1 && v <= 5) counts[v - 1]++; });
    return counts.map((c, i) => ({ name: String(i + 1) + " ★", value: c })).filter(d => d.value > 0);
  }

  if (qType === "scale10") {
    const buckets: Record<string, number> = {};
    values.forEach(v => {
      const k = String(v);
      buckets[k] = (buckets[k] || 0) + 1;
    });
    return Object.entries(buckets).map(([k, v]) => ({ name: k + "/10", value: v }));
  }

  if (qType === "yesno") {
    const yes = values.filter(v => v === true || v === "true" || v === "sim").length;
    const no = values.length - yes;
    return [{ name: "Sim", value: yes }, { name: "Não", value: no }].filter(d => d.value > 0);
  }

  if (qType === "borg") {
    const buckets: Record<string, number> = {};
    values.forEach(v => { const k = String(Math.round(v)); buckets[k] = (buckets[k] || 0) + 1; });
    return Object.entries(buckets)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([k, v]) => ({ name: k + "/10", value: v }));
  }

  if (qType === "volume") {
    const labels: Record<string, string> = { low: "Pouco", adequate: "Adequado", high: "Demasiado" };
    const counts: Record<string, number> = {};
    values.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
    return Object.entries(counts).map(([k, v]) => ({ name: labels[k] || k, value: v }));
  }

  if (qType === "motivation") {
    const labels: Record<string, string> = { yes: "Sim", no: "Não", partially: "Mais ou Menos" };
    const counts: Record<string, number> = {};
    values.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
    return Object.entries(counts).map(([k, v]) => ({ name: labels[k] || k, value: v }));
  }

  return [];
}

function exportToCSV(responses: QResponse[], type: string) {
  const questions = getQuestionsForType(type);
  const headers = ["Data", "Atleta", "Questionário #", ...questions.map(q => q.label)];
  const rows = responses.map(r => [
    r.date,
    r.playerName || r.playerId,
    r.sequenceNumber || "",
    ...questions.map(q => {
      const v = r.answers[q.key];
      if (v === undefined || v === null) return "";
      if (typeof v === "boolean") return v ? "Sim" : "Não";
      return String(v);
    }),
  ]);

  const csv = [headers, ...rows].map(row => row.map(c => `"${c}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `coachos_${type}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function QuestionariosPage() {
  const [tab, setTab] = useState<"psr" | "pse" | "post_match">("psr");
  const [responses, setResponses] = useState<QResponse[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split("T")[0]);

  useEffect(() => {
    fetch("/api/teams").then(r => r.json()).then(teams => {
      if (teams.length > 0) {
        setTeamId(teams[0].id);
        fetch(`/api/players?teamId=${teams[0].id}`).then(r => r.json()).then(setPlayers);
      }
    });
  }, []);

  useEffect(() => {
    if (!teamId) return;
    setLoading(true);
    fetch(`/api/questionnaires?teamId=${teamId}&type=${tab}&from=${dateFrom}&to=${dateTo}`)
      .then(r => r.json())
      .then(data => {
        setResponses(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [teamId, tab, dateFrom, dateTo]);

  const today = new Date().toISOString().split("T")[0];
  const todayResponses = responses.filter(r => r.date === today);
  const questions = getQuestionsForType(tab);
  const totalPlayers = players.length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>📊 Questionários</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
            Dashboards e análise de dados
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <input type="date" className="input" style={{ width: 140 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <span style={{ color: "var(--text-muted)" }}>→</span>
          <input type="date" className="input" style={{ width: 140 }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => exportToCSV(responses, tab)}
          >
            ⬇ Export CSV
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.375rem", marginBottom: "1.5rem" }}>
          {(Object.entries(TAB_LABELS) as [string, string][]).map(([key, label]) => (
            <button
              key={key}
              className={`btn btn-sm ${tab === key ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setTab(key as any)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Today's status */}
        <div
          className="card"
          style={{
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            padding: "1rem 1.5rem",
          }}
        >
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Hoje — {tab === "psr" ? "PSR" : tab === "pse" ? "PSE" : "Pós-Jogo"}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
              <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>
                {todayResponses.length}
              </span>
              <span style={{ color: "var(--text-muted)" }}>/ {totalPlayers} responderam</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: totalPlayers > 0 ? `${(todayResponses.length / totalPlayers) * 100}%` : "0%" }}
              />
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.375rem" }}>
              {totalPlayers - todayResponses.length > 0
                ? `${totalPlayers - todayResponses.length} pendentes`
                : "✅ Todos responderam!"}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total no período</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--brand-400)" }}>{responses.length}</div>
          </div>
        </div>

        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>A carregar dados...</p>
        ) : responses.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📊</div>
            <h3>Sem respostas no período selecionado</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
              Alarga o intervalo de datas ou aguarda que os atletas respondam.
            </p>
          </div>
        ) : (
          <>
            {/* Charts por pergunta */}
            <h2 style={{ fontSize: "1.0625rem", marginBottom: "1rem" }}>
              Distribuição por Pergunta
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              {questions
                .filter(q => !["text", "number"].includes(q.type))
                .map(q => {
                  const data = buildChartData(responses, q.key, q.type);
                  if (data.length === 0) return null;
                  const colorSet = q.type === "yesno" ? COLORS_YN : COLORS_5;

                  return (
                    <div key={q.key} className="card">
                      <h4 style={{ fontSize: "0.875rem", marginBottom: "1rem" }}>{q.label}</h4>
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {data.map((_, index) => (
                              <Cell
                                key={index}
                                fill={colorSet[index % colorSet.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              background: "var(--surface-2)",
                              border: "1px solid var(--surface-border)",
                              borderRadius: 8,
                              color: "var(--text-primary)",
                              fontSize: 12,
                            }}
                          />
                          <Legend
                            iconSize={8}
                            wrapperStyle={{ fontSize: 11, color: "var(--text-secondary)" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  );
                })}
            </div>

            {/* Respostas textuais */}
            {questions.some(q => q.type === "text") && (
              <div>
                <h2 style={{ fontSize: "1.0625rem", marginBottom: "1rem" }}>Respostas Textuais</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {questions
                    .filter(q => q.type === "text")
                    .map(q => (
                      <div key={q.key} className="card">
                        <h4 style={{ fontSize: "0.875rem", marginBottom: "0.875rem" }}>{q.label}</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: 240, overflowY: "auto" }}>
                          {responses
                            .filter(r => r.answers[q.key])
                            .map(r => (
                              <div key={r.id} style={{ display: "flex", gap: "0.75rem", padding: "0.625rem", background: "var(--surface-2)", borderRadius: "var(--radius-md)" }}>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap", width: 80 }}>
                                  {formatDate(r.date, "dd/MM")}
                                  <br />
                                  <span style={{ color: "var(--brand-400)" }}>{r.playerName || "Atleta"}</span>
                                </div>
                                <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                                  {String(r.answers[q.key])}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Tabela de pendentes de hoje */}
            {totalPlayers > todayResponses.length && tab === "psr" && (
              <div style={{ marginTop: "2rem" }}>
                <h2 style={{ fontSize: "1.0625rem", marginBottom: "1rem" }}>
                  ⏳ Pendentes Hoje ({totalPlayers - todayResponses.length})
                </h2>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  {players
                    .filter(p => !todayResponses.some(r => r.playerId === p.id))
                    .map(p => (
                      <span key={p.id} className="badge badge-yellow">
                        ⏳ {p.name}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
