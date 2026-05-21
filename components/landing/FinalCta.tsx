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
    <section className="fcta reveal" ref={ref}>
      <h2 className="fcta-h">
        Your team.<br />
        <span className="accent">Paid automatically.</span><br />
        <span className="muted">Every month.</span>
      </h2>
      <p className="fcta-sub">Set up in under 5 minutes. No code. No finance team. Just your wallet and your team&apos;s wallets.</p>
      <button
        className="btn-primary"
        style={{ cursor: "pointer", display: "inline-flex", fontSize: 15, padding: "14px 38px" }}
        onClick={onLaunchApp}
      >
        Launch Lymitra →
      </button>
    </section>
  );
}
