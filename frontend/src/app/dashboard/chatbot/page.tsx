"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { chatWithMentor, getIdeas, getUser } from "@/lib/api";

type IdeaLite = { id: string; title: string };

type Message = {
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
  ts: number;
};

const QUICK_PROMPTS = [
  { title: "Business model", text: "Help me create a business model for my idea using the Business Model Canvas." },
  { title: "MVP planning", text: "Help me plan an MVP in 2 weeks. What should I build first and how do I validate it?" },
  { title: "Pitch deck", text: "Help me prepare a pitch deck. What slides should I include and what should I say?" },
  { title: "Market validation", text: "Help me validate my market with interviews and a landing page. What questions should I ask?" },
];

function storageKey(ideaId?: string) {
  return `mu-hub:chat:${ideaId || "general"}`;
}

function safeParseMessages(raw: string | null): Message[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    if (!Array.isArray(v)) return [];
    return v
      .filter((m) => m && typeof m === "object")
      .map((m) => {
        const role: Message["role"] = (m as any).role === "assistant" ? "assistant" : "user";
        return {
          role,
          content: typeof (m as any).content === "string" ? (m as any).content : "",
          suggestions: Array.isArray((m as any).suggestions)
            ? (m as any).suggestions.filter((s: any) => typeof s === "string")
            : undefined,
          ts: typeof (m as any).ts === "number" ? (m as any).ts : Date.now(),
        };
      })
      .filter((m) => m.content.trim().length > 0);
  } catch {
    return [];
  }
}

export default function MentorChatbotPage() {
  const [ideas, setIdeas] = useState<IdeaLite[]>([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>("");

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  const greeting = useMemo(() => {
    const user = getUser();
    const name = user?.full_name ? String(user.full_name).split(" ")[0] : "there";
    return `Hi ${name}! I’m your AI startup mentor. Ask me anything about business models, MVP planning, pitch preparation, or market validation.`;
  }, []);

  useEffect(() => {
    getIdeas()
      .then((rows) => {
        const lite = (rows || []).map((r: any) => ({ id: String(r.id), title: String(r.title) }));
        setIdeas(lite);
      })
      .catch(() => setIdeas([]));
  }, []);

  useEffect(() => {
    const key = storageKey(selectedIdeaId || undefined);
    const cached = safeParseMessages(localStorage.getItem(key));
    if (cached.length > 0) {
      setMessages(cached);
      return;
    }
    setMessages([
      {
        role: "assistant",
        content: greeting,
        suggestions: ["Help me build a business model", "How should I plan my MVP?", "How do I validate my market?"],
        ts: Date.now(),
      },
    ]);
  }, [selectedIdeaId, greeting]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const key = storageKey(selectedIdeaId || undefined);
    localStorage.setItem(key, JSON.stringify(messages.slice(-60)));
  }, [messages, selectedIdeaId]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError("");
    const userMsg: Message = { role: "user", content: trimmed, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await chatWithMentor(trimmed, selectedIdeaId || undefined);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.reply, suggestions: res.suggestions, ts: Date.now() },
      ]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Chat failed");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I couldn’t reach the mentor service right now. Please try again in a moment.",
          ts: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    const key = storageKey(selectedIdeaId || undefined);
    localStorage.removeItem(key);
    setMessages([
      {
        role: "assistant",
        content: greeting,
        suggestions: ["Help me build a business model", "How should I plan my MVP?", "How do I prepare a pitch?"],
        ts: Date.now(),
      },
    ]);
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <h1 className="section-title" style={{ marginBottom: "0.25rem" }}>
            🤖 AI Mentor Chatbot
          </h1>
          <p style={{ color: "var(--clr-muted)", margin: 0 }}>
            Get 24/7 guidance on business models, MVP planning, pitch preparation, and market validation from our AI startup mentor.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Link href="/dashboard/ideas" className="btn btn-outline btn-sm">
            View my ideas
          </Link>
          <button className="btn btn-ghost btn-sm" onClick={clearChat}>
            Clear chat
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <label className="label">Idea context (optional)</label>
            <select className="select" value={selectedIdeaId} onChange={(e) => setSelectedIdeaId(e.target.value)}>
              <option value="">General startup guidance</option>
              {ideas.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.title}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {QUICK_PROMPTS.map((p) => (
              <button key={p.title} className="btn btn-outline btn-sm" onClick={() => send(p.text)} disabled={loading}>
                {p.title}
              </button>
            ))}
          </div>
        </div>
        {error ? (
          <div style={{ marginTop: "0.75rem", color: "var(--clr-danger)", fontSize: "0.85rem" }}>{error}</div>
        ) : null}
      </div>

      <div className="glass" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", display: "flex", flexDirection: "column", height: "calc(100vh - 260px)", minHeight: 520 }}>
        <div style={{ padding: "0.85rem 1rem", borderBottom: "1px solid var(--clr-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "1.2rem" }}>🤖</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>AI Startup Mentor</div>
              <div style={{ fontSize: "0.75rem", color: "var(--clr-accent)" }}>● Online</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <span className="tag">{selectedIdeaId ? "Idea context enabled" : "General guidance"}</span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {messages.map((m, i) => (
            <div key={`${m.ts}-${i}`}>
              <div
                style={{
                  maxWidth: "85%",
                  padding: "0.75rem 0.95rem",
                  borderRadius:
                    m.role === "user"
                      ? "var(--radius-md) var(--radius-md) 6px var(--radius-md)"
                      : "var(--radius-md) var(--radius-md) var(--radius-md) 6px",
                  background: m.role === "user" ? "var(--clr-primary)" : "var(--clr-surface)",
                  marginLeft: m.role === "user" ? "auto" : 0,
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  border: m.role === "assistant" ? "1px solid var(--clr-border)" : "none",
                }}
              >
                {m.content}
              </div>
              {m.role === "assistant" && m.suggestions?.length ? (
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                  {m.suggestions.slice(0, 6).map((s, j) => (
                    <button key={j} onClick={() => send(s)} className="btn btn-outline btn-sm" disabled={loading}>
                      {s}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ))}

          {loading ? (
            <div
              style={{
                padding: "0.6rem 0.85rem",
                background: "var(--clr-surface)",
                border: "1px solid var(--clr-border)",
                borderRadius: "var(--radius-md)",
                width: "fit-content",
                fontSize: "0.9rem",
                color: "var(--clr-muted)",
              }}
            >
              Thinking…
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>

        <div style={{ padding: "0.75rem", borderTop: "1px solid var(--clr-border)", display: "flex", gap: "0.5rem" }}>
          <input
            className="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
            placeholder="Ask your AI mentor…"
            disabled={loading}
            style={{ fontSize: "0.95rem" }}
          />
          <button onClick={() => send(input)} className="btn btn-primary" disabled={loading || !input.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

