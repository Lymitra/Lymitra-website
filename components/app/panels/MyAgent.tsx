"use client";

import type { ReactNode } from "react";
import { Zap, Brain, CheckCircle, Hexagon, Circle, Clock, PauseCircle } from "lucide-react";

const agents: { name: string; icon: ReactNode; status: string; desc: string; lastAction: string; executions: number; uptime: string }[] = [
  {
    name: "Rate Watch Agent",
    icon: <Zap size={16} strokeWidth={1.8} />,
    status: "running",
    desc: "Monitors ETH/USDC rates from CoinGecko, Binance, and 15 other sources every 60s.",
    lastAction: "ETH/USDC at $3,512.44 · 17/17 consensus · 2m ago",
    executions: 1_440,
    uptime: "99.98%",
  },
  {
    name: "LLM Decision Agent",
    icon: <Brain size={16} strokeWidth={1.8} />,
    status: "running",
    desc: "Uses Somnia on-chain LLM to decide optimal conversion timing before each payroll.",
    lastAction: "Decision: WAIT 4h · bullish trend detected · 14:22 UTC",
    executions: 24,
    uptime: "100%",
  },
  {
    name: "Payroll Reactivity Agent",
    icon: <CheckCircle size={16} strokeWidth={1.8} />,
    status: "scheduled",
    desc: "Fires payroll for all employees in a single block via Somnia Reactivity on payday.",
    lastAction: "Next execution: Jun 1 00:00 UTC · $18,500 queued",
    executions: 5,
    uptime: "100%",
  },
  {
    name: "Yield Harvest Agent",
    icon: <Hexagon size={16} strokeWidth={1.8} />,
    status: "running",
    desc: "Collects SOMI staking yield each epoch and routes 70% back to treasury.",
    lastAction: "+420 SOMI harvested · 294 → treasury · 3h ago",
    executions: 720,
    uptime: "99.91%",
  },
];

const statusStyle: Record<string, { bg: string; color: string; label: ReactNode }> = {
  running:   { bg: "rgba(79,196,144,0.10)",  color: "#4FC490",       label: <><Circle size={6} fill="#4FC490" stroke="none" style={{display:"inline",verticalAlign:"middle",marginRight:4}} />Running</> },
  scheduled: { bg: "var(--accent-dim)",       color: "var(--accent)", label: <><Clock size={10} style={{display:"inline",verticalAlign:"middle",marginRight:4}} />Scheduled</> },
  paused:    { bg: "var(--bg4)",              color: "var(--text3)",  label: <><PauseCircle size={10} style={{display:"inline",verticalAlign:"middle",marginRight:4}} />Paused</> },
};

export function MyAgent() {
  return (
    <div>
      <div className="sec-hd">
        <div>
          <div className="sec-ht">My Agent</div>
          <div className="sec-hs">Your autonomous agents · Running on Somnia Reactivity</div>
        </div>
        <button className="tb-btn green">+ New agent</button>
      </div>

      <div className="ss" style={{ marginBottom: "1.5rem" }}>
        <div className="sc"><div className="sc-l">Active agents</div><div className="sc-v accent">3</div><div className="sc-s">+ 1 scheduled</div></div>
        <div className="sc"><div className="sc-l">Total executions</div><div className="sc-v">2,189</div><div className="sc-s">all time</div></div>
        <div className="sc"><div className="sc-l">Gas spent</div><div className="sc-v green">$0.00</div><div className="sc-s">Somnia = free</div></div>
        <div className="sc"><div className="sc-l">Avg uptime</div><div className="sc-v gold">99.97%</div><div className="sc-s">30d window</div></div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {agents.map((a) => {
          const s = statusStyle[a.status];
          return (
            <div className="card" key={a.name}>
              <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{a.icon}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{a.name}</div>
                      <div style={{ fontSize: 11.5, color: "var(--text3)" }}>{a.executions.toLocaleString()} executions · {a.uptime} uptime</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 100, background: s.bg, color: s.color }}>{s.label}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>{a.desc}</div>
                <div style={{ fontSize: 12, color: "var(--text3)", background: "var(--bg3)", borderRadius: 8, padding: "8px 12px", fontFamily: "monospace" }}>
                  {a.lastAction}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="tb-btn">View logs</button>
                  <button className="tb-btn">Configure</button>
                  <button className="tb-btn" style={{ marginLeft: "auto", color: "var(--red)" }}>Pause</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
