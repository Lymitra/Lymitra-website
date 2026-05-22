"use client";

import { useEffect, useRef } from "react";
import { Wallet, Users, Repeat } from "lucide-react";

const steps = [
  {
    n: "01",
    Icon: Wallet,
    title: "Deposit SOMI or ETH",
    desc: "Connect your wallet and deposit tokens into your vault. Set your team and payday date.",
    tag: "5 min setup",
  },
  {
    n: "02",
    Icon: Repeat,
    title: "AI picks the moment",
    desc: "Our on-chain AI monitors the rate 24/7 and converts to USDC at the optimal window before payday.",
    tag: "Running 24/7",
  },
  {
    n: "03",
    Icon: Users,
    title: "Team gets paid in USDC",
    desc: "Every employee receives their exact salary in stable USDC on payday. You do nothing.",
    tag: "Every month",
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
        <h2 className="sec-h">Set up once. <span className="accent">Walk away.</span></h2>
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
