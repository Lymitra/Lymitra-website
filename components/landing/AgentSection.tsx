"use client";

import { useEffect, useRef } from "react";
import { Lock, DollarSign, CalendarCheck, TrendingDown, TrendingUp } from "lucide-react";


const benefits = [
  {
    Icon: TrendingUp,
    title: "Deposit and earn yield",
    desc: "Fund the vault with STT or ETH. Your tokens generate yield — and that yield pays your team in USDC.",
  },
  {
    Icon: DollarSign,
    title: "Yield funds payroll",
    desc: "The AI converts your vault yield to USDC at the right moment. Your team gets paid. Your tokens keep growing.",
  },
  {
    Icon: TrendingDown,
    title: "AI times every conversion",
    desc: "Our on-chain agent monitors rates and converts only when the price is right — never at a loss.",
  },
  {
    Icon: CalendarCheck,
    title: "Never miss a payday",
    desc: "Payroll runs on the date you set, every month, automatically.",
  },
  {
    Icon: Lock,
    title: "Non-custodial vault",
    desc: "Your tokens are locked on-chain. Only your wallet controls the vault.",
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
