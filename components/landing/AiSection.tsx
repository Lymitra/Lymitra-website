"use client";

import { useEffect, useRef, useState } from "react";
import { Bot } from "lucide-react";

const LOG_ENTRIES = [
  { tag: "ORACLE",    cls: "al-cyan",   msg: "SOMI/USD $0.031 · ETH/USD $2,480 · BTC/USD $94,200 · rates read on-chain" },
  { tag: "AI",        cls: "al-purple", msg: "BTC and ETH stable · SOMI trending up · holding for better window" },
  { tag: "WATCHING",  cls: "al-yellow", msg: "Checking again in 24h. No conversion yet, rates still climbing" },
  { tag: "AI",        cls: "al-purple", msg: "Optimal window reached · converting SOMI + ETH + BTC + BNB to USDC" },
  { tag: "CONVERTED", cls: "al-cyan",   msg: "All volatile holdings → 18,500 USDC · best rate secured" },
  { tag: "PAID",      cls: "al-green",  msg: "6 employees paid in USDC · 18,500 total · 0.8s · 0 failures" },
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
    <section id="agents" className="ai-sec" ref={ref}>
      <div className="ai-inner">
        {/* Left */}
        <div className="reveal">
          <div className="ai-eyebrow-badge">
            <Bot size={13} strokeWidth={2} />
            Somnia AI agents
          </div>
          <h2 className="sec-h">
            The AI works.<br />
            <span className="accent">You don&apos;t have to.</span>
          </h2>
          <p className="sec-sub" style={{ marginTop: "1rem", maxWidth: 400 }}>
            Three agents run on-chain: one watches prices, one decides when to convert, one fires payroll. You&apos;re not in the loop. On purpose.
          </p>

          <div className="ai-stats">
            <div className="ai-stat">
              <div className="ai-stat-n ai-stat-glow">24/7</div>
              <div className="ai-stat-l">Always watching rates</div>
            </div>
            <div className="ai-stat-div" />
            <div className="ai-stat">
              <div className="ai-stat-n ai-stat-glow">0.8s</div>
              <div className="ai-stat-l">Avg payroll time</div>
            </div>
            <div className="ai-stat-div" />
            <div className="ai-stat">
              <div className="ai-stat-n ai-stat-glow">~$0</div>
              <div className="ai-stat-l">Gas on Somnia</div>
            </div>
          </div>
        </div>

        {/* Right — animated agent log */}
        <div className="reveal ai-log-wrap">
          <div className="ai-log">
            <div className="al-bar">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className="al-dot" />
                <span className="al-title">Agent activity</span>
              </div>
              <div className="al-live-badge">
                <span className="al-live-dot" />
                LIVE
              </div>
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
              {visible >= LOG_ENTRIES.length && (
                <div className="al-thinking-row">
                  <span className="al-tag al-purple">AI</span>
                  <span className="al-thinking-dots">
                    {[0, 1, 2].map(n => (
                      <span key={n} className="al-think-dot" style={{ animationDelay: `${n * 0.18}s` }} />
                    ))}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
