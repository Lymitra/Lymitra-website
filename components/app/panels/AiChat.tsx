"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, Play, Zap, TrendingUp, UserPlus, Gauge, BarChart2 } from "lucide-react";

interface Message {
  role: "user" | "agent";
  text: string;
}

const WELCOME: Message = {
  role: "agent",
  text: "I'm Lyra, your Lymitra AI. I know your vault, your agents, and how Somnia works. Ask me anything — or pick a question below to get started.",
};

const QUICK_CHIPS = [
  { label: "How do I run my first payroll?", Icon: Play        },
  { label: "How do agents activate?",         Icon: Zap         },
  { label: "What is SOMI staking?",           Icon: TrendingUp  },
  { label: "How do I add an employee?",       Icon: UserPlus    },
  { label: "Why is Somnia gas free?",         Icon: Gauge       },
  { label: "What is runway?",                 Icon: BarChart2   },
];

export function AiChat() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input,    setInput]    = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || thinking) return;
    setInput("");

    const next: Message[] = [...messages, { role: "user", text: msg }];
    setMessages(next);
    setThinking(true);

    try {
      const res  = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "agent", text: data.text }]);
    } catch {
      setMessages((m) => [...m, { role: "agent", text: "Connection issue — please try again." }]);
    } finally {
      setThinking(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const showChips = messages.length === 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100dvh - 52px - 5.75rem)" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent), #5B7FFF)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Bot size={17} color="#fff" />
          </div>
          <div>
            <div className="sec-ht" style={{ fontSize: 16 }}>Lyra</div>
            <div className="sec-hs">Lymitra AI · Somnia-native</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(62,217,184,0.08)", border: "1px solid rgba(62,217,184,0.2)", borderRadius: 100, padding: "5px 12px", fontSize: 11, color: "#3ED9B8", fontWeight: 600 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3ED9B8", animation: "pulse 1.8s ease-in-out infinite", display: "inline-block" }} />
          Online
        </div>
      </div>

      {/* Message thread */}
      <div style={{
        flex: 1, overflowY: "auto", display: "flex", flexDirection: "column",
        gap: "1rem", padding: "1.25rem",
        background: "var(--bg2)", border: "1px solid var(--border)",
        borderRadius: 18, marginBottom: "0.75rem",
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
            {m.role === "agent" && (
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, var(--accent), #5B7FFF)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Bot size={12} color="#fff" />
              </div>
            )}
            <div style={{
              maxWidth: "72%", padding: "11px 15px", whiteSpace: "pre-wrap",
              borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
              background: m.role === "user" ? "var(--accent)" : "var(--bg3)",
              border: m.role === "user" ? "none" : "1px solid var(--border)",
              color: m.role === "user" ? "#fff" : "var(--text)",
              fontSize: 13.5, lineHeight: 1.65,
            }}>
              {m.text}
            </div>
            {m.role === "user" && (
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, #5B7FFF, #4A6FEF)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "#fff",
              }}>U</div>
            )}
          </div>
        ))}

        {thinking && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, var(--accent), #5B7FFF)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Bot size={12} color="#fff" />
            </div>
            <div style={{ padding: "12px 16px", borderRadius: "4px 16px 16px 16px", background: "var(--bg3)", border: "1px solid var(--border)", display: "flex", gap: 5, alignItems: "center" }}>
              {[0, 1, 2].map((n) => (
                <span key={n} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", opacity: 0.6, display: "inline-block", animation: `pulse 1.2s ease-in-out ${n * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick chips — only on first load */}
      {showChips && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "0.65rem", flexShrink: 0 }}>
          {QUICK_CHIPS.map(({ label, Icon }) => (
            <button
              key={label}
              onClick={() => send(label)}
              style={{
                padding: "6px 12px", borderRadius: 9, border: "1px solid var(--border2)",
                background: "var(--bg3)", color: "var(--text2)", fontSize: 12,
                cursor: "pointer", fontFamily: "inherit",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}
            >
              <Icon size={11} style={{ color: "var(--accent)", flexShrink: 0 }} />
              {label}
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
          placeholder="Ask Lyra anything about your payroll, vault, or agents…"
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
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
