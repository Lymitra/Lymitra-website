"use client";

import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";

interface PricingProps {
  onLaunchApp: () => void;
}

const TIERS = [
  { payroll: "$5,000",   fee: "$50",    saved: "$1,950+/mo" },
  { payroll: "$20,000",  fee: "$200",   saved: "$7,800+/mo" },
  { payroll: "$100,000", fee: "$1,000", saved: "$44,000+/yr" },
];

export function MiniGame({ onLaunchApp }: PricingProps) {
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
    <section id="pricing" className="pricing-sec" ref={ref}>

      {/* Eyebrow + headline */}
      <div className="reveal" style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div className="sec-eyebrow">Pricing</div>
        <h2 className="sec-h">We only win <span className="accent">when you do.</span></h2>
        <p className="sec-sub" style={{ margin: "0.75rem auto 0", maxWidth: 360 }}>
          One flat rate. No monthly fee. No contract. You pay when payroll runs — nothing else.
        </p>
      </div>

      {/* Hero number */}
      <div className="reveal" style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div style={{
          display: "inline-flex", flexDirection: "column", alignItems: "center",
          padding: "2rem 3rem", borderRadius: 24,
          background: "var(--accent-dim)", border: "1px solid var(--accent-b)",
        }}>
          <div style={{ fontSize: "clamp(4rem, 12vw, 6rem)", fontWeight: 800, lineHeight: 1, letterSpacing: "-0.05em", color: "var(--accent)" }}>
            1%
          </div>
          <div style={{ fontSize: 15, color: "var(--text2)", marginTop: 6, fontWeight: 500 }}>per payroll run</div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>nothing until it does</div>
        </div>
      </div>

      {/* Savings rows */}
      <div className="reveal" style={{ maxWidth: 560, margin: "0 auto 2.5rem" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text3)", marginBottom: "0.85rem", textAlign: "center" }}>
          See the math
        </div>
        <div style={{ display: "flex", flexDirection: "column", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "9px 16px", background: "var(--bg3)", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Payroll</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "center" }}>Our fee</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "right" }}>vs contractor</div>
          </div>
          {TIERS.map((t, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "13px 16px",
              borderBottom: i < TIERS.length - 1 ? "1px solid var(--border)" : "none",
              background: i === 1 ? "rgba(91,127,255,0.04)" : "transparent",
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{t.payroll}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)", textAlign: "center" }}>{t.fee}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#4FC490", textAlign: "right" }}>save {t.saved}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", fontSize: 12, color: "var(--text3)", marginTop: 10 }}>
          Finance contractors charge $2,000–$5,000/mo regardless of payroll size.
        </div>
      </div>

      {/* Three pillars */}
      <div className="reveal" style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginBottom: "2.5rem" }}>
        {[
          { label: "No monthly fee",         sub: "pay only on runs" },
          { label: "Unlimited employees",     sub: "no per-seat pricing" },
          { label: "On-chain audit trail",    sub: "forever, free" },
        ].map(({ label, sub }) => (
          <div key={label} style={{
            padding: "10px 18px", borderRadius: 100,
            border: "1px solid var(--border2)", background: "var(--bg2)",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{label}</div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="reveal" style={{ textAlign: "center" }}>
        <button className="btn-primary" onClick={onLaunchApp} style={{ height: 50, padding: "0 32px", fontSize: 15 }}>
          Get started <ArrowRight size={16} />
        </button>
        <div style={{ marginTop: 10, fontSize: 12, color: "var(--text3)" }}>No credit card · No monthly fees · No surprises</div>
      </div>

    </section>
  );
}
