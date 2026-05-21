"use client";

import { useEffect, useRef } from "react";
import { Zap, TrendingUp } from "lucide-react";
import Image from "next/image";

function EthSVG({ size = 40 }: { size?: number }) {
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

        {/* ── Input tokens — side by side, equal level ── */}
        <div className="tf-inputs">
          <div className="tf-chip tf-chip-stt">
            <Image src="/logos/somi-token-roundel-1.png" width={40} height={40} alt="Somnia STT" style={{ borderRadius: "50%" }} />
            <div>
              <div className="tf-chip-name">Somnia</div>
              <div className="tf-chip-sym">STT</div>
            </div>
            <div className="tf-chip-growth">
              <TrendingUp size={10} strokeWidth={2.5} /> Growing
            </div>
          </div>

          <div className="tf-or-divider"><span>or</span></div>

          <div className="tf-chip tf-chip-eth">
            <EthSVG size={40} />
            <div>
              <div className="tf-chip-name">Ethereum</div>
              <div className="tf-chip-sym">ETH</div>
            </div>
            <div className="tf-chip-growth">
              <TrendingUp size={10} strokeWidth={2.5} /> Growing
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
          <div className="tf-stable-badge">Stable</div>
        </div>

      </div>
    </section>
  );
}
