"use client";

import { useEffect, useRef } from "react";
import { Wallet, Users, Repeat } from "lucide-react";

const steps = [
  {
    n: "01",
    Icon: Wallet,
    title: "Deposit funds",
    desc: "Deposit USDC into your non-custodial vault. Only you control it.",
    tag: "One-time setup",
  },
  {
    n: "02",
    Icon: Users,
    title: "Add your team",
    desc: "Add each employee's wallet and salary. Set the payday once.",
    tag: "Takes minutes",
  },
  {
    n: "03",
    Icon: Repeat,
    title: "Lymitra does the rest",
    desc: "We convert at the best rate and pay everyone in USDC automatically, every month.",
    tag: "Runs forever",
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
        <h2 className="sec-h">
          Three steps.<br />Then <span className="accent">nothing.</span>
        </h2>
        <p className="sec-sub">No recurring effort. No spreadsheets.</p>
      </div>
      <div className="steps reveal">
        {steps.map((s) => (
          <div className="step" key={s.n}>
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
