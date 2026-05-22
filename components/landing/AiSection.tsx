"use client";

import { useEffect, useRef, useState } from "react";

const LOG_ENTRIES = [
  { tag: "WATCHING",   cls: "al-blue",  msg: "STT rate at $0.031 · too low · waiting for better price" },
  { tag: "HOLDING",    cls: "al-dim",   msg: "Your tokens are safe in the vault · not selling yet" },
  { tag: "WATCHING",   cls: "al-blue",  msg: "STT rate up to $0.051 · looking good" },
  { tag: "AI",         cls: "al-blue",  msg: "Best moment found · converting to USDC now" },
  { tag: "CONVERTED",  cls: "al-blue",  msg: "Tokens → 18,500 USDC · best rate secured" },
  { tag: "PAID",       cls: "al-green", msg: "6 employees paid · 18,500 USDC · 0.8s" },
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
