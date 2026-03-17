"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { chatWithMentor } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hi! I'm your AI startup mentor. I can help you with business models, MVP planning, pitch preparation, and more. What would you like to work on?",
      suggestions: ["Help me build a business model", "How should I plan my MVP?", "How do I prepare a pitch?"],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send(text: string) {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await chatWithMentor(text);
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply, suggestions: res.suggestions }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm having trouble connecting right now. Please try again later.", suggestions: [] },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 100 }}>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "linear-gradient(135deg, var(--clr-primary), #8b5cf6)",
          border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.5rem", boxShadow: "0 4px 24px rgba(99,102,241,0.4)",
          transition: "transform 0.2s",
          transform: open ? "rotate(45deg)" : "none",
        }}
      >
        {open ? "✕" : "🤖"}
      </button>

      {/* Chat window */}
      {open && (
        <div className="glass animate-in" style={{
          position: "absolute", bottom: 70, right: 0, width: 380, height: 500,
          borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--clr-border)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.2rem" }}>🤖</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>AI Startup Mentor</div>
              <div style={{ fontSize: "0.7rem", color: "var(--clr-accent)" }}>● Online</div>
            </div>
            <Link
              href="/dashboard/chatbot"
              className="btn btn-ghost btn-sm"
              style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem", textDecoration: "none" }}
              onClick={() => setOpen(false)}
            >
              Full chat
            </Link>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {messages.map((m, i) => (
              <div key={i}>
                <div style={{
                  maxWidth: "85%",
                  padding: "0.6rem 0.85rem",
                  borderRadius: m.role === "user" ? "var(--radius-md) var(--radius-md) 4px var(--radius-md)" : "var(--radius-md) var(--radius-md) var(--radius-md) 4px",
                  background: m.role === "user" ? "var(--clr-primary)" : "var(--clr-surface)",
                  marginLeft: m.role === "user" ? "auto" : 0,
                  fontSize: "0.85rem",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                }}>
                  {m.content}
                </div>
                {m.suggestions && m.suggestions.length > 0 && (
                  <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", marginTop: "0.35rem" }}>
                    {m.suggestions.map((s, j) => (
                      <button key={j} onClick={() => send(s)} className="btn btn-outline btn-sm" style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem" }}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ padding: "0.5rem 0.75rem", background: "var(--clr-surface)", borderRadius: "var(--radius-md)", width: "fit-content", fontSize: "0.85rem", color: "var(--clr-muted)" }}>
                Thinking…
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "0.5rem", borderTop: "1px solid var(--clr-border)", display: "flex", gap: "0.4rem" }}>
            <input
              className="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Ask your AI mentor…"
              style={{ fontSize: "0.85rem" }}
            />
            <button onClick={() => send(input)} className="btn btn-primary btn-sm" disabled={loading || !input.trim()}>
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
