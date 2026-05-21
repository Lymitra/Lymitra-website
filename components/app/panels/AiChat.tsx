"use client";

import { useState } from "react";

const initialMessages = [
  { role: "agent", text: "Hey! I'm your Lymitra AI. I monitor your treasury, watch exchange rates, and can answer anything about your payroll setup. What would you like to know?" },
];

export function AiChat() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  function send() {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [
      ...m,
      { role: "user", text },
      { role: "agent", text: "I'm processing your request on Somnia. This feature will be powered by the on-chain LLM agent — coming soon." },
    ]);
    setInput("");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 52px - 3rem)" }}>
      <div className="sec-hd" style={{ marginBottom: "1rem" }}>
        <div>
          <div className="sec-ht">AI Chat</div>
          <div className="sec-hs">Powered by Somnia on-chain LLM · Always available</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#3ED9B8" }}>
          <div className="ag-led" />
          Agent online
        </div>
      </div>

      <div style={{
        flex: 1, overflowY: "auto", background: "var(--bg2)", border: "1px solid var(--border)",
        borderRadius: "14px", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem",
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            {m.role === "agent" && (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, marginRight: 8, flexShrink: 0 }}>⚡</div>
            )}
            <div style={{
              maxWidth: "72%", padding: "10px 14px", borderRadius: m.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
              background: m.role === "user" ? "var(--accent)" : "var(--bg3)",
              color: m.role === "user" ? "#fff" : "var(--text)",
              fontSize: "13.5px", lineHeight: 1.6,
            }}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "8px", marginTop: "1rem" }}>
        <input
          className="f-inp"
          style={{ flex: 1 }}
          placeholder="Ask about your treasury, rates, payroll schedule..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button className="sub-btn" style={{ width: "auto", padding: "0 20px" }} onClick={send}>
          Send
        </button>
      </div>
    </div>
  );
}
