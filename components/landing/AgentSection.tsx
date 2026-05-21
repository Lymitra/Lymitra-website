"use client";

import { useEffect, useRef } from "react";

const benefits = [
  {
    ico: "🔒",
    title: "Your money stays yours",
    desc: "Funds live in a smart contract only you control. No bank. No intermediary. Nobody can freeze or touch it.",
  },
  {
    ico: "💵",
    title: "Stable dollars, always",
    desc: "Employees receive the exact amount agreed — in USD stablecoins — regardless of market conditions.",
  },
  {
    ico: "⏰",
    title: "Never miss a payday",
    desc: "Payroll executes automatically on the date you set. You could be on a beach. It still runs.",
  },
  {
    ico: "📉",
    title: "Better rates, automatically",
    desc: "Lymitra picks the optimal moment to convert before payday, so your funds go further every month.",
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
    <section id="agents-l" className="why-sec" ref={ref}>
      <div className="reveal" style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <div className="sec-eyebrow">Why Lymitra</div>
        <h2 className="sec-h" style={{ marginBottom: "1rem" }}>
          Built for founders who<br />
          <span className="accent">hate doing admin.</span>
        </h2>
        <p style={{ color: "var(--text2)", fontSize: 15, maxWidth: 460, margin: "0 auto" }}>
          Running payroll manually every month wastes hours, causes errors,
          and creates stress. Lymitra eliminates all of it.
        </p>
      </div>

      <div className="why-grid reveal">
        {benefits.map((b) => (
          <div key={b.title} className="why-card">
            <div className="why-ico">{b.ico}</div>
            <div className="why-title">{b.title}</div>
            <div className="why-desc">{b.desc}</div>
          </div>
        ))}
      </div>

      <div className="reveal" style={{ textAlign: "center", marginTop: "3.5rem" }}>
        <button
          className="btn-primary"
          style={{ fontSize: 15, height: 50, padding: "0 36px", cursor: "pointer" }}
          onClick={onLaunchApp}
        >
          Start paying your team →
        </button>
      </div>
    </section>
  );
}
