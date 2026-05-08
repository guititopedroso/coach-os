"use client";

import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

type Event = {
  id: string;
  type: string;
  title: string;
  date: string;
  startTime?: string;
  opponent?: string;
};

type QResponse = {
  id: string;
  type: string;
  date: string;
  sequenceNumber?: number;
};

const PSR_QUESTIONS = [
  { key: "q1", label: "Como avaliarias a tua qualidade de sono?", type: "scale5", hint: "1 = Muito mau / 5 = Excelente" },
  { key: "q2", label: "Como te sentes fisicamente hoje?", type: "scale5", hint: "1 = Muito mal / 5 = Ótimo" },
  { key: "q3", label: "Como te sentes mentalmente/emocionalmente?", type: "scale5", hint: "1 = Muito mal / 5 = Ótimo" },
  { key: "q4", label: "Tens alguma dor ou desconforto muscular?", type: "yesno", hint: "" },
  { key: "q5", label: "Qual é o teu nível geral de energia?", type: "scale5", hint: "1 = Sem energia / 5 = Cheio de energia" },
];

const PSE_QUESTIONS = [
  { key: "q1", label: "Qual foi a intensidade percebida?", type: "borg", hint: "Escala Borg 1-10" },
  { key: "q2", label: "Quantos minutos participaste ativamente?", type: "number", hint: "ex: 90" },
  { key: "q3", label: "Sentiste algum desconforto físico específico?", type: "yesno", hint: "" },
  { key: "q4", label: "Se sim, em que zona corporal?", type: "text", hint: "ex: Joelho direito" },
  { key: "q5", label: "Como avalias o volume total da sessão?", type: "volume", hint: "" },
  { key: "q6", label: "Como te sentiste mentalmente durante a sessão?", type: "scale5", hint: "1 = Muito mal / 5 = Ótimo" },
];

const POST_MATCH_QUESTIONS = [
  { key: "q1", label: "Como avalias o teu desempenho individual?", type: "scale10", hint: "1 = Muito mau / 10 = Excelente" },
  { key: "q2", label: "O que correu bem no teu jogo?", type: "text", hint: "Descreve 1-2 aspetos positivos" },
  { key: "q3", label: "O que precisas de melhorar?", type: "text", hint: "Descreve 1-2 aspetos a trabalhar" },
  { key: "q4", label: "Como foi o desempenho coletivo da equipa?", type: "scale10", hint: "1 = Muito mau / 10 = Excelente" },
  { key: "q5", label: "Sentiste-te motivado durante o jogo?", type: "motivation", hint: "" },
  { key: "q6", label: "Algum comentário adicional?", type: "text", hint: "Opcional" },
];

function ScaleInput({ value, onChange, max = 5 }: { value: number | null; onChange: (v: number) => void; max?: number }) {
  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      {Array.from({ length: max }, (_, i) => i + 1).map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          style={{
            width: 44,
            height: 44,
            borderRadius: "var(--radius-md)",
            border: value === n ? "2px solid var(--brand-500)" : "1px solid var(--surface-border)",
            background: value === n ? "var(--brand-600)" : "var(--surface-2)",
            color: value === n ? "#fff" : "var(--text-secondary)",
            cursor: "pointer",
            fontWeight: value === n ? 700 : 400,
            fontSize: "0.9375rem",
            transition: "all 0.15s ease",
          }}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function YesNoInput({ value, onChange }: { value: string | null; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", gap: "0.75rem" }}>
      {["sim", "não"].map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          style={{
            padding: "0.5rem 1.5rem",
            borderRadius: "var(--radius-md)",
            border: value === opt ? "2px solid var(--brand-500)" : "1px solid var(--surface-border)",
            background: value === opt
              ? (opt === "sim" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)")
              : "var(--surface-2)",
            color: value === opt
              ? (opt === "sim" ? "#34d399" : "#f87171")
              : "var(--text-secondary)",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.875rem",
            textTransform: "capitalize",
            transition: "all 0.15s ease",
          }}
        >
          {opt === "sim" ? "✓ Sim" : "✗ Não"}
        </button>
      ))}
    </div>
  );
}

export default function JogadorQuestionariosPage() {
  const [playerInfo, setPlayerInfo] = useState<any>(null);
  const [todayEvents, setTodayEvents] = useState<Event[]>([]);
  const [myResponses, setMyResponses] = useState<QResponse[]>([]);
  const [activeForm, setActiveForm] = useState<"psr" | "pse" | "post_match" | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    // Buscar info do jogador
    fetch("/api/player/me").then(r => r.json()).then(setPlayerInfo);
  }, []);

  useEffect(() => {
    if (!playerInfo?.teamId) return;
    // Eventos de hoje
    fetch(`/api/events?teamId=${playerInfo.teamId}&from=${today}&to=${today}`)
      .then(r => r.json()).then(setTodayEvents);
    // Minhas respostas de hoje
    fetch(`/api/questionnaires?teamId=${playerInfo.teamId}&from=${today}&to=${today}&playerId=${playerInfo.id}`)
      .then(r => r.json()).then(setMyResponses);
  }, [playerInfo, today]);

  const alreadyAnsweredPSR = myResponses.some(r => r.type === "psr" && r.date === today);
  const psrCount = myResponses.filter(r => r.type === "psr").length + 1;

  function getQuestions(type: string) {
    if (type === "psr") return PSR_QUESTIONS;
    if (type === "pse") return PSE_QUESTIONS;
    return POST_MATCH_QUESTIONS;
  }

  function openForm(type: "psr" | "pse" | "post_match", event?: Event) {
    setActiveForm(type);
    setSelectedEvent(event || null);
    setAnswers({});
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!playerInfo || !activeForm) return;
    setSubmitting(true);

    await fetch("/api/questionnaires", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teamId: playerInfo.teamId,
        type: activeForm,
        eventId: selectedEvent?.id,
        date: today,
        answers,
      }),
    });

    setSubmitting(false);
    setSuccess(true);
    setTimeout(() => {
      setActiveForm(null);
      // Recarregar respostas
      fetch(`/api/questionnaires?teamId=${playerInfo.teamId}&from=${today}&to=${today}&playerId=${playerInfo.id}`)
        .then(r => r.json()).then(setMyResponses);
    }, 1500);
  }

  function renderQuestion(q: any, index: number) {
    const v = answers[q.key];
    return (
      <div key={q.key} style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--text-primary)" }}>
            {index + 1}. {q.label}
          </div>
          {q.hint && <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{q.hint}</div>}
        </div>

        {q.type === "scale5" && (
          <ScaleInput value={v} onChange={val => setAnswers({ ...answers, [q.key]: val })} max={5} />
        )}
        {q.type === "scale10" && (
          <ScaleInput value={v} onChange={val => setAnswers({ ...answers, [q.key]: val })} max={10} />
        )}
        {q.type === "borg" && (
          <ScaleInput value={v} onChange={val => setAnswers({ ...answers, [q.key]: val })} max={10} />
        )}
        {q.type === "yesno" && (
          <YesNoInput value={v} onChange={val => setAnswers({ ...answers, [q.key]: val })} />
        )}
        {q.type === "number" && (
          <input
            type="number"
            className="input"
            style={{ maxWidth: 120 }}
            value={v || ""}
            onChange={e => setAnswers({ ...answers, [q.key]: parseInt(e.target.value) || 0 })}
            min={0}
            max={180}
          />
        )}
        {q.type === "text" && (
          <textarea
            className="input"
            rows={2}
            value={v || ""}
            onChange={e => setAnswers({ ...answers, [q.key]: e.target.value })}
          />
        )}
        {q.type === "volume" && (
          <div style={{ display: "flex", gap: "0.75rem" }}>
            {[["low", "Pouco"], ["adequate", "Adequado"], ["high", "Demasiado"]].map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setAnswers({ ...answers, [q.key]: val })}
                className={`btn btn-sm ${v === val ? "btn-primary" : "btn-ghost"}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        {q.type === "motivation" && (
          <div style={{ display: "flex", gap: "0.75rem" }}>
            {[["yes", "Sim"], ["no", "Não"], ["partially", "Mais ou menos"]].map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setAnswers({ ...answers, [q.key]: val })}
                className={`btn btn-sm ${v === val ? "btn-primary" : "btn-ghost"}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // FORM VIEW
  if (activeForm) {
    const questions = getQuestions(activeForm);
    const labels: Record<string, string> = {
      psr: `PSR #${psrCount} — ${formatDate(today)}`,
      pse: `PSE — ${selectedEvent?.title || "Sessão"} — ${formatDate(today)}`,
      post_match: `Pós-Jogo — ${selectedEvent?.opponent ? `vs ${selectedEvent.opponent}` : selectedEvent?.title || ""} — ${formatDate(today)}`,
    };

    return (
      <div>
        <div className="page-header">
          <div>
            <button className="btn btn-ghost btn-sm" onClick={() => setActiveForm(null)} style={{ marginBottom: "0.25rem" }}>← Voltar</button>
            <h1 style={{ fontSize: "1.125rem", fontWeight: 700 }}>{labels[activeForm]}</h1>
          </div>
        </div>
        <div className="page-content" style={{ maxWidth: 600 }}>
          {success ? (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
              <h3>Resposta submetida!</h3>
              <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>Obrigado pela tua resposta.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {questions.map((q, i) => renderQuestion(q, i))}
              <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} style={{ marginTop: "0.5rem" }}>
                {submitting ? "A submeter..." : "Submeter resposta"}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // HOME VIEW
  return (
    <div>
      <div className="page-header">
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>📊 Questionários</h1>
      </div>
      <div className="page-content">
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* PSR diário */}
          <div className="card" style={{ borderLeft: "3px solid var(--brand-500)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.25rem" }}>
                  📊 PSR — Perceção Subjetiva de Recuperação
                </div>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                  Responder após acordar — diário — #{psrCount}
                </div>
              </div>
              {alreadyAnsweredPSR ? (
                <span className="badge badge-green">✅ Respondido hoje</span>
              ) : (
                <button className="btn btn-primary btn-sm" onClick={() => openForm("psr")}>
                  Responder agora
                </button>
              )}
            </div>
          </div>

          {/* PSE por sessão */}
          {todayEvents
            .filter(e => ["training", "match", "cup", "friendly"].includes(e.type))
            .map(ev => {
              const answered = myResponses.some(r => r.type === "pse" && r.date === today);
              return (
                <div key={ev.id} className="card" style={{ borderLeft: "3px solid #10b981" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.25rem" }}>
                        💪 PSE — {ev.title}
                      </div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                        {ev.startTime ? ev.startTime.slice(0, 5) + " · " : ""}Perceção Subjetiva de Esforço
                      </div>
                    </div>
                    {answered ? (
                      <span className="badge badge-green">✅ Respondido</span>
                    ) : (
                      <button className="btn btn-primary btn-sm" onClick={() => openForm("pse", ev)}>
                        Responder
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

          {/* Pós-jogo */}
          {todayEvents
            .filter(e => ["match", "cup"].includes(e.type))
            .map(ev => {
              const answered = myResponses.some(r => r.type === "post_match" && r.date === today);
              return (
                <div key={ev.id + "_pm"} className="card" style={{ borderLeft: "3px solid #f59e0b" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.25rem" }}>
                        🏆 Pós-Jogo — {ev.opponent ? `vs ${ev.opponent}` : ev.title}
                      </div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                        Autoavaliação pós-jogo
                      </div>
                    </div>
                    {answered ? (
                      <span className="badge badge-green">✅ Respondido</span>
                    ) : (
                      <button className="btn btn-primary btn-sm" onClick={() => openForm("post_match", ev)}>
                        Responder
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

          {todayEvents.length === 0 && (
            <div className="card" style={{ textAlign: "center", padding: "1.5rem", background: "rgba(107,114,128,0.1)", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              Sem treinos ou jogos planeados para hoje.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
