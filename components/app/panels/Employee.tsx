"use client";

import type { ReactNode } from "react";
import { Zap, Check } from "lucide-react";

const payments: { period: string; sub: string; token: string; amt: string; date: string; pill: string; pillLabel: ReactNode }[] = [
  { period: "May 2026 salary", sub: "0xf21a…5c95", token: "USDC", amt: "+4,387.50", date: "May 1", pill: "p-agent",  pillLabel: <><Zap size={10} style={{display:"inline",verticalAlign:"middle",marginRight:3}} />Agent</> },
  { period: "Apr 2026 salary", sub: "0xe99b…0f0a", token: "USDC", amt: "+4,387.50", date: "Apr 1", pill: "p-active", pillLabel: <><Check size={10} style={{display:"inline",verticalAlign:"middle",marginRight:3}} />Paid</> },
  { period: "Mar 2026 salary", sub: "0xa33c…2d11", token: "USDC", amt: "+4,387.50", date: "Mar 1", pill: "p-active", pillLabel: <><Check size={10} style={{display:"inline",verticalAlign:"middle",marginRight:3}} />Paid</> },
];

export function Employee() {
  return (
    <div>
      <div className="sec-hd">
        <div>
          <div className="sec-ht">My payments</div>
          <div className="sec-hs">Alex Kim · Lead Engineer · Paid by Lymitra agents</div>
        </div>
      </div>

      <div className="ps-hero">
        <div className="ps-mo">May 2026 — Payslip</div>
        <div className="ps-amt">4,387.50 USDC</div>
        <div className="ps-st"><div className="ps-dot" />Paid by agent · May 1 00:00 UTC</div>
        <div className="ps-bd">
          <div className="ps-ln"><span className="ps-k">Gross salary</span><span className="ps-v">4,500.00 USDC</span></div>
          <div className="ps-ln"><span className="ps-k">Lymitra fee (2.5%)</span><span className="ps-v">−112.50 USDC</span></div>
          <div className="ps-ln"><span className="ps-k">Net received</span><span className="ps-v" style={{ color: "#3ED9B8" }}>4,387.50 USDC</span></div>
          <div className="ps-ln"><span className="ps-k">Executed by</span><span className="ps-v">Somnia Reactivity · Block 8,012,444</span></div>
          <div className="ps-ln"><span className="ps-k">Tx hash</span><span className="ps-v" style={{ fontSize: "11px" }}>0xf21ad71a…5c951</span></div>
        </div>
      </div>

      <div style={{ fontSize: "17px", fontWeight: 600, color: "var(--text)", marginBottom: "1rem", letterSpacing: "-.02em" }}>Payment history</div>

      <div className="h-table">
        <div className="h-row" style={{ background: "var(--bg3)", borderBottom: "1px solid var(--border2)" }}>
          <div className="th">Period</div><div className="th">Token</div><div className="th">Amount</div><div className="th">Date</div><div className="th">Status</div>
        </div>
        {payments.map((p, i) => (
          <div className="h-row" key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
              <div className="tx-ic tx-in">$</div>
              <div><div className="tx-n">{p.period}</div><div className="tx-s">{p.sub}</div></div>
            </div>
            <div className="td">{p.token}</div>
            <div className="a-pos">{p.amt}</div>
            <div className="td">{p.date}</div>
            <div><span className={`pill ${p.pill}`} style={{display:"inline-flex",alignItems:"center"}}>{p.pillLabel}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}
