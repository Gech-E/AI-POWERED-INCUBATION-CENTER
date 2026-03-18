"use client";
import Link from "next/link";

const FEATURES = [
  { icon: "", title: "AI Idea Evaluation", desc: "Submit your startup idea and get instant AI-powered scoring across market potential, technical feasibility, innovation, and team capability." },
  { icon: "", title: "AI Mentor Chatbot", desc: "Get 24/7 guidance on business models, MVP planning, pitch preparation, and market validation from our AI startup mentor." },
  { icon: "", title: "Smart Matchmaking", desc: "AI-powered matching connects you with the perfect mentors, investors, and industry partners based on your startup domain." },
  { icon: "", title: "Progress Dashboard", desc: "Track milestones, KPIs, and development stages as your startup grows from ideation to scale." },
  { icon: "", title: "Mentor Marketplace", desc: "Browse experienced mentors with expertise matching your startup's needs and book mentorship sessions." },
  { icon: "", title: "Investor Portal", desc: "Connect with investors actively looking for startups in your sector with compatible funding interests." },
];

const STEPS = [
  { num: "01", title: "Submit Your Idea", desc: "Describe your problem, solution, market, and team." },
  { num: "02", title: "AI Evaluates", desc: "NLP analysis scores viability across 4 dimensions." },
  { num: "03", title: "Get Matched", desc: "AI recommends mentors, investors, and resources." },
  { num: "04", title: "Build & Grow", desc: "Track progress with dashboards and mentor support." },
];

const PROGRAMS = [
  { title: "Ideation Sprint", desc: "Clarify problem/solution and craft a crisp value proposition.", meta: "2 weeks • Workshops" },
  { title: "Validation Lab", desc: "Customer interviews, landing page tests, early traction metrics.", meta: "4 weeks • Mentors" },
  { title: "MVP Studio", desc: "Ship an MVP with weekly reviews and milestone tracking.", meta: "6 weeks • Build" },
  { title: "Scale Readiness", desc: "Partnerships, fundraising prep, and operational foundations.", meta: "Ongoing • Growth" },
];

const SUCCESS_STORIES = [
  { name: "AgriVision", result: "Raised seed funding after 3 months in the program.", quote: "The AI evaluation + mentor sessions kept us focused on what mattered." },
  { name: "EduBridge", result: "Reached 10k users with structured milestone tracking.", quote: "The progress dashboard helped us hit weekly goals consistently." },
  { name: "MedLink", result: "Closed pilot partnerships using AI matchmaking.", quote: "We found the right partners faster than we expected." },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      {/*  Nav  */}
      <nav className="glass" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, padding: "0.75rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: "1.2rem", textDecoration: "none" }}>
          <span className="gradient-text">MU Innovation Hub</span>
        </Link>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Link href="/login" className="btn btn-ghost">Sign In</Link>
          <Link href="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </nav>

      {/*  Hero  */}
      <section style={{ padding: "8rem 2rem 4rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* bg glow */}
        <div style={{ position: "absolute", top: "-30%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="animate-in" style={{ maxWidth: 800, margin: "0 auto", position: "relative" }}>
          <span className="tag" style={{ marginBottom: "1rem", display: "inline-block" }}>🎓 Mekelle University</span>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: "1.25rem" }}>
            Transform Your Ideas Into<br />
            <span className="gradient-text">Successful Startups</span>
          </h1>
          <p style={{ fontSize: "1.15rem", color: "var(--clr-muted)", maxWidth: 600, margin: "0 auto 2rem" }}>
            AI-powered evaluation, smart mentorship matching, and structured guidance to take your innovation from concept to scale.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" className="btn btn-primary" style={{ padding: "0.85rem 2rem", fontSize: "1rem" }}>
              Start Your Journey
            </Link>
            <Link href="#features" className="btn btn-outline" style={{ padding: "0.85rem 2rem", fontSize: "1rem" }}>
              Explore Features
            </Link>
          </div>
        </div>
      </section>

      {/*  Stats  */}
      <section style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem" }}>
          {[
            { val: "500+", lbl: "Student Ideas" },
            { val: "85%", lbl: "AI Accuracy" },
            { val: "120+", lbl: "Mentors" },
            { val: "30+", lbl: "Funded Startups" },
          ].map((s) => (
            <div key={s.lbl} className="card stat-card">
              <div className="stat-value gradient-text">{s.val}</div>
              <div className="stat-label">{s.lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/*  Features  */}
      <section id="features" style={{ padding: "4rem 2rem", maxWidth: 1200, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          Everything You Need to <span className="gradient-text">Succeed</span>
        </h2>
        <p style={{ textAlign: "center", color: "var(--clr-muted)", marginBottom: "2.5rem" }}>
          Powered by AI to accelerate your entrepreneurial journey.
        </p>
        <div className="grid-cards">
          {FEATURES.map((f) => (
            <div key={f.title} className="card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <span style={{ fontSize: "2rem" }}>{f.icon}</span>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{f.title}</h3>
              <p style={{ color: "var(--clr-muted)", fontSize: "0.9rem", margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Programs */}
      <section id="programs" style={{ padding: "4rem 2rem", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>
            Programs that drive <span className="gradient-text">progress</span>
          </h2>
          <span className="tag">Workshops • Mentors • Execution</span>
        </div>
        <p style={{ color: "var(--clr-muted)", marginTop: "0.75rem", marginBottom: "2rem", maxWidth: 850 }}>
          Structured tracks built around real founder workflows: validate demand, ship an MVP, prove traction, and grow with measurable KPIs.
        </p>
        <div className="grid-cards">
          {PROGRAMS.map((p) => (
            <div key={p.title} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "baseline" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>{p.title}</h3>
                <span className="tag">{p.meta}</span>
              </div>
              <p style={{ margin: "0.65rem 0 0", color: "var(--clr-muted)" }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/*  How It Works  */}
      <section style={{ padding: "4rem 2rem", maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 800, marginBottom: "2.5rem" }}>
          How It <span className="gradient-text">Works</span>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
          {STEPS.map((s) => (
            <div key={s.num} className="card" style={{ textAlign: "center" }}>
              <div className="gradient-text" style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "0.5rem" }}>{s.num}</div>
              <h3 style={{ fontWeight: 700, marginBottom: "0.25rem" }}>{s.title}</h3>
              <p style={{ color: "var(--clr-muted)", fontSize: "0.85rem", margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mentors / Startups / AI Tools */}
      <section style={{ padding: "4rem 2rem", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "1.25rem", alignItems: "start" }}>
          <div className="card" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.10), rgba(6,214,160,0.06))", border: "1px solid rgba(99,102,241,0.18)" }}>
            <h2 style={{ fontSize: "1.7rem", fontWeight: 900, margin: "0 0 0.5rem" }}>
              Mentors, partners, investors — matched by <span className="gradient-text">fit</span>
            </h2>
            <p style={{ color: "var(--clr-muted)", margin: 0, maxWidth: 850 }}>
              Smart matchmaking uses your idea content and domain to recommend the best people to talk to next. Book sessions, send requests, and track outcomes.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", flexWrap: "wrap" }}>
              <Link href="/dashboard/networking" className="btn btn-primary">Open Matchmaking</Link>
              <Link href="/dashboard/mentors" className="btn btn-outline">Browse Mentors</Link>
              <Link href="/dashboard/investors" className="btn btn-outline">Investor Portal</Link>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: "1.05rem", fontWeight: 900, marginTop: 0 }}>AI Tools</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {[
                { t: "AI Idea Evaluation", d: "Get a score + concrete next actions." },
                { t: "AI Mentor Chatbot", d: "24/7 guidance with idea context." },
                { t: "Progress Dashboard", d: "Milestones + KPIs across stages." },
              ].map((x) => (
                <div key={x.t} style={{ padding: "0.65rem 0.75rem", borderRadius: "var(--radius-sm)", background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
                  <div style={{ fontWeight: 800 }}>{x.t}</div>
                  <div style={{ color: "var(--clr-muted)", fontSize: "0.85rem" }}>{x.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section id="success" style={{ padding: "4rem 2rem", maxWidth: 1200, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 800, marginBottom: "0.75rem" }}>
          Success stories that inspire <span className="gradient-text">momentum</span>
        </h2>
        <p style={{ textAlign: "center", color: "var(--clr-muted)", marginBottom: "2rem" }}>
          Results-focused support for emerging tech leaders.
        </p>
        <div className="grid-cards">
          {SUCCESS_STORIES.map((s) => (
            <div key={s.name} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "baseline" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900 }}>{s.name}</h3>
                <span className="tag">{s.result}</span>
              </div>
              <p style={{ margin: "0.75rem 0 0", color: "var(--clr-muted)" }}>&ldquo;{s.quote}&rdquo;</p>
            </div>
          ))}
        </div>
      </section>

      {/*  CTA  */}
      <section style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <div className="card" style={{ maxWidth: 700, margin: "0 auto", background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(6,214,160,0.08))", border: "1px solid rgba(99,102,241,0.2)" }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.75rem" }}>Ready to Build the Future?</h2>
          <p style={{ color: "var(--clr-muted)", marginBottom: "1.5rem" }}>Join Mekelle University&apos;s innovation ecosystem and turn your idea into reality.</p>
          <Link href="/register" className="btn btn-accent" style={{ padding: "0.85rem 2.5rem", fontSize: "1rem" }}>
            Submit Your Idea
          </Link>
        </div>
      </section>

      {/*  Footer  */}
      <footer style={{ padding: "2rem", textAlign: "center", borderTop: "1px solid var(--clr-border)", color: "var(--clr-muted)", fontSize: "0.85rem" }}>
        <p>© 2026 MU Innovation Hub — Mekelle University. Powered by AI.</p>
      </footer>
    </div>
  );
}
