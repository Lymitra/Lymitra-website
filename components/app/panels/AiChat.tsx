"use client";

import { useState, useRef, useEffect } from "react";
import { Zap, Send, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "agent";
  text: string;
}

const WELCOME: Message = {
  role: "agent",
  text: "Hey! I'm your Lymitra AI — I monitor your treasury, track exchange rates in real time, and help you optimize payroll timing. What would you like to know?",
};

const QUICK_ACTIONS = [
  "What's the best time to convert SOMI?",
  "How does payroll automation work?",
  "What fees does Somnia charge?",
  "Explain the staking yield",
];

export function AiChat() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || thinking) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setMessages((m) => [
        ...m,
        {
          role: "agent",
          text: "I'm processing your request on Somnia. The on-chain LLM agent will handle this in real time once your vault is active — coming very soon.",
        },
      ]);
    }, 1400);
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 58px - 4rem)" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.1rem", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div className="sec-ht">AI Chat</div>
            <div className="sec-hs">Powered by Somnia on-chain LLM · Always available</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(62,217,184,0.08)", border: "1px solid rgba(62,217,184,0.2)", borderRadius: 100, padding: "5px 12px", fontSize: 12, color: "#3ED9B8", fontWeight: 500 }}>
            <div className="ag-led" style={{ width: 6, height: 6 }} />
            Agent online
          </div>
        </div>
      </div>

      {/* Message area */}
      <div style={{
        flex: 1, overflowY: "auto", display: "flex", flexDirection: "column",
        gap: "1rem", padding: "1.25rem",
        background: "var(--bg2)", border: "1px solid var(--border)",
        borderRadius: "18px", marginBottom: "0.875rem",
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
            {m.role === "agent" && (
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "var(--accent-dim)", border: "1px solid var(--border2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--accent)", flexShrink: 0,
              }}>
                <Zap size={13} />
              </div>
            )}
            <div style={{
              maxWidth: "72%", padding: "11px 15px",
              borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
              background: m.role === "user" ? "var(--accent)" : "var(--bg3)",
              border: m.role === "user" ? "none" : "1px solid var(--border)",
              color: m.role === "user" ? "#fff" : "var(--text)",
              fontSize: "13.5px", lineHeight: 1.65,
            }}>
              {m.text}
            </div>
            {m.role === "user" && (
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "linear-gradient(135deg, #5B7FFF, #4A6FEF)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0,
              }}>
                U
              </div>
            )}
          </div>
        ))}

        {thinking && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--accent-dim)", border: "1px solid var(--border2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", flexShrink: 0 }}>
              <Zap size={13} />
            </div>
            <div style={{ padding: "12px 16px", borderRadius: "4px 16px 16px 16px", background: "var(--bg3)", border: "1px solid var(--border)", display: "flex", gap: 5, alignItems: "center" }}>
              {[0, 1, 2].map((n) => (
                <span key={n} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text3)", display: "inline-block", animation: `pulse 1.2s ease-in-out ${n * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick actions */}
      {messages.length <= 1 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "0.75rem", flexShrink: 0 }}>
          {QUICK_ACTIONS.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              style={{
                padding: "7px 13px", borderRadius: 9, border: "1px solid var(--border2)",
                background: "var(--bg3)", color: "var(--text2)", fontSize: 12.5,
                cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
                display: "inline-flex", alignItems: "center", gap: 5,
              }}
            >
              <Sparkles size={10} style={{ color: "var(--accent)" }} />
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "flex-end" }}>
        <textarea
          ref={inputRef}
          className="f-inp"
          style={{ flex: 1, resize: "none", height: 46, paddingTop: 12, paddingBottom: 12, lineHeight: 1.4 }}
          placeholder="Ask about your treasury, rates, payroll schedule…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
        />
        <button
          className="sub-btn"
          style={{ width: 46, height: 46, borderRadius: 11, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => send()}
          disabled={!input.trim() || thinking}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
