"use client";

import { useEffect, useRef } from "react";

type Panel = "dashboard" | "aichat" | "myagent" | "vault" | "payments" | "earn" | "analytics";

interface DashboardProps {
  onNav: (panel: Panel) => void;
}

export function Dashboard({ onNav }: DashboardProps) {
  const counterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = counterRef.current;
    if (!el) return;
    const target = 84320.48;
    const duration = 1200;
    const start = performance.now();
    function step(now: number) {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const val = (target * ease).toFixed(2);
      el!.textContent = "$" + Number(val).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, []);

  return (
    <div>
      <div className="app-cs">
        <div className="acs-l">Networks</div>
        <div className="acs-ps">
          <div className="acp live"><div className="acp-dot acp-a" />Somnia <span style={{ fontSize: "8.5px", color: "#3ED9B8", letterSpacing: ".05em", fontWeight: 500 }}>LIVE</span></div>
          <div className="acp"><div className="acp-dot acp-b" />Ethereum</div>
          <div className="acp"><div className="acp-dot acp-b" />Base</div>
          <div className="acp"><div className="acp-dot acp-p" />Polygon</div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: "10px", color: "var(--text3)", letterSpacing: ".02em" }}>AI runs on Somnia</div>
      </div>

      <div className="dash-hero">
        <div className="dh-glow" />
        <div className="dh-lbl">Total treasury</div>
        <div className="dh-amt" ref={counterRef}>$0.00</div>
        <div className="dh-chg">▲ +$2,764 · +3.39% today</div>
        <div className="dh-acts">
          <button className="dh-btn p" onClick={() => onNav("vault")}>+ Deposit</button>
          <button className="dh-btn" onClick={() => onNav("payments")}>👥 Team</button>
          <button className="dh-btn" onClick={() => onNav("earn")}>⬡ Stake SOMI</button>
          <button className="dh-btn" onClick={() => onNav("analytics")}>≡ History</button>
        </div>
      </div>

      <div className="ss">
        <div className="sc"><div className="sc-l">Monthly payroll</div><div className="sc-v">$18,500</div><div className="sc-s">6 employees · USDC</div></div>
        <div className="sc"><div className="sc-l">SOMI staked</div><div className="sc-v accent">42,000</div><div className="sc-s up">12% APY</div></div>
        <div className="sc"><div className="sc-l">Next payroll</div><div className="sc-v green">11 days</div><div className="sc-s">Jun 1 · auto</div></div>
        <div className="sc"><div className="sc-l">Gas used</div><div className="sc-v gold">$0.00</div><div className="sc-s">Somnia = free</div></div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="card-h">
            <div className="card-t">Holdings</div>
            <button className="card-a" onClick={() => onNav("vault")}>Manage →</button>
          </div>
          {[
            { cls: "ti-u", sym: "USDC", name: "USD Coin", tag: "Payroll reserve", pts: "0,16 10,12 22,14 32,8 42,6 50,4", stroke: "#4FC490", usd: "$36,000", amt: "36,000 USDC", chg: "Stable", up: true },
            { cls: "ti-e", sym: "ETH",  name: "Ethereum",  tag: "Bridged via LayerZero", pts: "0,14 10,10 22,12 32,7 42,9 50,6", stroke: "#4FC490", usd: "$31,200", amt: "8.9 ETH", chg: "+4.8%", up: true },
            { cls: "ti-s", sym: "SOMI", name: "Somnia Token", tag: "42,000 staked", pts: "0,13 10,15 22,9 32,11 42,5 50,3", stroke: "#4FC490", usd: "$12,600", amt: "42,000 SOMI", chg: "+11.2%", up: true },
            { cls: "ti-b", sym: "wBTC", name: "Wrapped Bitcoin", tag: "Reserve", pts: "0,7 10,9 22,12 32,10 42,14 50,13", stroke: "#D4736A", usd: "$4,520", amt: "0.046 BTC", chg: "−1.8%", up: false },
          ].map((t) => (
            <div className="tr" key={t.sym}>
              <div className={`tic ${t.cls}`}>{t.sym}</div>
              <div className="ti-inf"><div className="ti-n">{t.name}</div><div className="ti-t">{t.tag}</div></div>
              <svg className="t-spark" viewBox="0 0 50 20"><polyline points={t.pts} fill="none" stroke={t.stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <div className="t-bal">
                <div className="t-usd">{t.usd}</div>
                <div className="t-amt">{t.amt}</div>
                <div className={`t-chg ${t.up ? "up" : "dn"}`}>{t.chg}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="agp">
          <div className="agp-h">
            <div className="agp-hl"><div className="ag-led" /><div className="agp-ht">Agent Activity</div></div>
            <div className="agp-cnt">3 running</div>
          </div>
          <div className="agp-feed">
            {[
              { ic: "⚡", cls: "", title: "Rate Watch — optimal rate detected", sub: "ETH/USDC at $3,512. Conversion queued in 4h.", time: "2m" },
              { ic: "$",  cls: "gold", title: "Payroll prep — 11 days to execution", sub: "Reactivity active. Jun 1 00:00 UTC. $18,500 queued.", time: "1h" },
              { ic: "✓",  cls: "green", title: "Staking yield collected", sub: "420 SOMI harvested. 294 → treasury.", time: "3h" },
              { ic: "🔍", cls: "", title: "Fraud check passed — 0xA8f…3b2c", sub: "LLM Agent: no flags. Consensus confirmed.", time: "1d" },
              { ic: "⚡", cls: "gold", title: "May payroll executed — $18,500", sub: "6 transfers · 1 block · May 1 00:00 UTC.", time: "20d" },
            ].map((a, i) => (
              <div className="ag-item" key={i}>
                <div className={`ai-ic${a.cls ? " " + a.cls : ""}`}>{a.ic}</div>
                <div className="ai-body"><div className="ai-title">{a.title}</div><div className="ai-sub">{a.sub}</div></div>
                <div className="ai-time">{a.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
