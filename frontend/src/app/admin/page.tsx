"use client";
import { useEffect, useState } from "react";
import { getDashboardStats } from "@/lib/api";

export default function AdminPage() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    getDashboardStats().then(setStats).catch(() => {
      setStats({
        total_ideas: 156, evaluated_ideas: 112, incubating_ideas: 24,
        total_mentors: 42, total_investors: 18, total_matches: 89,
        avg_ai_score: 62.3,
        recent_ideas: [
          { id: "1", title: "Smart Irrigation System", status: "evaluated", ai_score: 82, created_at: "2026-03-10" },
          { id: "2", title: "TeleMedicine Platform", status: "incubating", ai_score: 91, created_at: "2026-03-09" },
          { id: "3", title: "University Logistics App", status: "submitted", ai_score: null, created_at: "2026-03-08" },
          { id: "4", title: "AI Study Assistant", status: "evaluated", ai_score: 74, created_at: "2026-03-07" },
          { id: "5", title: "Renewable Energy Tracker", status: "draft", ai_score: null, created_at: "2026-03-06" },
        ],
      });
    });
  }, []);

  if (!stats) return <div style={{ textAlign: "center", padding: "4rem", color: "var(--clr-muted)" }}>Loading…</div>;

  const recentIdeas = (stats.recent_ideas || []) as Array<Record<string, unknown>>;

  return (
    <div className="page-container" style={{ maxWidth: 1200 }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.25rem" }}>⚙️ Admin Dashboard</h1>
      <p style={{ color: "var(--clr-muted)", marginBottom: "2rem" }}>Platform-wide overview for administrators</p>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Total Ideas", value: stats.total_ideas, icon: "", color: "var(--clr-primary-l)" },
          { label: "Evaluated", value: stats.evaluated_ideas, icon: "", color: "var(--clr-accent)" },
          { label: "Incubating", value: stats.incubating_ideas, icon: "", color: "var(--clr-warn)" },
          { label: "Avg AI Score", value: stats.avg_ai_score || "—", icon: "", color: "var(--clr-primary-l)" },
          { label: "Mentors", value: stats.total_mentors, icon: "", color: "var(--clr-accent)" },
          { label: "Investors", value: stats.total_investors, icon: "", color: "var(--clr-warn)" },
          { label: "Matches", value: stats.total_matches, icon: "", color: "var(--clr-primary-l)" },
        ].map((s) => (
          <div key={s.label} className="card stat-card">
            <div style={{ fontSize: "1.3rem" }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color, fontSize: "1.75rem" }}>{String(s.value)}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* All Ideas table */}
      <div className="card">
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}> Recent Submissions</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--clr-border)" }}>
                <th style={{ textAlign: "left", padding: "0.6rem", fontWeight: 600, color: "var(--clr-muted)" }}>Title</th>
                <th style={{ textAlign: "left", padding: "0.6rem", fontWeight: 600, color: "var(--clr-muted)" }}>Status</th>
                <th style={{ textAlign: "center", padding: "0.6rem", fontWeight: 600, color: "var(--clr-muted)" }}>AI Score</th>
                <th style={{ textAlign: "right", padding: "0.6rem", fontWeight: 600, color: "var(--clr-muted)" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentIdeas.map((idea) => (
                <tr key={String(idea.id)} style={{ borderBottom: "1px solid var(--clr-border)" }}>
                  <td style={{ padding: "0.6rem", fontWeight: 500 }}>{String(idea.title)}</td>
                  <td style={{ padding: "0.6rem" }}>
                    <span className="tag">{String(idea.status)}</span>
                  </td>
                  <td style={{ padding: "0.6rem", textAlign: "center" }}>
                    {idea.ai_score != null ? (
                      <span className={`score-badge ${Number(idea.ai_score) >= 70 ? "score-high" : Number(idea.ai_score) >= 40 ? "score-mid" : "score-low"}`} style={{ width: "2.2rem", height: "2.2rem", fontSize: "0.75rem" }}>
                        {String(idea.ai_score)}
                      </span>
                    ) : "—"}
                  </td>
                  <td style={{ padding: "0.6rem", textAlign: "right", color: "var(--clr-muted)" }}>{String(idea.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
