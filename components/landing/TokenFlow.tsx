"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

const W = 500;
const H = 110;
const HISTORY = 70;
const AMOUNT = 10000; // STT to convert

function price(t: number) {
  return (
    0.045 +
    0.011 * Math.sin(t * 0.07) +
    0.005 * Math.sin(t * 0.19 + 1.4) +
    0.003 * Math.sin(t * 0.43 + 0.7) +
    0.0015 * Math.sin(t * 0.89 + 2.1)
  );
}

function toPath(pts: number[]) {
  if (pts.length < 2) return "";
  const min = Math.min(...pts) - 0.001;
  const max = Math.max(...pts) + 0.001;
  return pts
    .map((p, i) => {
      const x = (i / (pts.length - 1)) * W;
      const y = H - ((p - min) / (max - min)) * (H - 8) - 4;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join("");
}

function EthSVG({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="22" fill="#627EEA" />
      <polygon points="22,9 13,23 22,28 31,23" fill="white" fillOpacity="0.95" />
      <polygon points="22,28 13,23 22,35 31,23" fill="white" fillOpacity="0.55" />
    </svg>
  );
}

function UsdcSVG({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="22" fill="#2775CA" />
      <circle cx="22" cy="22" r="15" stroke="white" strokeWidth="1.6" fill="none" />
      <text x="22" y="27" textAnchor="middle" fill="white" fontSize="13" fontWeight="700" fontFamily="system-ui,sans-serif">$</text>
    </svg>
  );
}

type Phase = "playing" | "result";

export function TokenFlow() {
  const [pts, setPts] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>("playing");
  const [userUsdc, setUserUsdc] = useState(0);
  const [aiUsdc, setAiUsdc] = useState(0);
  const [userPrice, setUserPrice] = useState(0);
  const tickRef = useRef(0);
  const ptsRef = useRef<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const startLoop = useCallback((startTick: number) => {
    tickRef.current = startTick;
    timerRef.current = setInterval(() => {
      const t = tickRef.current++;
      const p = price(t);
      ptsRef.current = [...ptsRef.current.slice(-(HISTORY - 1)), p];
      setPts([...ptsRef.current]);
    }, 100);
  }, []);

  useEffect(() => {
    const offset = Math.random() * 200;
    ptsRef.current = Array.from({ length: HISTORY }, (_, i) => price(i + offset));
    setPts([...ptsRef.current]);
    tickRef.current = HISTORY + offset;
    startLoop(HISTORY + offset);
    return () => clearInterval(timerRef.current);
  }, [startLoop]);

  const handleConvert = useCallback(() => {
    if (phase !== "playing") return;
    clearInterval(timerRef.current);
    const cur = ptsRef.current[ptsRef.current.length - 1];

    // AI scans ahead for the best rate in next 20 ticks
    let best = cur;
    const t0 = tickRef.current;
    for (let i = 1; i <= 20; i++) best = Math.max(best, price(t0 + i));

    setUserPrice(cur);
    setUserUsdc(Math.round(AMOUNT * cur * 100) / 100);
    setAiUsdc(Math.round(AMOUNT * best * 100) / 100);
    setPhase("result");
  }, [phase]);

  const handleReset = useCallback(() => {
    setPhase("playing");
    setUserUsdc(0);
    setAiUsdc(0);
    const offset = Math.random() * 300 + 50;
    ptsRef.current = Array.from({ length: HISTORY }, (_, i) => price(i + offset));
    setPts([...ptsRef.current]);
    startLoop(HISTORY + offset);
  }, [startLoop]);

  const cur = pts[pts.length - 1] ?? 0.045;
  const path = toPath(pts);
  const fillPath = path ? `${path}L${W},${H}L0,${H}Z` : "";

  const min = pts.length ? Math.min(...pts) - 0.001 : 0;
  const max = pts.length ? Math.max(...pts) + 0.001 : 1;
  const dotY = H - ((cur - min) / (max - min)) * (H - 8) - 4;
  const diff = +(aiUsdc - userUsdc).toFixed(2);
  const userWon = diff <= 0;

  return (
    <section className="tf-sec">
      <div className="tf-wrap">

        {/* Header */}
        <div className="tf-head">
          <div className="tf-eyebrow">Mini Game Converter</div>
          <h3 className="tf-title">Can you beat the AI?</h3>
          <p className="tf-desc">Tokens grow in the vault. AI converts yield at the peak — never before.</p>
        </div>

        {/* Game card */}
        <div className="tf-card">

          {/* Rate header */}
          <div className="tf-rate-row">
            <div className="tf-rate-left">
              <Image src="/logos/somi-token-roundel-1.png" width={22} height={22} alt="STT" style={{ borderRadius: "50%" }} />
              <span className="tf-pair">STT / USDC</span>
            </div>
            <div className={`tf-rate-val${phase === "playing" ? " tf-rate-live" : ""}`}>
              ${phase === "playing" ? cur.toFixed(4) : userPrice.toFixed(4)}
            </div>
          </div>

          {/* Chart */}
          <div className="tf-chart">
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="tfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5B7FFF" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#5B7FFF" stopOpacity="0" />
                </linearGradient>
              </defs>
              {fillPath && <path d={fillPath} fill="url(#tfGrad)" />}
              {path && <path d={path} fill="none" stroke="#5B7FFF" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}
              {phase === "playing" && pts.length > 0 && (
                <circle cx={W} cy={dotY} r="5" fill="#5B7FFF" />
              )}
              {phase === "result" && (
                <line x1={W} y1={0} x2={W} y2={H} stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4,3" />
              )}
            </svg>
          </div>

          {/* Action / Result */}
          {phase === "playing" ? (
            <div className="tf-actions">
              <button className="tf-btn-convert" onClick={handleConvert}>
                Convert Now
              </button>
              <div className="tf-ai-status">
                <span className="tf-ai-pulse" />
                AI is watching the rate...
              </div>
            </div>
          ) : (
            <div className="tf-results">
              <div className={`tf-res-row ${userWon ? "tf-res-green" : "tf-res-dim"}`}>
                <span>You converted at</span>
                <span className="tf-res-val">{(AMOUNT * (userPrice)).toFixed(0)} USDC</span>
              </div>
              <div className="tf-res-row tf-res-green">
                <span>AI rate <span className="tf-ai-tag">Auto</span></span>
                <span className="tf-res-val">{aiUsdc.toFixed(0)} USDC</span>
              </div>
              <div className="tf-res-msg">
                {userWon
                  ? "Perfect timing! Still — the AI catches this on autopilot every month."
                  : `AI secured $${diff.toFixed(2)} more USDC. Without you lifting a finger.`}
              </div>
              <button className="tf-btn-reset" onClick={handleReset}>Try again</button>
            </div>
          )}
        </div>

        {/* Token flow logos */}
        <div className="tf-logos">
          <div className="tf-logo-pill tf-logo-stt">
            <Image src="/logos/somi-token-roundel-1.png" width={26} height={26} alt="STT" style={{ borderRadius: "50%" }} />
            <span>STT</span>
            <span className="tf-logo-tag">Growing</span>
          </div>
          <div className="tf-logo-or">or</div>
          <div className="tf-logo-pill tf-logo-eth">
            <EthSVG size={26} />
            <span>ETH</span>
            <span className="tf-logo-tag">Growing</span>
          </div>
          <div className="tf-logo-arrow">→</div>
          <div className="tf-logo-pill tf-logo-usdc">
            <UsdcSVG size={26} />
            <span>USDC</span>
            <span className="tf-logo-stable">Stable</span>
          </div>
        </div>

      </div>
    </section>
  );
}
