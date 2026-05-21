"use client";

import { useEffect, useRef } from "react";
import { Wallet, Users, Repeat } from "lucide-react";

const steps = [
  {
    n: "01",
    Icon: Wallet,
    title: "Deposit ETH or STT",
    desc: "Connect your wallet and deposit your volatile tokens. They sit in a non-custodial vault — only you control them.",
    tag: "One-time setup",
  },
  {
    n: "02",
    Icon: Repeat,
    title: "AI picks the moment",
    desc: "Our on-chain AI monitors 17+ price feeds and decides the optimal window to convert before each payday.",
    tag: "Running 24/7",
  },
  {
    n: "03",
    Icon: Users,
    title: "Team receives USDC",
    desc: "On payday, every employee gets their exact agreed salary in stable USDC. You do nothing.",
    tag: "Every month, forever",
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
