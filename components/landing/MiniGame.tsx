"use client";

import { useEffect, useRef } from "react";
import { Check, ArrowRight } from "lucide-react";

const INCLUDED = [
  "Unlimited employees",
  "Automatic monthly execution",
  "USDC stable payouts",
  "On-chain audit trail forever",
  "AI-optimized conversion timing",
  "Real-time agent activity feed",
  "Multi-company support",
];

interface PricingProps {
  onLaunchApp: () => void;
}

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
      <div className="reveal" style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div className="sec-eyebrow">Pricing</div>
        <h2 className="sec-h">Simple. Honest. Pay as you grow.</h2>
        <p className="sec-sub" style={{ margin: "1rem auto 0", maxWidth: 420 }}>
          No monthly subscription. No hidden fees. You only pay when your team gets paid.
        </p>
      </div>

      <div className="pricing-layout reveal">
        {/* Main pricing card */}
        <div className="price-card price-card-main">
          <div className="price-badge">Only plan you need</div>
          <div className="price-amount">
            <span className="price-pct">1%</span>
            <span className="price-per">per payroll run</span>
          </div>
          <p className="price-desc">
            Pay $1 for every $100 processed. Run payroll for a $10,000 team
            and pay just <strong>$100</strong> — once a month.
          </p>

          <div className="price-divider" />

          <ul className="price-features">
            {INCLUDED.map((f) => (
              <li key={f} className="price-feature">
                <Check size={14} className="price-check" />
                {f}
              </li>
            ))}
          </ul>

          <button className="btn-primary price-cta" onClick={onLaunchApp}>
            Get started <ArrowRight size={15} />
          </button>
          <div className="price-note">No credit card · No monthly fees</div>
        </div>

        {/* Comparison card */}
        <div className="price-card price-card-alt">
          <div className="price-alt-title">Compare the alternative</div>
          <div className="price-compare-rows">
            <div className="pcr">
              <span className="pcr-item">Finance contractor</span>
              <span className="pcr-cost bad">$2,000 – $5,000/mo</span>
            </div>
            <div className="pcr">
              <span className="pcr-item">Manual bank transfers</span>
              <span className="pcr-cost bad">4 – 8 hrs/month</span>
            </div>
            <div className="pcr">
              <span className="pcr-item">Crypto OTC desk</span>
              <span className="pcr-cost bad">1 – 3% per swap</span>
            </div>
            <div className="pcr">
              <span className="pcr-item">Payroll software</span>
              <span className="pcr-cost bad">$50 – $300/mo flat</span>
            </div>
            <div className="pcr pcr-lymitra">
              <span className="pcr-item">Lymitra</span>
              <span className="pcr-cost good">1% · zero admin</span>
            </div>
          </div>

          <div className="price-example">
            <div className="pe-label">Example: team of 5, avg $3,000 salary</div>
            <div className="pe-row">
              <span>Monthly payroll</span><strong>$15,000</strong>
            </div>
            <div className="pe-row">
              <span>Lymitra fee (1%)</span><strong style={{ color: "var(--accent)" }}>$150</strong>
            </div>
            <div className="pe-row">
              <span>Your time saved</span><strong style={{ color: "#4FC490" }}>~6 hours</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
