"use client";

import { useEffect, useRef } from "react";

const benefits = [
  {
    ico: "🔒",
    title: "Your money never leaves your control",
    desc: "Everything lives in a smart contract you own. We can't touch it, freeze it, or lose it. Not your bank — your vault.",
  },
  {
    ico: "💵",
    title: "Employees always get stable dollars",
    desc: "No matter what the market does, your team receives the exact amount in their agreed salary — in USD stablecoins, every time.",
  },
  {
    ico: "⏰",
    title: "Never miss a payroll again",
    desc: "Payroll runs automatically on the date you set — even while you sleep, travel, or take a break. It just works.",
  },
  {
    ico: "📉",
    title: "Stop losing money to bad timing",
    desc: "Lymitra picks the best moment to convert your funds before payday, so your team gets paid more without you doing anything.",
  },
];

interface AgentSectionProps {
  onLaunchApp: () => void;
}

export function AgentSection({ onLaunchApp }: AgentSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); }),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="agents-l" className="ag-sec" ref={ref}>
      <div className="ag-sec-inner reveal" style={{ flexDirection: "column", alignItems: "center", textAlign: "center", gap: "2.5rem" }}>
        <div>
          <div className="sec-eyebrow">Why Lymitra</div>
          <h2 className="ag-h">
            Built for founders<br />
            <span className="accent">who hate admin work.</span>
          </h2>
          <p className="ag-p" style={{ maxWidth: 520, margin: "0 auto 2rem" }}>
            Running payroll manually every month costs you hours, creates errors,
            and causes stress. Lymitra eliminates all of it — one setup, then nothing.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", width: "100%", maxWidth: 860 }}>
          {benefits.map((b) => (
            <div key={b.title} className="card" style={{ textAlign: "left" }}>
              <div style={{ fontSize: 28, marginBottom: "0.75rem" }}>{b.ico}</div>
              <div style={{ fontWeight: 600, color: "var(--text)", marginBottom: "0.4rem", fontSize: 14 }}>{b.title}</div>
              <div style={{ color: "var(--text2)", fontSize: 13, lineHeight: 1.6 }}>{b.desc}</div>
            </div>
          ))}
        </div>

        <button
          className="btn-primary"
          style={{ cursor: "pointer", display: "inline-flex", fontSize: 15, padding: "14px 38px" }}
          onClick={onLaunchApp}
        >
          Start paying your team →
        </button>
      </div>
    </section>
  );
}
