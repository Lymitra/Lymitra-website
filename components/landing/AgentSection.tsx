"use client";

import { useEffect, useRef } from "react";
import { Lock, DollarSign, CalendarCheck, TrendingDown } from "lucide-react";

const benefits = [
  {
    Icon: Lock,
    title: "Your money stays yours",
    desc: "Funds live in a smart contract only you control. No bank. No intermediary.",
  },
  {
    Icon: DollarSign,
    title: "Stable dollars, every time",
    desc: "Employees receive their exact salary in USDC, regardless of the market.",
  },
  {
    Icon: CalendarCheck,
    title: "Never miss a payday",
    desc: "Payroll executes on the date you set. It runs without you.",
  },
  {
    Icon: TrendingDown,
    title: "Better conversion rates",
    desc: "Lymitra picks the optimal moment to convert. Your treasury goes further every month.",
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
    <section id="why" className="why-sec" ref={ref}>
      <div className="reveal" style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <div className="sec-eyebrow">Why Lymitra</div>
        <h2 className="sec-h">
          Built for teams that move fast<br />
          and <span className="accent">hate admin work.</span>
        </h2>
        <p className="sec-sub" style={{ maxWidth: 440, margin: "1rem auto 0" }}>
          Manual crypto payroll is slow, error-prone, and stressful. Lymitra eliminates it.
        </p>
      </div>

      <div className="why-grid reveal">
        {benefits.map((b) => (
          <div key={b.title} className="why-card">
            <div className="why-ico-wrap">
              <b.Icon size={20} strokeWidth={1.6} />
            </div>
            <div className="why-title">{b.title}</div>
            <div className="why-desc">{b.desc}</div>
          </div>
        ))}
      </div>

      <div className="reveal" style={{ textAlign: "center", marginTop: "3.5rem" }}>
        <button className="btn-primary" style={{ height: 50, padding: "0 36px", fontSize: 15, cursor: "pointer" }} onClick={onLaunchApp}>
          Start paying your team
        </button>
      </div>
    </section>
  );
}
