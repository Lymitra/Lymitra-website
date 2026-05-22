"use client";

import { useEffect, useRef, useState } from "react";

const LOG_ENTRIES = [
  { tag: "RATE_WATCH", cls: "al-blue",  msg: "STT/USDC → $0.031 · below threshold · holding" },
  { tag: "HOLDING",    cls: "al-dim",   msg: "Tokens held in vault · still appreciating · no sale" },
  { tag: "RATE_WATCH", cls: "al-blue",  msg: "STT/USDC → $0.051 · upward trend confirmed" },
  { tag: "LLM_AGENT",  cls: "al-blue",  msg: "Decision: CONVERT NOW · optimal window open" },
  { tag: "CONVERT",    cls: "al-blue",  msg: "363,000 STT → 18,500 USDC · slippage 0.02%" },
  { tag: "PAYROLL",    cls: "al-green", msg: "Disbursed to 6 employees · 18,500 USDC · 0.8s" },
];

export function AiSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); }),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (visible >= LOG_ENTRIES.length) return;
    const t = setTimeout(() => setVisible((v) => v + 1), 900);
    return () => clearTimeout(t);
  }, [visible]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(1); },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="ai-sec" ref={ref}>
      <div className="ai-inner">
        {/* Left */}
        <div className="reveal">
          <div className="sec-eyebrow">Somnia AI agents</div>
          <h2 className="sec-h">
            The AI works.<br />
            <span className="accent">You don&apos;t have to.</span>
          </h2>
          <p className="sec-sub" style={{ marginTop: "1rem", maxWidth: 400 }}>
            Lymitra runs on-chain AI agents continuously — watching rates,
            choosing the right moment, and executing payroll automatically
            on Somnia.
          </p>

          <div className="ai-stats">
            <div className="ai-stat">
              <div className="ai-stat-n">24/7</div>
              <div className="ai-stat-l">Always running</div>
            </div>
            <div className="ai-stat-div" />
            <div className="ai-stat">
              <div className="ai-stat-n">0.8s</div>
              <div className="ai-stat-l">Avg execution time</div>
            </div>
            <div className="ai-stat-div" />
            <div className="ai-stat">
              <div className="ai-stat-n">$0</div>
              <div className="ai-stat-l">Gas on Somnia</div>
            </div>
          </div>
        </div>

        {/* Right — animated agent log */}
        <div className="reveal ai-log-wrap">
          <div className="ai-log">
            <div className="al-bar">
              <div className="al-dot" />
              <span className="al-title">Agent activity — live</span>
            </div>
            <div className="al-feed">
              {LOG_ENTRIES.slice(0, visible).map((e, i) => (
                <div className="al-row" key={i}>
                  <span className={`al-tag ${e.cls}`}>{e.tag}</span>
                  <span className="al-msg">{e.msg}</span>
                </div>
              ))}
              {visible < LOG_ENTRIES.length && (
                <div className="al-cursor" />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
