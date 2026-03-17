"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { evaluateIdea, submitIdea } from "@/lib/api";

type TeamMember = { name: string; role?: string; email?: string };

type IdeaResponse = {
  id: string;
  title: string;
  problem_statement: string;
  proposed_solution: string;
  target_market?: string | null;
  category?: string | null;
  tech_stack?: string[] | null;
  status?: string;
  ai_score?: number | null;
  ai_evaluation?: Record<string, unknown> | null;
};

type Evaluation = {
  overall_score?: number;
  market_potential?: number;
  technical_feasibility?: number;
  innovation_level?: number;
  team_capability?: number;
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
  summary?: string;
};

const CATEGORIES = [
  "AgriTech",
  "FinTech",
  "EdTech",
  "HealthTech",
  "CleanTech",
  "E-Commerce",
  "AI/ML",
  "IoT",
  "SaaS",
  "Other",
];

function asNumber(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return Number(v);
  return undefined;
}

function asStringArray(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const arr = v.filter((x) => typeof x === "string") as string[];
  return arr.length ? arr : undefined;
}

function normalizeEvaluation(raw: unknown): Evaluation | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  return {
    overall_score: asNumber(r.overall_score),
    market_potential: asNumber(r.market_potential),
    technical_feasibility: asNumber(r.technical_feasibility),
    innovation_level: asNumber(r.innovation_level),
    team_capability: asNumber(r.team_capability),
    strengths: asStringArray(r.strengths),
    weaknesses: asStringArray(r.weaknesses),
    suggestions: asStringArray(r.suggestions),
    summary: typeof r.summary === "string" ? r.summary : undefined,
  };
}

export function AIdeaEvaluation() {
  const [form, setForm] = useState({
    title: "",
    problem_statement: "",
    proposed_solution: "",
    target_market: "",
    category: "",
    tech_stack: "",
    team: [{ name: "", role: "", email: "" }] as TeamMember[],
  });

  const [step, setStep] = useState<"form" | "evaluating" | "result">("form");
  const [error, setError] = useState("");
  const [idea, setIdea] = useState<IdeaResponse | null>(null);

  const evaluation = useMemo(() => normalizeEvaluation(idea?.ai_evaluation), [idea?.ai_evaluation]);

  const set =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm({ ...form, [field]: e.target.value });

  function setTeamMember(idx: number, field: keyof TeamMember, value: string) {
    const team = [...form.team];
    team[idx] = { ...team[idx], [field]: value };
    setForm({ ...form, team });
  }

  function addMember() {
    setForm({ ...form, team: [...form.team, { name: "", role: "", email: "" }] });
  }

  function removeMember(idx: number) {
    setForm({ ...form, team: form.team.filter((_, i) => i !== idx) });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStep("evaluating");

    try {
      const payload = {
        title: form.title,
        problem_statement: form.problem_statement,
        proposed_solution: form.proposed_solution,
        target_market: form.target_market || undefined,
        category: form.category || undefined,
        tech_stack: form.tech_stack
          ? form.tech_stack
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
        team_members: form.team.filter((t) => t.name.trim()).length
          ? form.team.filter((t) => t.name.trim())
          : undefined,
      };

      const created = (await submitIdea(payload)) as IdeaResponse;
      const evaluated = (await evaluateIdea(String(created.id))) as IdeaResponse;
      setIdea(evaluated);
      setStep("result");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Evaluation failed");
      setStep("form");
    }
  }

  function reset() {
    setIdea(null);
    setError("");
    setStep("form");
    setForm({
      title: "",
      problem_statement: "",
      proposed_solution: "",
      target_market: "",
      category: "",
      tech_stack: "",
      team: [{ name: "", role: "", email: "" }],
    });
  }

  return (
    <div style={{ maxWidth: 920, margin: "0 auto" }}>
      <div style={{ marginBottom: "1rem" }}>
        <h1 className="section-title" style={{ marginBottom: "0.25rem" }}>
          🤖 AI Idea Evaluation
        </h1>
        <p style={{ color: "var(--clr-muted)", margin: 0 }}>
          Submit your startup idea and get instant AI-powered scoring across market potential, technical feasibility,
          innovation, and team capability.
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: "0.6rem 1rem",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "var(--radius-sm)",
            color: "var(--clr-danger)",
            fontSize: "0.85rem",
            marginBottom: "1rem",
          }}
        >
          {error}
        </div>
      )}

      {step !== "result" && (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="card">
            <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>📝 Idea Details</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label className="label" htmlFor="idea-title">
                  Title *
                </label>
                <input
                  id="idea-title"
                  className="input"
                  value={form.title}
                  onChange={set("title")}
                  placeholder="e.g., AI-Powered Crop Disease Detection"
                  required
                  minLength={5}
                  disabled={step === "evaluating"}
                />
              </div>
              <div>
                <label className="label" htmlFor="idea-problem">
                  Problem Statement *
                </label>
                <textarea
                  id="idea-problem"
                  className="textarea"
                  value={form.problem_statement}
                  onChange={set("problem_statement")}
                  placeholder="What specific problem does your idea solve? Describe the pain points…"
                  required
                  minLength={20}
                  disabled={step === "evaluating"}
                />
              </div>
              <div>
                <label className="label" htmlFor="idea-solution">
                  Proposed Solution *
                </label>
                <textarea
                  id="idea-solution"
                  className="textarea"
                  value={form.proposed_solution}
                  onChange={set("proposed_solution")}
                  placeholder="How does your solution address the problem? What makes it unique?"
                  required
                  minLength={20}
                  disabled={step === "evaluating"}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label className="label" htmlFor="idea-market">
                    Target Market
                  </label>
                  <textarea
                    id="idea-market"
                    className="textarea"
                    style={{ minHeight: 80 }}
                    value={form.target_market}
                    onChange={set("target_market")}
                    placeholder="Who are your customers? Market size?"
                    disabled={step === "evaluating"}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="idea-category">
                    Category
                  </label>
                  <select
                    id="idea-category"
                    className="select"
                    value={form.category}
                    onChange={set("category")}
                    disabled={step === "evaluating"}
                  >
                    <option value="">Select category…</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <div style={{ marginTop: "0.5rem" }}>
                    <label className="label" htmlFor="idea-tech">
                      Tech Stack
                    </label>
                    <input
                      id="idea-tech"
                      className="input"
                      value={form.tech_stack}
                      onChange={set("tech_stack")}
                      placeholder="React, Python, TensorFlow…"
                      disabled={step === "evaluating"}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>👥 Team Members</h2>
              <button type="button" onClick={addMember} className="btn btn-outline btn-sm" disabled={step === "evaluating"}>
                + Add
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {form.team.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr auto",
                    gap: "0.5rem",
                    alignItems: "end",
                  }}
                >
                  <div>
                    <label className="label">Name</label>
                    <input
                      className="input"
                      value={m.name}
                      onChange={(e) => setTeamMember(i, "name", e.target.value)}
                      placeholder="Name"
                      disabled={step === "evaluating"}
                    />
                  </div>
                  <div>
                    <label className="label">Role</label>
                    <input
                      className="input"
                      value={m.role ?? ""}
                      onChange={(e) => setTeamMember(i, "role", e.target.value)}
                      placeholder="Developer"
                      disabled={step === "evaluating"}
                    />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      className="input"
                      value={m.email ?? ""}
                      onChange={(e) => setTeamMember(i, "email", e.target.value)}
                      placeholder="email@mu.edu.et"
                      disabled={step === "evaluating"}
                    />
                  </div>
                  {form.team.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(i)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: "var(--clr-danger)" }}
                      disabled={step === "evaluating"}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-accent"
            disabled={step === "evaluating"}
            style={{ width: "100%", padding: "0.85rem" }}
          >
            {step === "evaluating" ? "Submitting + evaluating…" : "🚀 Submit Idea & Get AI Score"}
          </button>
        </form>
      )}

      {step === "result" && idea && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 0.35rem" }}>{idea.title}</h2>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {idea.status ? <span className="tag">{idea.status}</span> : null}
                {idea.category ? <span className="tag">{idea.category}</span> : null}
              </div>
            </div>
            {idea.ai_score != null ? (
              <div
                className={`score-badge ${
                  Number(idea.ai_score) >= 70 ? "score-high" : Number(idea.ai_score) >= 40 ? "score-mid" : "score-low"
                }`}
                style={{ width: "4rem", height: "4rem", fontSize: "1.2rem" }}
              >
                {String(idea.ai_score)}
              </div>
            ) : null}
          </div>

          <div style={{ marginTop: "1rem" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem" }}>📊 Score breakdown</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
              {[
                { label: "Market", score: evaluation?.market_potential, color: "#6366f1" },
                { label: "Technical", score: evaluation?.technical_feasibility, color: "#06d6a0" },
                { label: "Innovation", score: evaluation?.innovation_level, color: "#f59e0b" },
                { label: "Team", score: evaluation?.team_capability, color: "#8b5cf6" },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    textAlign: "center",
                    padding: "0.75rem",
                    background: "var(--clr-surface)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color }}>
                    {s.score != null ? String(s.score) : "—"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--clr-muted)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {evaluation?.summary ? (
            <p style={{ marginTop: "1rem", color: "var(--clr-muted)", fontSize: "0.9rem", fontStyle: "italic" }}>
              {evaluation.summary}
            </p>
          ) : null}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
            {evaluation?.strengths?.length ? (
              <div>
                <h4 style={{ color: "var(--clr-accent)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>✅ Strengths</h4>
                <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.85rem", color: "var(--clr-muted)" }}>
                  {evaluation.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {evaluation?.weaknesses?.length ? (
              <div>
                <h4 style={{ color: "var(--clr-danger)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>⚠️ Weaknesses</h4>
                <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.85rem", color: "var(--clr-muted)" }}>
                  {evaluation.weaknesses.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {evaluation?.suggestions?.length ? (
            <div style={{ marginTop: "1rem" }}>
              <h4 style={{ color: "var(--clr-primary-l)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>💡 Suggestions</h4>
              <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.85rem", color: "var(--clr-muted)" }}>
                {evaluation.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div style={{ display: "flex", gap: "0.6rem", marginTop: "1.25rem" }}>
            <button className="btn btn-outline" type="button" onClick={reset} style={{ flex: 1 }}>
              Evaluate another idea
            </button>
            <Link href={`/dashboard/ideas/${idea.id}`} className="btn btn-primary" style={{ flex: 1, textAlign: "center" }}>
              View full details
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

