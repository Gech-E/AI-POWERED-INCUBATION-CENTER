"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getIdea, evaluateIdea, getMilestones, createMilestone } from "@/lib/api";

export default function IdeaDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [idea, setIdea] = useState<Record<string, unknown> | null>(null);
  const [milestones, setMilestones] = useState<Record<string, unknown>[]>([]);
  const [evaluating, setEvaluating] = useState(false);
  const [newMilestone, setNewMilestone] = useState("");

  useEffect(() => {
    if (id) {
      getIdea(id).then(setIdea).catch(() => { });
      getMilestones(id).then(setMilestones).catch(() => { });
    }
  }, [id]);

  async function handleEvaluate() {
    setEvaluating(true);
    try { setIdea(await evaluateIdea(id)); } catch { /* */ }
    finally { setEvaluating(false); }
  }

  async function handleAddMilestone() {
    if (!newMilestone.trim()) return;
    try {
      await createMilestone({ idea_id: id, milestone: newMilestone });
      setNewMilestone("");
      setMilestones(await getMilestones(id));
    } catch { /* */ }
  }

  if (!idea) return <div style={{ textAlign: "center", padding: "4rem", color: "var(--clr-muted)" }}>Loading…</div>;

  const evaluation = idea.ai_evaluation as Record<string, unknown> | null;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <Link href="/dashboard/ideas" className="btn btn-ghost btn-sm" style={{ marginBottom: "1rem" }}>← Back to Ideas</Link>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 0.5rem" }}>{String(idea.title)}</h1>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <span className="tag">{String(idea.status)}</span>
              {idea.category ? <span className="tag">{String(idea.category)}</span> : null}
            </div>
          </div>
          {idea.ai_score != null && (
            <div className={`score-badge ${Number(idea.ai_score) >= 70 ? "score-high" : Number(idea.ai_score) >= 40 ? "score-mid" : "score-low"}`} style={{ width: "4rem", height: "4rem", fontSize: "1.2rem" }}>
              {String(idea.ai_score)}
            </div>
          )}
        </div>
        <div style={{ display: "grid", gap: "1rem" }}>
          <div><h3 style={{ fontSize: "0.85rem", color: "var(--clr-muted)", marginBottom: "0.25rem" }}>Problem Statement</h3><p style={{ margin: 0 }}>{String(idea.problem_statement)}</p></div>
          <div><h3 style={{ fontSize: "0.85rem", color: "var(--clr-muted)", marginBottom: "0.25rem" }}>Proposed Solution</h3><p style={{ margin: 0 }}>{String(idea.proposed_solution)}</p></div>
          {idea.target_market ? <div><h3 style={{ fontSize: "0.85rem", color: "var(--clr-muted)", marginBottom: "0.25rem" }}>Target Market</h3><p style={{ margin: 0 }}>{String(idea.target_market)}</p></div> : null}
        </div>
        {idea.tech_stack ? (
          <div style={{ marginTop: "1rem", display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
            {(idea.tech_stack as string[]).map((t) => <span key={t} className="tag">{t}</span>)}
          </div>
        ) : null}
        {String(idea.status) === "submitted" && (
          <button onClick={handleEvaluate} className="btn btn-accent" disabled={evaluating} style={{ marginTop: "1rem" }}>
            {evaluating ? "Evaluating…" : " Run AI Evaluation"}
          </button>
        )}
      </div>

      {/* AI Evaluation Results */}
      {evaluation && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>🤖 AI Evaluation Results</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem", marginBottom: "1rem" }}>
            {[
              { label: "Market", score: evaluation.market_potential, color: "#6366f1" },
              { label: "Technical", score: evaluation.technical_feasibility, color: "#06d6a0" },
              { label: "Innovation", score: evaluation.innovation_level, color: "#f59e0b" },
              { label: "Team", score: evaluation.team_capability, color: "#8b5cf6" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center", padding: "0.75rem", background: "var(--clr-surface)", borderRadius: "var(--radius-sm)" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color }}>{String(s.score)}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--clr-muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>
          {evaluation.summary ? <p style={{ color: "var(--clr-muted)", fontSize: "0.9rem", fontStyle: "italic" }}>{String(evaluation.summary)}</p> : null}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
            {evaluation.strengths ? (
              <div><h4 style={{ color: "var(--clr-accent)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>✅ Strengths</h4>
                <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.85rem", color: "var(--clr-muted)" }}>
                  {(evaluation.strengths as string[]).map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            ) : null}
            {evaluation.weaknesses ? (
              <div><h4 style={{ color: "var(--clr-danger)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>⚠️ Weaknesses</h4>
                <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.85rem", color: "var(--clr-muted)" }}>
                  {(evaluation.weaknesses as string[]).map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            ) : null}
          </div>
          {evaluation.suggestions ? (
            <div style={{ marginTop: "1rem" }}>
              <h4 style={{ color: "var(--clr-primary-l)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>💡 Suggestions</h4>
              <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.85rem", color: "var(--clr-muted)" }}>
                {(evaluation.suggestions as string[]).map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          ) : null}
        </div>
      )}

      {/* Milestones */}
      <div className="card">
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>📋 Milestones</h2>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <input className="input" value={newMilestone} onChange={(e) => setNewMilestone(e.target.value)} placeholder="Add a milestone…" style={{ flex: 1 }} />
          <button onClick={handleAddMilestone} className="btn btn-primary btn-sm">Add</button>
        </div>
        {milestones.length === 0 ? (
          <p style={{ color: "var(--clr-muted)", textAlign: "center", fontSize: "0.85rem" }}>No milestones yet. Add one to track progress.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {milestones.map((m) => (
              <div key={String(m.id)} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0.75rem", background: "var(--clr-surface)", borderRadius: "var(--radius-sm)" }}>
                <span>{String(m.is_completed) === "true" ? "✅" : "⬜"}</span>
                <span style={{ flex: 1, fontSize: "0.9rem" }}>{String(m.milestone)}</span>
                <span className="tag">{String(m.stage)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
