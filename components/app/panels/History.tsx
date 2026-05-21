"use client";

import { useState } from "react";

const tabs = ["All", "Payroll", "Swaps", "Staking"] as const;

const rows = [
  { ic: "⚡", icCls: "tx-ag", name: "Agent payroll — May 2026",  sub: "6 recipients · Reactivity · Block 8,012,444", token: "USDC",     amt: "−18,500", amtCls: "a-neg", date: "May 1", pill: "p-agent",  pillLabel: "⚡ Agent" },
  { ic: "⇄", icCls: "tx-sw", name: "ETH → USDC swap",           sub: "LLM Agent routed · optimal rate",             token: "ETH/USDC", amt: "2.5 ETH",  amtCls: "a-neu", date: "Apr 28", pill: "p-active", pillLabel: "✓ Done" },
  { ic: "⬇", icCls: "tx-in", name: "ETH bridged from Ethereum",  sub: "LayerZero · 0x6F47… → Somnia",               token: "WETH",     amt: "+8.9 ETH", amtCls: "a-pos", date: "Apr 20", pill: "p-active", pillLabel: "✓ Done" },
  { ic: "⬡", icCls: "tx-ag", name: "SOMI staked — 42,000",       sub: "Protocol vault · 12% APY",                   token: "SOMI",     amt: "42,000",   amtCls: "a-neu", date: "Apr 18", pill: "p-active", pillLabel: "✓ Done" },
];

export function History() {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("All");

  return (
    <div>
      <div className="sec-hd">
        <div>
          <div className="sec-ht">Transaction history</div>
          <div className="sec-hs">All activity · Somnia Shannon Testnet</div>
        </div>
      </div>

      <div className="h-tabs">
        {tabs.map((t) => (
          <button key={t} className={`ht${activeTab === t ? " on" : ""}`} onClick={() => setActiveTab(t)}>{t}</button>
        ))}
      </div>

      <div className="h-table">
        <div className="h-row" style={{ background: "var(--bg3)", borderBottom: "1px solid var(--border2)" }}>
          <div className="th">Transaction</div>
          <div className="th">Token</div>
          <div className="th">Amount</div>
          <div className="th">Date</div>
          <div className="th">Status</div>
        </div>
        {rows.map((r, i) => (
          <div className="h-row" key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
              <div className={`tx-ic ${r.icCls}`}>{r.ic}</div>
              <div><div className="tx-n">{r.name}</div><div className="tx-s">{r.sub}</div></div>
            </div>
            <div className="td">{r.token}</div>
            <div className={r.amtCls}>{r.amt}</div>
            <div className="td">{r.date}</div>
            <div><span className={`pill ${r.pill}`}>{r.pillLabel}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}
