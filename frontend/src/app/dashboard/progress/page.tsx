"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  completeMilestone,
  createMilestone,
  getIdeas,
  getMilestones,
  updateMilestone,
} from "@/lib/api";

type Stage = "ideation" | "validation" | "mvp" | "growth" | "scale";
const STAGES: { key: Stage; label: string; desc: string }[] = [
  { key: "ideation", label: "Ideation", desc: "Problem, user, and solution clarity" },
  { key: "validation", label: "Validation", desc: "Demand testing and early traction" },
  { key: "mvp", label: "MVP", desc: "Build, ship, and iterate fast" },
  { key: "growth", label: "Growth", desc: "Acquire users and prove unit economics" },
  { key: "scale", label: "Scale", desc: "Process, partnerships, expansion" },
];

type IdeaLite = { id: string; title: string; status?: string; ai_score?: number | null };

type Milestone = {
  id: string;
  idea_id: string;
  milestone: string;
  description?: string | null;
  stage: Stage | string;
  kpi_data?: Record<string, unknown> | null;
  is_completed: string;
  created_at?: string;
  completed_at?: string | null;
};

function toStage(v: unknown): Stage {
  const s = String(v || "ideation").toLowerCase();
  if (s === "validation" || s === "mvp" || s === "growth" || s === "scale") return s;
  return "ideation";
}

function isCompleted(m: Milestone) {
  return String(m.is_completed) === "true";
}

export default function ProgressDashboardPage() {
  const [ideas, setIdeas] = useState<IdeaLite[]>([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState("");

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [newMilestone, setNewMilestone] = useState({
    milestone: "",
    description: "",
    stage: "ideation" as Stage,
  });

  const [kpiDraft, setKpiDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    getIdeas()
      .then((rows) => {
        const lite = (rows || []).map((r: any) => ({
          id: String(r.id),
          title: String(r.title),
          status: r.status ? String(r.status) : undefined,
          ai_score: r.ai_score ?? null,
        }));
        setIdeas(lite);
        if (!selectedIdeaId && lite[0]?.id) setSelectedIdeaId(lite[0].id);
      })
      .catch(() => setIdeas([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadMilestones(ideaId: string) {
    if (!ideaId) return;
    setLoading(true);
    setError("");
    try {
      const rows = (await getMilestones(ideaId)) as any[];
      setMilestones(
        (rows || []).map((m) => ({
          id: String(m.id),
          idea_id: String(m.idea_id),
          milestone: String(m.milestone),
          description: m.description ?? null,
          stage: m.stage,
          kpi_data: m.kpi_data ?? null,
          is_completed: String(m.is_completed ?? "false"),
          created_at: m.created_at ? String(m.created_at) : undefined,
          completed_at: m.completed_at ? String(m.completed_at) : null,
        }))
      );
    } catch (err: unknown) {
      setMilestones([]);
      setError(err instanceof Error ? err.message : "Failed to load milestones");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (selectedIdeaId) loadMilestones(selectedIdeaId);
  }, [selectedIdeaId]);

  const stageStats = useMemo(() => {
    const byStage: Record<Stage, { total: number; done: number }> = {
      ideation: { total: 0, done: 0 },
      validation: { total: 0, done: 0 },
      mvp: { total: 0, done: 0 },
      growth: { total: 0, done: 0 },
      scale: { total: 0, done: 0 },
    };
    for (const m of milestones) {
      const st = toStage(m.stage);
      byStage[st].total += 1;
      if (isCompleted(m)) byStage[st].done += 1;
    }
    const total = milestones.length;
    const done = milestones.filter(isCompleted).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const currentStage =
      STAGES.find((s) => byStage[s.key].total > 0 && byStage[s.key].done < byStage[s.key].total)?.key ||
      (total ? (STAGES[STAGES.length - 1].key as Stage) : ("ideation" as Stage));
    return { byStage, total, done, pct, currentStage };
  }, [milestones]);

  async function addMilestone() {
    if (!selectedIdeaId || !newMilestone.milestone.trim()) return;
    setSaving("new");
    setError("");
    try {
      await createMilestone({
        idea_id: selectedIdeaId,
        milestone: newMilestone.milestone.trim(),
        description: newMilestone.description.trim() || undefined,
        stage: newMilestone.stage,
      });
      setNewMilestone({ milestone: "", description: "", stage: "ideation" });
      await loadMilestones(selectedIdeaId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add milestone");
    } finally {
      setSaving(null);
    }
  }

  async function markComplete(m: Milestone) {
    if (isCompleted(m)) return;
    setSaving(m.id);
    setError("");
    try {
      await completeMilestone(m.id);
      await loadMilestones(selectedIdeaId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to complete milestone");
    } finally {
      setSaving(null);
    }
  }

  async function saveKpis(m: Milestone) {
    setSaving(m.id);
    setError("");
    try {
      const existing = (m.kpi_data || {}) as Record<string, unknown>;
      const patch: Record<string, unknown> = { ...existing };
      for (const [k, v] of Object.entries(kpiDraft)) {
        const key = k.trim();
        if (!key) continue;
        const raw = v.trim();
        if (raw === "") {
          delete patch[key];
          continue;
        }
        const n = Number(raw);
        patch[key] = Number.isFinite(n) && raw !== "" ? n : raw;
      }
      await updateMilestone(m.id, { kpi_data: patch });
      setKpiDraft({});
      await loadMilestones(selectedIdeaId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save KPIs");
    } finally {
      setSaving(null);
    }
  }

  const selectedIdea = ideas.find((i) => i.id === selectedIdeaId);

  return (
    <div style={{ maxWidth: 1050, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <h1 className="section-title" style={{ marginBottom: "0.25rem" }}>
            📈 Progress Dashboard
          </h1>
          <p style={{ color: "var(--clr-muted)", margin: 0 }}>
            Track milestones, KPIs, and development stages as your startup grows from ideation to scale.
          </p>
        </div>
        {selectedIdeaId ? (
          <Link href={`/dashboard/ideas/${selectedIdeaId}`} className="btn btn-outline btn-sm">
            View idea
          </Link>
        ) : null}
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <label className="label">Select idea</label>
            <select className="select" value={selectedIdeaId} onChange={(e) => setSelectedIdeaId(e.target.value)}>
              <option value="">Choose an idea…</option>
              {ideas.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.title}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <span className="tag">Milestones: {stageStats.done}/{stageStats.total}</span>
            <span className="tag">Completion: {stageStats.pct}%</span>
            {selectedIdea?.status ? <span className="tag">Status: {selectedIdea.status}</span> : null}
            {selectedIdea?.ai_score != null ? <span className="tag">AI score: {String(selectedIdea.ai_score)}</span> : null}
          </div>
        </div>
        {error ? <div style={{ marginTop: "0.75rem", color: "var(--clr-danger)", fontSize: "0.85rem" }}>{error}</div> : null}
      </div>

      {/* Stage timeline */}
      <div className="card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "0.75rem" }}>🧭 Development stages</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.75rem" }}>
          {STAGES.map((s) => {
            const stats = stageStats.byStage[s.key];
            const active = stageStats.currentStage === s.key;
            const pct = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;
            return (
              <div
                key={s.key}
                style={{
                  padding: "0.75rem",
                  borderRadius: "var(--radius-sm)",
                  background: active ? "rgba(99,102,241,0.12)" : "var(--clr-surface)",
                  border: `1px solid ${active ? "rgba(99,102,241,0.35)" : "var(--clr-border)"}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", alignItems: "baseline" }}>
                  <div style={{ fontWeight: 800 }}>{s.label}</div>
                  <div className="tag" style={{ fontSize: "0.75rem" }}>
                    {stats.done}/{stats.total}
                  </div>
                </div>
                <div style={{ color: "var(--clr-muted)", fontSize: "0.8rem", marginTop: "0.25rem" }}>{s.desc}</div>
                <div style={{ marginTop: "0.6rem", height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 999 }}>
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      background: "linear-gradient(135deg, var(--clr-primary), #8b5cf6)",
                      borderRadius: 999,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestones + KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div className="card">
          <h2 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "0.75rem" }}>📋 Milestones</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div>
              <label className="label">Milestone</label>
              <input
                className="input"
                value={newMilestone.milestone}
                onChange={(e) => setNewMilestone({ ...newMilestone, milestone: e.target.value })}
                placeholder="e.g., Interview 15 target users"
                disabled={!selectedIdeaId || saving === "new"}
              />
              <div style={{ marginTop: "0.5rem" }}>
                <label className="label">Description (optional)</label>
                <input
                  className="input"
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                  placeholder="What does success look like?"
                  disabled={!selectedIdeaId || saving === "new"}
                />
              </div>
            </div>
            <div>
              <label className="label">Stage</label>
              <select
                className="select"
                value={newMilestone.stage}
                onChange={(e) => setNewMilestone({ ...newMilestone, stage: toStage(e.target.value) })}
                disabled={!selectedIdeaId || saving === "new"}
              >
                {STAGES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
              <button
                onClick={addMilestone}
                className="btn btn-primary"
                disabled={!selectedIdeaId || saving === "new" || !newMilestone.milestone.trim()}
                style={{ width: "100%", marginTop: "0.65rem" }}
              >
                {saving === "new" ? "Adding…" : "Add milestone"}
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--clr-muted)" }}>Loading milestones…</div>
          ) : milestones.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--clr-muted)" }}>
              No milestones yet. Add your first milestone to start tracking progress.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {milestones.map((m) => {
                const done = isCompleted(m);
                const st = toStage(m.stage);
                return (
                  <div
                    key={m.id}
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      alignItems: "flex-start",
                      padding: "0.75rem",
                      background: "var(--clr-surface)",
                      border: "1px solid var(--clr-border)",
                      borderRadius: "var(--radius-sm)",
                      opacity: done ? 0.85 : 1,
                    }}
                  >
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => markComplete(m)}
                      disabled={done || saving === m.id}
                      style={{ padding: "0.25rem 0.4rem" }}
                      title={done ? "Completed" : "Mark complete"}
                    >
                      {done ? "✅" : "⬜"}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", alignItems: "baseline" }}>
                        <div style={{ fontWeight: 700, textDecoration: done ? "line-through" : "none" }}>{m.milestone}</div>
                        <span className="tag">{STAGES.find((s) => s.key === st)?.label || st}</span>
                      </div>
                      {m.description ? <div style={{ color: "var(--clr-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>{m.description}</div> : null}
                      {m.kpi_data && Object.keys(m.kpi_data).length ? (
                        <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                          {Object.entries(m.kpi_data).slice(0, 6).map(([k, v]) => (
                            <span key={k} className="tag">
                              {k}: {String(v)}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "0.75rem" }}>📌 KPI tracker</h2>
          <p style={{ color: "var(--clr-muted)", fontSize: "0.9rem", marginTop: 0 }}>
            Add or update KPIs per milestone (examples: users, signups, revenue, interviews, retention).
          </p>

          {milestones.length === 0 ? (
            <div style={{ color: "var(--clr-muted)", textAlign: "center", padding: "2rem" }}>Add milestones to track KPIs.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {milestones.slice(0, 6).map((m) => (
                <div key={m.id} style={{ padding: "0.75rem", border: "1px solid var(--clr-border)", borderRadius: "var(--radius-sm)", background: "var(--clr-surface)" }}>
                  <div style={{ fontWeight: 700, marginBottom: "0.5rem" }}>{m.milestone}</div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                    <div>
                      <label className="label">KPI key</label>
                      <input
                        className="input"
                        placeholder="e.g., users"
                        value={kpiDraft[`k:${m.id}`] || ""}
                        onChange={(e) => setKpiDraft((d) => ({ ...d, [`k:${m.id}`]: e.target.value }))}
                        disabled={saving === m.id}
                      />
                    </div>
                    <div>
                      <label className="label">Value</label>
                      <input
                        className="input"
                        placeholder="e.g., 120"
                        value={kpiDraft[`v:${m.id}`] || ""}
                        onChange={(e) => setKpiDraft((d) => ({ ...d, [`v:${m.id}`]: e.target.value }))}
                        disabled={saving === m.id}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem" }}>
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={saving === m.id || !(kpiDraft[`k:${m.id}`] || "").trim()}
                      onClick={() => {
                        const key = (kpiDraft[`k:${m.id}`] || "").trim();
                        const val = (kpiDraft[`v:${m.id}`] || "").trim();
                        setKpiDraft((d) => ({ ...d, [key]: val, [`k:${m.id}`]: "", [`v:${m.id}`]: "" }));
                      }}
                    >
                      Add to draft
                    </button>
                    <button className="btn btn-accent btn-sm" disabled={saving === m.id || Object.keys(kpiDraft).length === 0} onClick={() => saveKpis(m)}>
                      {saving === m.id ? "Saving…" : "Save KPIs"}
                    </button>
                  </div>

                  {m.kpi_data && Object.keys(m.kpi_data).length ? (
                    <div style={{ marginTop: "0.6rem", display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                      {Object.entries(m.kpi_data).slice(0, 8).map(([k, v]) => (
                        <span key={k} className="tag">
                          {k}: {String(v)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ marginTop: "0.6rem", color: "var(--clr-muted)", fontSize: "0.85rem" }}>No KPIs yet.</div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: "0.75rem", color: "var(--clr-muted)", fontSize: "0.8rem" }}>
            Tip: Start with 2–3 KPIs (e.g., interviews, signups, active users) and only add more once they drive decisions.
          </div>
        </div>
      </div>
    </div>
  );
}

