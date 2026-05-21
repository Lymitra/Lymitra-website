"use client";

import { useEffect, useRef } from "react";
import { Zap } from "lucide-react";

function SomniaSVG({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="22" fill="#7B3FE4" />
      <path
        d="M13 18 Q13 11 22 11 Q31 11 31 18 Q31 22 22 22 Q13 22 13 26 Q13 33 22 33 Q31 33 31 26"
        stroke="white" strokeWidth="3.2" fill="none" strokeLinecap="round"
      />
    </svg>
  );
}

function EthSVG({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="22" fill="#627EEA" />
      <polygon points="22,9 13,23 22,28 31,23" fill="white" fillOpacity="0.95" />
      <polygon points="22,28 13,23 22,35 31,23" fill="white" fillOpacity="0.55" />
    </svg>
  );
}

function UsdcSVG({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="28" fill="#2775CA" />
      <circle cx="28" cy="28" r="19" stroke="white" strokeWidth="1.8" fill="none" />
      <text x="28" y="35" textAnchor="middle" fill="white" fontSize="18" fontWeight="700"
        fontFamily="system-ui,sans-serif">$</text>
    </svg>
  );
}

const DOTS = [0, 0.25, 0.5, 0.75, 1.0];

export function TokenFlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); }),
      { threshold: 0.15 }
    );
    ref.current?.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section className="tf-sec" ref={ref}>
      <div className="tf-inner reveal">

        {/* ── Input tokens ── */}
        <div className="tf-inputs">
          <div className="tf-chip tf-chip-stt">
            <SomniaSVG size={40} />
            <div>
              <div className="tf-chip-name">Somnia</div>
              <div className="tf-chip-sym">STT</div>
            </div>
          </div>
          <div className="tf-or">or</div>
          <div className="tf-chip tf-chip-eth">
            <EthSVG size={40} />
            <div>
              <div className="tf-chip-name">Ethereum</div>
              <div className="tf-chip-sym">ETH</div>
            </div>
          </div>
        </div>

        {/* ── Flow track ── */}
        <div className="tf-track">
          <div className="tf-track-label">
            <Zap size={11} strokeWidth={2} />
            AI converts at peak rate
          </div>
          <div className="tf-track-line">
            {DOTS.map((delay, i) => (
              <div key={i} className="tf-dot" style={{ animationDelay: `${delay}s` }} />
            ))}
          </div>
          <div className="tf-track-arrow">→</div>
        </div>

        {/* ── USDC output ── */}
        <div className="tf-output">
          <div className="tf-usdc-wrap">
            <UsdcSVG size={56} />
            <div className="tf-ring tf-ring-1" />
            <div className="tf-ring tf-ring-2" />
          </div>
          <div className="tf-usdc-name">USDC</div>
          <div className="tf-usdc-tag">Stablecoin · paid to team</div>
          <div className="tf-growth">
            <span className="tf-growth-arrow">↑</span> Stable &amp; growing
          </div>
        </div>

      </div>
    </section>
  );
}
