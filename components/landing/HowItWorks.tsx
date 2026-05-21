"use client";

import { useEffect, useRef } from "react";

const steps = [
  {
    n: "01",
    ico: "💰",
    title: "Deposit funds",
    desc: "Add money to your company vault in minutes. It stays completely yours — no bank, no middleman, just a secure digital safe you control.",
    tag: "One-time setup",
  },
  {
    n: "02",
    ico: "👥",
    title: "Add your team",
    desc: "Enter each person's name, wallet address, and monthly salary. Set payday once. That's the last time you'll ever think about running payroll.",
    tag: "Done in minutes",
  },
  {
    n: "03",
    ico: "✨",
    title: "We handle everything",
    desc: "On payday, Lymitra automatically converts your funds at the best rate and sends every employee their exact salary in stable dollars — no action needed from you.",
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
      <div className="reveal">
        <div className="sec-eyebrow">How it works</div>
        <h2 className="sec-h">Three steps.<br />Then <span className="accent">nothing.</span></h2>
        <p style={{ color: "var(--text2)", maxWidth: 480, margin: "0 auto 2.5rem", textAlign: "center", fontSize: 15, lineHeight: 1.6 }}>
          No finance team. No spreadsheets. No monthly reminders.
          Just set it up once and your team gets paid — forever.
        </p>
      </div>
      <div className="steps reveal">
        {steps.map((s) => (
          <div className="step" key={s.n}>
            <span className="step-n">{s.n}</span>
            <div className="step-ico">{s.ico}</div>
            <div className="step-title">{s.title}</div>
            <p className="step-desc">{s.desc}</p>
            <div className="step-tag">{s.tag}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
