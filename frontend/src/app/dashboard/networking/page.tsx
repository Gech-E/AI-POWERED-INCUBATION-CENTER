"use client";
import { useEffect, useState } from "react";
import { getMyMatches, getIdeas, getRecommendedMentors, getRecommendedInvestors, getRecommendedPartners } from "@/lib/api";

export default function NetworkingPage() {
  const [matches, setMatches] = useState<Record<string, unknown>[]>([]);
  const [ideas, setIdeas] = useState<Record<string, unknown>[]>([]);
  const [selectedIdea, setSelectedIdea] = useState("");
  const [mentorRecs, setMentorRecs] = useState<Record<string, unknown>[]>([]);
  const [investorRecs, setInvestorRecs] = useState<Record<string, unknown>[]>([]);
  const [partnerRecs, setPartnerRecs] = useState<Record<string, unknown>[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    getMyMatches().then(setMatches).catch(() => { });
    getIdeas().then(setIdeas).catch(() => { });
  }, []);

  async function handleRecommend() {
    if (!selectedIdea) return;
    setLoadingRecs(true);
    try {
      const [mentors, investors, partners] = await Promise.all([
        getRecommendedMentors(selectedIdea),
        getRecommendedInvestors(selectedIdea),
        getRecommendedPartners(selectedIdea),
      ]);
      setMentorRecs(mentors);
      setInvestorRecs(investors);
      setPartnerRecs(partners);
    } catch {
      setMentorRecs([]);
      setInvestorRecs([]);
      setPartnerRecs([]);
    } finally {
      setLoadingRecs(false);
    }
  }

  return (
    <div>
      <h1 className="section-title"> AI Networking Hub</h1>

      {/* AI Recommendation */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>🤖 AI-Powered Matching</h2>
        <p style={{ color: "var(--clr-muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>
          Select a startup idea to get AI-powered mentor, investor, and industry partner recommendations based on domain, technology, and fit.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "end" }}>
          <div style={{ flex: 1 }}>
            <label className="label">Select Idea</label>
            <select className="select" value={selectedIdea} onChange={(e) => setSelectedIdea(e.target.value)}>
              <option value="">Choose an idea…</option>
              {ideas.map((i) => <option key={String(i.id)} value={String(i.id)}>{String(i.title)}</option>)}
            </select>
          </div>
          <button onClick={handleRecommend} className="btn btn-accent" disabled={!selectedIdea || loadingRecs}>
            {loadingRecs ? "Finding matches…" : "🔍 Find Matches"}
          </button>
        </div>
      </div>

      {/* Recommendations */}
      {(mentorRecs.length > 0 || investorRecs.length > 0 || partnerRecs.length > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
          {/* Mentor Recs */}
          <div className="card">
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>👨‍🏫 Recommended Mentors</h3>
            {mentorRecs.map((m) => (
              <div key={String(m.id)} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0", borderBottom: "1px solid var(--clr-border)" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, var(--clr-primary), var(--clr-accent))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0 }}>
                  {String(m.full_name).charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{String(m.full_name)}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--clr-muted)" }}>{(m.expertise as string[] || []).join(", ")}</div>
                </div>
                <span className="score-badge score-high" style={{ width: "2.5rem", height: "2.5rem", fontSize: "0.8rem" }}>
                  {String(m.match_score)}%
                </span>
              </div>
            ))}
          </div>

          {/* Investor Recs */}
          <div className="card">
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>💰 Recommended Investors</h3>
            {investorRecs.map((inv) => (
              <div key={String(inv.id)} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0", borderBottom: "1px solid var(--clr-border)" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, var(--clr-warn), #ef4444)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0 }}>
                  {String(inv.full_name).charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{String(inv.full_name)}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--clr-muted)" }}>{(inv.investment_focus as string[] || []).join(", ")}</div>
                </div>
                <span className="score-badge score-high" style={{ width: "2.5rem", height: "2.5rem", fontSize: "0.8rem" }}>
                  {String(inv.match_score)}%
                </span>
              </div>
            ))}
          </div>

          {/* Partner Recs */}
          <div className="card">
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>🏭 Recommended Partners</h3>
            {partnerRecs.length === 0 ? (
              <p style={{ color: "var(--clr-muted)", fontSize: "0.85rem" }}>No partner recommendations yet.</p>
            ) : (
              partnerRecs.map((p) => (
                <div key={String(p.id)} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0", borderBottom: "1px solid var(--clr-border)" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #22c55e, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0 }}>
                    {String(p.full_name || "P").charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{String(p.full_name || "Partner")}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--clr-muted)" }}>
                      {p.organization ? String(p.organization) : (p.capabilities as string[] | undefined)?.slice?.(0, 3)?.join(", ") || ""}
                    </div>
                  </div>
                  <span className="score-badge score-high" style={{ width: "2.5rem", height: "2.5rem", fontSize: "0.8rem" }}>
                    {String(p.match_score)}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Existing Matches */}
      <div className="card">
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>📋 My Matches</h2>
        {matches.length === 0 ? (
          <p style={{ color: "var(--clr-muted)", textAlign: "center", padding: "2rem" }}>No matches yet. Use AI matching above to find connections.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {matches.map((m) => (
              <div key={String(m.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.65rem 0.75rem", background: "var(--clr-surface)", borderRadius: "var(--radius-sm)" }}>
                <div>
                  <span className="tag">{String(m.match_type)}</span>
                  <span style={{ marginLeft: "0.5rem", fontSize: "0.85rem" }}>{String(m.message || "")}</span>
                </div>
                <span className="tag" style={{ background: String(m.status) === "accepted" ? "rgba(6,214,160,0.12)" : "rgba(245,158,11,0.12)", color: String(m.status) === "accepted" ? "var(--clr-accent)" : "var(--clr-warn)" }}>
                  {String(m.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
