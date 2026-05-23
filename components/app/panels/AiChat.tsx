"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, Play, Zap, TrendingUp, UserPlus, Gauge, BarChart2 } from "lucide-react";

interface Message {
  role: "user" | "agent";
  text: string;
}

const WELCOME_TEXT =
  "I'm Lyra, your Lymitra AI. I know your vault, your agents, and how Somnia works. Ask me anything — or pick a question below.";

const QUICK_CHIPS = [
  { label: "How do I run my first payroll?", Icon: Play        },
  { label: "How do agents activate?",         Icon: Zap         },
  { label: "What is SOMI staking?",           Icon: TrendingUp  },
  { label: "How do I add an employee?",       Icon: UserPlus    },
  { label: "Why is Somnia gas free?",         Icon: Gauge       },
  { label: "What is runway?",                 Icon: BarChart2   },
];

export function AiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
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
    const withUser: Message[] = [...messages, { role: "user", text: msg }];
    setMessages(withUser);
    setThinking(true);
    try {
      const res  = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:   JSON.stringify({ messages: withUser }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "agent", text: data.text || "No response — please try again." }]);
    } catch {
      setMessages((m) => [...m, { role: "agent", text: "Connection issue — please try again." }]);
    } finally {
      setThinking(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  const showChips = messages.length === 0;

  return (
    <div className="lyra-wrap">

      {/* ── Header ── */}
      <div className="lyra-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="lyra-avatar-wrap">
            <div className="lyra-ring-dash" />
            <div className="lyra-ring" />
            <div className="lyra-avatar">
              <Bot size={18} color="#fff" strokeWidth={1.8} />
            </div>
          </div>
          <div>
            <div className="lyra-name">Lyra</div>
            <div className="lyra-sub">Lymitra AI · Somnia-native</div>
          </div>
        </div>
        <div className="lyra-online">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3ED9B8", animation: "pulse 1.8s ease-in-out infinite", display: "inline-block" }} />
          Online
        </div>
      </div>

      {/* ── Message thread ── */}
      <div className="lyra-thread">

        {/* Welcome card — always shown */}
        <div className="lyra-welcome">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg, #5B7FFF, #3ED9B8)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Bot size={11} color="#fff" />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.03em" }}>LYRA</span>
          </div>
          {WELCOME_TEXT}
        </div>

        {/* Message history */}
        {messages.map((m, i) => (
          <div key={i} className={`lyra-msg${m.role === "user" ? " user" : ""}`}>
            {m.role === "agent" && (
              <div className="lyra-msg-av" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bot size={12} color="#fff" />
              </div>
            )}
            <div className={`lyra-bubble ${m.role}`}>
              {m.text}
            </div>
            {m.role === "user" && (
              <div className="lyra-msg-av user" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>
                U
              </div>
            )}
          </div>
        ))}

        {/* Thinking indicator */}
        {thinking && (
          <div className="lyra-msg">
            <div className="lyra-msg-av" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bot size={12} color="#fff" />
            </div>
            <div className="lyra-thinking-bubble">
              {[0, 1, 2].map((n) => (
                <span key={n} className="lyra-dot" style={{ animationDelay: `${n * 0.18}s` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Quick chips ── */}
      {showChips && (
        <div className="lyra-chips">
          {QUICK_CHIPS.map(({ label, Icon }) => (
            <button key={label} className="lyra-chip" onClick={() => send(label)}>
              <Icon size={11} style={{ color: "var(--accent)", flexShrink: 0 }} />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── Input ── */}
      <div className="lyra-input-row">
        <textarea
          ref={inputRef}
          className="lyra-input"
          placeholder="Ask Lyra anything about your payroll, vault, or agents…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
        />
        <button className="lyra-send" onClick={() => send()} disabled={!input.trim() || thinking}>
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
