"use client";
import { useEffect, useState } from "react";
import { bookMentorSession, getIdeas, getMentors, getMentorSessions } from "@/lib/api";

type IdeaLite = { id: string; title: string };

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Record<string, unknown>[]>([]);
  const [ideas, setIdeas] = useState<IdeaLite[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Record<string, unknown> | null>(null);
  const [selectedIdea, setSelectedIdea] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [recentSessions, setRecentSessions] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    getMentors().then(setMentors).catch(() => {
      setMentors([
        { id: "1", full_name: "Dr. Abrham Teklu", expertise: ["AI/ML", "Data Science"], industries: ["HealthTech", "EdTech"], company: "MU Research Lab", job_title: "Senior Researcher", years_experience: 12, availability: "available", rating: 4.8, total_sessions: 45 },
        { id: "2", full_name: "Sara Gebremedhin", expertise: ["FinTech", "Mobile Development"], industries: ["FinTech", "E-Commerce"], company: "CBE Birr", job_title: "Tech Lead", years_experience: 8, availability: "available", rating: 4.6, total_sessions: 32 },
        { id: "3", full_name: "Yohannes Berhane", expertise: ["Marketing", "Business Strategy"], industries: ["AgriTech", "SaaS"], company: "Startup Incubator", job_title: "Director", years_experience: 15, availability: "busy", rating: 4.9, total_sessions: 78 },
      ]);
    }).finally(() => setLoading(false));

    getIdeas()
      .then((rows) => setIdeas((rows || []).map((r: any) => ({ id: String(r.id), title: String(r.title) }))))
      .catch(() => setIdeas([]));
  }, []);

  async function openBooking(m: Record<string, unknown>) {
    setSelectedMentor(m);
    setOpen(true);
    setError("");
    setSuccess("");
    setSelectedIdea("");
    setSessionDate("");
    setDuration(60);
    setNotes("");
    setRecentSessions([]);
  }

  async function loadSessions(ideaId: string) {
    if (!ideaId) return setRecentSessions([]);
    try {
      const s = await getMentorSessions(ideaId);
      setRecentSessions(s.slice(0, 5));
    } catch {
      setRecentSessions([]);
    }
  }

  async function submitBooking() {
    if (!selectedMentor?.id || !selectedIdea || !sessionDate) return;
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await bookMentorSession({
        mentor_id: String(selectedMentor.id),
        idea_id: selectedIdea,
        session_date: new Date(sessionDate).toISOString(),
        duration_minutes: duration,
        notes: notes.trim() || undefined,
      });
      setSuccess("Session booked successfully.");
      await loadSessions(selectedIdea);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div style={{ textAlign: "center", padding: "4rem", color: "var(--clr-muted)" }}>Loading mentors…</div>;

  return (
    <div>
      <h1 className="section-title"> Mentor Marketplace</h1>
      <p style={{ color: "var(--clr-muted)", marginTop: "-0.5rem" }}>
        Browse mentors and book sessions tied to a specific startup idea.
      </p>
      <div className="grid-cards">
        {mentors.map((m) => (
          <div key={String(m.id)} className="card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, var(--clr-primary), var(--clr-accent))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 700, flexShrink: 0 }}>
                {String(m.full_name).charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>{String(m.full_name)}</h3>
                <p style={{ color: "var(--clr-muted)", fontSize: "0.8rem", margin: 0 }}>{m.job_title ? `${m.job_title} at ${m.company}` : String(m.company || "")}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
              {(m.expertise as string[] || []).map((e) => <span key={e} className="tag">{e}</span>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", fontSize: "0.8rem" }}>
              <div style={{ textAlign: "center", padding: "0.4rem", background: "var(--clr-surface)", borderRadius: "var(--radius-sm)" }}>
                <div style={{ fontWeight: 700, color: "var(--clr-warn)" }}>⭐ {String(m.rating)}</div>
                <div style={{ color: "var(--clr-muted)", fontSize: "0.7rem" }}>Rating</div>
              </div>
              <div style={{ textAlign: "center", padding: "0.4rem", background: "var(--clr-surface)", borderRadius: "var(--radius-sm)" }}>
                <div style={{ fontWeight: 700 }}>{String(m.total_sessions)}</div>
                <div style={{ color: "var(--clr-muted)", fontSize: "0.7rem" }}>Sessions</div>
              </div>
              <div style={{ textAlign: "center", padding: "0.4rem", background: "var(--clr-surface)", borderRadius: "var(--radius-sm)" }}>
                <div style={{ fontWeight: 700 }}>{String(m.years_experience)}y</div>
                <div style={{ color: "var(--clr-muted)", fontSize: "0.7rem" }}>Experience</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
              <span className="tag" style={{ background: String(m.availability) === "available" ? "rgba(6,214,160,0.12)" : "rgba(245,158,11,0.12)", color: String(m.availability) === "available" ? "var(--clr-accent)" : "var(--clr-warn)" }}>
                {String(m.availability)}
              </span>
              <button className="btn btn-outline btn-sm" onClick={() => openBooking(m)} disabled={String(m.availability) === "unavailable"}>
                Book Session
              </button>
            </div>
          </div>
        ))}
      </div>

      {open && selectedMentor && (
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
            style={{ width: "min(760px, 100%)", borderRadius: "var(--radius-lg)", padding: "1rem", overflow: "hidden" }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>Book mentorship session</div>
                <div style={{ color: "var(--clr-muted)", fontSize: "0.85rem" }}>
                  Mentor: <strong>{String(selectedMentor.full_name)}</strong>
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
                <select
                  className="select"
                  value={selectedIdea}
                  onChange={async (e) => {
                    setSelectedIdea(e.target.value);
                    await loadSessions(e.target.value);
                  }}
                  disabled={submitting}
                >
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
                <label className="label">Date & time</label>
                <input
                  className="input"
                  type="datetime-local"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  disabled={submitting}
                />
                <div style={{ marginTop: "0.5rem" }}>
                  <label className="label">Duration (minutes)</label>
                  <select className="select" value={duration} onChange={(e) => setDuration(Number(e.target.value))} disabled={submitting}>
                    {[30, 45, 60, 90, 120].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "0.75rem" }}>
              <label className="label">Notes (optional)</label>
              <textarea className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What do you want to cover in this session?" disabled={submitting} />
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.85rem" }}>
              <button className="btn btn-primary" onClick={submitBooking} disabled={submitting || !selectedIdea || !sessionDate} style={{ flex: 1 }}>
                {submitting ? "Booking…" : "Book session"}
              </button>
              <button className="btn btn-outline" onClick={() => setOpen(false)} disabled={submitting} style={{ flex: 1 }}>
                Close
              </button>
            </div>

            {selectedIdea && (
              <div style={{ marginTop: "0.85rem" }}>
                <div style={{ fontWeight: 700, marginBottom: "0.4rem" }}>Recent sessions for this idea</div>
                {recentSessions.length === 0 ? (
                  <div style={{ color: "var(--clr-muted)", fontSize: "0.85rem" }}>No sessions yet.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    {recentSessions.map((s) => (
                      <div key={String(s.id)} style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", fontSize: "0.85rem", color: "var(--clr-muted)", padding: "0.4rem 0.5rem", background: "var(--clr-surface)", borderRadius: "var(--radius-sm)", border: "1px solid var(--clr-border)" }}>
                        <span>{String(s.mentor_name || "")}</span>
                        <span>{String(s.session_date)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
