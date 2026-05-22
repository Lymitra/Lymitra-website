"use client";

import { useState } from "react";
import { useAccount } from "wagmi";

const tabs = ["All", "Payroll", "Conversions", "Deposits"] as const;

export function Analytics() {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("All");

  return (
    <div>
      <div className="sec-hd">
        <div>
          <div className="sec-ht">Analytics</div>
          <div className="sec-hs">Transaction history · All activity · Somnia Shannon</div>
        </div>
      </div>

      <div className="ss" style={{ marginBottom: "1.25rem" }}>
        <div className="sc"><div className="sc-l">Total volume</div><div className="sc-v">—</div><div className="sc-s">all time</div></div>
        <div className="sc"><div className="sc-l">Payroll sent</div><div className="sc-v accent">—</div><div className="sc-s">USDC</div></div>
        <div className="sc"><div className="sc-l">Conversions</div><div className="sc-v">—</div><div className="sc-s">by agents</div></div>
        <div className="sc"><div className="sc-l">Gas fees</div><div className="sc-v green">$0.00</div><div className="sc-s">Somnia = free</div></div>
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

        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/></svg>
          </div>
          <div className="empty-state-title">
            {isConnected ? "No transactions yet" : "Connect your wallet to see activity"}
          </div>
          <div className="empty-state-sub">
            Payroll runs, token conversions, and deposits will appear here once you set up your vault.
          </div>
        </div>
      </div>
    </div>
  );
}
