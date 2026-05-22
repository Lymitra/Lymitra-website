"use client";

import { useEffect, useRef } from "react";
import { Lock, DollarSign, CalendarCheck, TrendingDown, TrendingUp } from "lucide-react";


const benefits = [
  {
    Icon: TrendingDown,
    title: "AI times the conversion",
    desc: "Monitors rates 24/7 and converts your tokens to USDC only at the optimal window — never at a bad rate.",
  },
  {
    Icon: DollarSign,
    title: "Stable USDC, always",
    desc: "Employees receive their exact agreed salary in USDC every month, regardless of market conditions.",
  },
  {
    Icon: TrendingUp,
    title: "Your tokens keep growing",
    desc: "Deposited STT and ETH sit in the vault and appreciate. The AI only converts what's needed for payroll.",
  },
  {
    Icon: CalendarCheck,
    title: "Never miss a payday",
    desc: "Set your payday once. Payroll runs automatically every month without you.",
  },
  {
    Icon: Lock,
    title: "Non-custodial vault",
    desc: "Your tokens sit on-chain. Only your wallet can authorise withdrawals.",
  },
];

export function AgentSection() {
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
      <div className="reveal" style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div className="sec-eyebrow">Why Lymitra</div>
        <h2 className="sec-h">
          Built for teams that move fast<br />
          and <span className="accent">hate admin work.</span>
        </h2>
        <p className="sec-sub" style={{ maxWidth: 440, margin: "1rem auto 0" }}>
          Manual crypto payroll is slow, error-prone, and stressful. Lymitra eliminates it.
        </p>
      </div>

      <div className="why-grid">
        {benefits.map((b) => (
          <div key={b.title} className="why-card reveal">
            <div className="why-ico-wrap">
              <b.Icon size={20} strokeWidth={1.6} />
            </div>
            <div className="why-title">{b.title}</div>
            <div className="why-desc">{b.desc}</div>
          </div>
        ))}
      </div>


    </section>
  );
}
