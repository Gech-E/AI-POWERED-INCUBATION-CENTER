"use client";
import { useEffect, useState } from "react";
import { getIdeas, getInvestors, requestMatch } from "@/lib/api";

type IdeaLite = { id: string; title: string };

export default function InvestorsPage() {
  const [investors, setInvestors] = useState<Record<string, unknown>[]>([]);
  const [ideas, setIdeas] = useState<IdeaLite[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState<Record<string, unknown> | null>(null);
  const [selectedIdea, setSelectedIdea] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getInvestors().then(setInvestors).catch(() => {
      setInvestors([
        { id: "1", full_name: "Haile Gebrselassie Ventures", investment_focus: ["AgriTech", "CleanTech"], fund_name: "HG Innovation Fund", preferred_stage: "seed", min_investment: 10000, max_investment: 100000 },
        { id: "2", full_name: "Tigray Angels Network", investment_focus: ["FinTech", "EdTech", "HealthTech"], fund_name: "TAN Fund", preferred_stage: "ideation", min_investment: 5000, max_investment: 50000 },
        { id: "3", full_name: "Ethiopian Innovation Capital", investment_focus: ["AI/ML", "SaaS", "E-Commerce"], fund_name: "EIC Ventures", preferred_stage: "seed", min_investment: 25000, max_investment: 250000 },
      ]);
    }).finally(() => setLoading(false));

    getIdeas()
      .then((rows) => setIdeas((rows || []).map((r: any) => ({ id: String(r.id), title: String(r.title) }))))
      .catch(() => setIdeas([]));
  }, []);

  function openConnect(inv: Record<string, unknown>) {
    setSelectedInvestor(inv);
    setOpen(true);
    setError("");
    setSuccess("");
    setSelectedIdea("");
    setMessage("");
  }

  async function submitConnect() {
    if (!selectedInvestor?.user_id || !selectedIdea) return;
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await requestMatch({
        idea_id: selectedIdea,
        matched_user_id: String(selectedInvestor.user_id),
        match_type: "investor",
        message: message.trim() || `Hello ${String(selectedInvestor.full_name || "")}, I’d like to connect about my startup idea.`,
      });
      setSuccess("Connection request sent.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div style={{ textAlign: "center", padding: "4rem", color: "var(--clr-muted)" }}>Loading investors…</div>;

  return (
    <div>
      <h1 className="section-title"> Investor Portal</h1>
      <p style={{ color: "var(--clr-muted)", marginTop: "-0.5rem" }}>
        Connect with investors by sending a request tied to one of your startup ideas.
      </p>
      <div className="grid-cards">
        {investors.map((inv) => (
          <div key={String(inv.id)} className="card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, var(--clr-warn), #ef4444)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 700, flexShrink: 0 }}>
                {String(inv.full_name).charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>{String(inv.full_name)}</h3>
                {inv.fund_name ? <p style={{ color: "var(--clr-muted)", fontSize: "0.8rem", margin: 0 }}>{String(inv.fund_name)}</p> : null}
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
              {(inv.investment_focus as string[] || []).map((f) => <span key={f} className="tag">{f}</span>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.85rem" }}>
              <div style={{ padding: "0.5rem", background: "var(--clr-surface)", borderRadius: "var(--radius-sm)" }}>
                <div style={{ color: "var(--clr-muted)", fontSize: "0.75rem" }}>Investment Range</div>
                <div style={{ fontWeight: 600 }}>
                  {inv.min_investment ? `$${Number(inv.min_investment).toLocaleString()}` : "—"} – {inv.max_investment ? `$${Number(inv.max_investment).toLocaleString()}` : "—"}
                </div>
              </div>
              <div style={{ padding: "0.5rem", background: "var(--clr-surface)", borderRadius: "var(--radius-sm)" }}>
                <div style={{ color: "var(--clr-muted)", fontSize: "0.75rem" }}>Preferred Stage</div>
                <div style={{ fontWeight: 600, textTransform: "capitalize" }}>{String(inv.preferred_stage || "Any")}</div>
              </div>
            </div>
            <button className="btn btn-outline btn-sm" style={{ marginTop: "auto" }} onClick={() => openConnect(inv)}>
              Connect
            </button>
          </div>
        ))}
      </div>

      {open && selectedInvestor && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onMouseDown={() => setOpen(false)}
        >
          <div
            className="glass"
            style={{ width: "min(760px, 100%)", borderRadius: "var(--radius-lg)", padding: "1rem" }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>Connect with investor</div>
                <div style={{ color: "var(--clr-muted)", fontSize: "0.85rem" }}>
                  Investor: <strong>{String(selectedInvestor.full_name)}</strong>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>

            {error && (
              <div style={{ padding: "0.6rem 0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.08)", color: "var(--clr-danger)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ padding: "0.6rem 0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid rgba(6,214,160,0.35)", background: "rgba(6,214,160,0.08)", color: "var(--clr-accent)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                {success}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label className="label">Select idea</label>
                <select className="select" value={selectedIdea} onChange={(e) => setSelectedIdea(e.target.value)} disabled={submitting}>
                  <option value="">Choose an idea…</option>
                  {ideas.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.title}
                    </option>
                  ))}
                </select>
                <div style={{ marginTop: "0.5rem", color: "var(--clr-muted)", fontSize: "0.8rem" }}>
                  Don’t see your idea? <a href="/dashboard/submit-idea" style={{ color: "var(--clr-primary-l)" }}>Submit one</a>.
                </div>
              </div>
              <div>
                <label className="label">Message (optional)</label>
                <textarea className="textarea" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write a short intro and what you’re looking for…" disabled={submitting} />
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.85rem" }}>
              <button className="btn btn-primary" onClick={submitConnect} disabled={submitting || !selectedIdea} style={{ flex: 1 }}>
                {submitting ? "Sending…" : "Send request"}
              </button>
              <button className="btn btn-outline" onClick={() => setOpen(false)} disabled={submitting} style={{ flex: 1 }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
