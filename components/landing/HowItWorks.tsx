"use client";

import { useEffect, useRef } from "react";
import { Wallet, TrendingUp, ShieldCheck } from "lucide-react";

const steps = [
  {
    n: "01",
    Icon: Wallet,
    title: "Drop in crypto. Your team is set.",
    desc: "Add employees, set a payday, choose which tokens to hold. One-time setup, no treasury ops team, no bank integration required.",
    tag: "Under 5 min",
  },
  {
    n: "02",
    Icon: TrendingUp,
    title: "AI times the market for you.",
    desc: "The AI watches exchange rates around the clock and converts when conditions are favorable, so your team gets more without you lifting a finger.",
    tag: "Rate-optimized",
  },
  {
    n: "03",
    Icon: ShieldCheck,
    title: "Payday lands. Every time.",
    desc: "Employees receive USDC or USDT on schedule, regardless of market volatility. No delays, no failures, full on-chain audit trail.",
    tag: "Zero failures",
  },
];

export function HowItWorks() {
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
    <section id="how" className="how" ref={ref}>
      <div className="reveal" style={{ marginBottom: "1rem" }}>
        <div className="sec-eyebrow">How it works</div>
        <h2 className="sec-h">Set up once. <span className="accent">Never touch it again.</span></h2>
        <p style={{ color: "var(--text3)", fontSize: "0.95rem", marginTop: "0.5rem", maxWidth: 480, margin: "0.5rem auto 0" }}>
          Most payroll tools require a finance team. Lymitra requires a wallet.
        </p>
      </div>
      <div className="steps">
        {steps.map((s) => (
          <div className="step reveal" key={s.n}>
            <span className="step-n">{s.n}</span>
            <div className="step-ico-wrap">
              <s.Icon size={22} strokeWidth={1.6} />
            </div>
            <div className="step-title">{s.title}</div>
            <p className="step-desc">{s.desc}</p>
            <div className="step-tag">{s.tag}</div>
          </div>
        ))}
      </div>

    </section>
  );
}
