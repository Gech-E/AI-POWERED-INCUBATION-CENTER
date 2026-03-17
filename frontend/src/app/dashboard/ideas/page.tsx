"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getIdeas, evaluateIdea } from "@/lib/api";

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState<string | null>(null);

  useEffect(() => { loadIdeas(); }, []);

  async function loadIdeas() {
    try { setIdeas(await getIdeas()); }
    catch { setIdeas([]); }
    finally { setLoading(false); }
  }

  async function handleEvaluate(id: string) {
    setEvaluating(id);
    try {
      await evaluateIdea(id);
      await loadIdeas();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Evaluation failed");
    } finally {
      setEvaluating(null);
    }
  }

  if (loading) return <div style={{ textAlign: "center", padding: "4rem", color: "var(--clr-muted)" }}>Loading ideas…</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 className="section-title" style={{ margin: 0 }}> My Ideas</h1>
        <Link href="/dashboard/submit-idea" className="btn btn-primary">+ New Idea</Link>
      </div>

      {ideas.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "4rem" }}>
          <p style={{ fontSize: "3rem", marginBottom: "0.5rem" }}></p>
          <p style={{ fontWeight: 600, marginBottom: "0.25rem" }}>No ideas yet</p>
          <p style={{ color: "var(--clr-muted)", marginBottom: "1rem" }}>Submit your first startup idea to get AI evaluation</p>
          <Link href="/dashboard/submit-idea" className="btn btn-accent">Submit Idea</Link>
        </div>
      ) : (
        <div className="grid-cards">
          {ideas.map((idea) => (
            <div key={String(idea.id)} className="card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, flex: 1 }}>{String(idea.title)}</h3>
                {idea.ai_score != null && (
                  <span className={`score-badge ${Number(idea.ai_score) >= 70 ? "score-high" : Number(idea.ai_score) >= 40 ? "score-mid" : "score-low"}`}>
                    {String(idea.ai_score)}
                  </span>
                )}
              </div>
              <p style={{ color: "var(--clr-muted)", fontSize: "0.85rem", margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {String(idea.problem_statement)}
              </p>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                <span className="tag">{String(idea.status)}</span>
                {idea.category ? <span className="tag">{String(idea.category)}</span> : null}
              </div>

              {/* AI score breakdown */}
              {idea.ai_score != null && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.35rem", fontSize: "0.8rem" }}>
                  {[
                    { label: "Market", val: idea.market_potential_score },
                    { label: "Technical", val: idea.technical_feasibility_score },
                    { label: "Innovation", val: idea.innovation_score },
                    { label: "Team", val: idea.team_capability_score },
                  ].map((s) => (
                    <div key={s.label} style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0.5rem", background: "var(--clr-surface)", borderRadius: "var(--radius-sm)" }}>
                      <span style={{ color: "var(--clr-muted)" }}>{s.label}</span>
                      <span style={{ fontWeight: 600 }}>{s.val != null ? String(s.val) : "—"}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
                {String(idea.status) === "submitted" && (
                  <button onClick={() => handleEvaluate(String(idea.id))} className="btn btn-accent btn-sm" disabled={evaluating === String(idea.id)} style={{ flex: 1 }}>
                    {evaluating === String(idea.id) ? "Evaluating…" : " AI Evaluate"}
                  </button>
                )}
                <Link href={`/dashboard/ideas/${String(idea.id)}`} className="btn btn-outline btn-sm" style={{ flex: 1, textAlign: "center" }}>
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
