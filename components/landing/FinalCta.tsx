"use client";

import { useEffect, useRef } from "react";

interface FinalCtaProps {
  onLaunchApp: () => void;
}

export function FinalCta({ onLaunchApp }: FinalCtaProps) {
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
    <section className="fcta" ref={ref}>
      <div className="reveal">
        <h2 className="fcta-h">
          Your team deserves<br />
          <span className="accent">to be paid on time.</span><br />
          <span className="muted">Every time.</span>
        </h2>
        <p className="fcta-sub">
          5 minutes to set up. Zero effort after that.
        </p>
        <button className="btn-primary" style={{ cursor: "pointer", display: "inline-flex", fontSize: 15, height: 50, padding: "0 40px" }} onClick={onLaunchApp}>
          Start paying your team
        </button>
        <div style={{ marginTop: "1rem", fontSize: 12, color: "var(--text3)" }}>
          No monthly fee · 1% only when payroll runs · No credit card needed
        </div>
      </div>
    </section>
  );
}
