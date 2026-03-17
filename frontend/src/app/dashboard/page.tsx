"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getDashboardStats } from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    getDashboardStats().then(setStats).catch(() => {
      // Demo fallback data when API not connected
      setStats({
        total_ideas: 12, evaluated_ideas: 8, incubating_ideas: 3,
        total_mentors: 24, total_investors: 15, total_matches: 42,
        avg_ai_score: 67.5,
        recent_ideas: [
          { id: "1", title: "AgriTech Supply Chain", status: "evaluated", ai_score: 78, created_at: "2026-03-10" },
          { id: "2", title: "EdTech Language Platform", status: "submitted", ai_score: null, created_at: "2026-03-09" },
          { id: "3", title: "FinTech Mobile Banking", status: "incubating", ai_score: 85, created_at: "2026-03-08" },
        ],
      });
    });
  }, []);

  if (!stats) return <div style={{ textAlign: "center", padding: "4rem", color: "var(--clr-muted)" }}>Loading dashboard…</div>;

  const statCards = [
    { label: "Total Ideas", value: stats.total_ideas, icon: "💡", color: "var(--clr-primary-l)" },
    { label: "Evaluated", value: stats.evaluated_ideas, icon: "✅", color: "var(--clr-accent)" },
    { label: "Incubating", value: stats.incubating_ideas, icon: "🚀", color: "var(--clr-warn)" },
    { label: "Avg AI Score", value: stats.avg_ai_score ? `${stats.avg_ai_score}` : "—", icon: "🤖", color: "var(--clr-primary-l)" },
    { label: "Mentors", value: stats.total_mentors, icon: "👨‍🏫", color: "var(--clr-accent)" },
    { label: "Investors", value: stats.total_investors, icon: "💰", color: "var(--clr-warn)" },
  ];

  const recentIdeas = (stats.recent_ideas || []) as Array<Record<string, unknown>>;

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="section-title">📊 Overview</h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
          {statCards.map((s) => (
            <div key={s.label} className="card stat-card">
              <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>{s.icon}</div>
              <div className="stat-value" style={{ color: s.color }}>{String(s.value)}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Recent Ideas */}
        <div className="card" style={{ gridColumn: "span 2" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Recent Ideas</h2>
            <Link href="/dashboard/ideas" className="btn btn-outline btn-sm">View All</Link>
          </div>
          {recentIdeas.length === 0 ? (
            <p style={{ color: "var(--clr-muted)", textAlign: "center", padding: "2rem" }}>
              No ideas yet. <Link href="/dashboard/submit-idea" style={{ color: "var(--clr-primary-l)" }}>Submit your first idea!</Link>
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {recentIdeas.map((idea) => (
                <div key={String(idea.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", background: "var(--clr-surface)", borderRadius: "var(--radius-sm)", border: "1px solid var(--clr-border)" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{String(idea.title)}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--clr-muted)" }}>{String(idea.created_at)}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span className="tag">{String(idea.status)}</span>
                    {idea.ai_score != null && (
                      <span className={`score-badge ${Number(idea.ai_score) >= 70 ? "score-high" : Number(idea.ai_score) >= 40 ? "score-mid" : "score-low"}`}>
                        {String(idea.ai_score)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="card">
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>🎯 Quick Actions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <Link href="/dashboard/submit-idea" className="btn btn-primary" style={{ width: "100%" }}>💡 Submit New Idea</Link>
            <Link href="/dashboard/mentors" className="btn btn-outline" style={{ width: "100%" }}>👨‍🏫 Browse Mentors</Link>
            <Link href="/dashboard/networking" className="btn btn-outline" style={{ width: "100%" }}>🔗 AI Matchmaking</Link>
          </div>
        </div>

        {/* Platform tips */}
        <div className="card">
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>💡 Tips</h2>
          <ul style={{ color: "var(--clr-muted)", fontSize: "0.85rem", paddingLeft: "1.25rem", margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <li>Write detailed problem statements for better AI scores</li>
            <li>Include team members to boost capability assessment</li>
            <li>Use the AI chatbot for business model guidance</li>
            <li>Track milestones to show investor-ready progress</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
