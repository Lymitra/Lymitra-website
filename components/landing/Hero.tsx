"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

interface HeroProps {}

const TEAM = [
  { name: "Alex Kim",    role: "Product Lead",   salary: "$4,500", amount: 4500, avatar: "https://i.pravatar.cc/80?img=11" },
  { name: "Sofia Reyes", role: "UX Designer",    salary: "$3,200", amount: 3200, avatar: "https://i.pravatar.cc/80?img=5"  },
  { name: "Marcus N.",   role: "Lead Engineer",  salary: "$6,800", amount: 6800, avatar: "https://i.pravatar.cc/80?img=52" },
];
// Staggered delays in ms — mimic real block confirmation variation
const PAY_DELAYS = [880, 1540, 2310];

function currentPayrollLabel() {
  const now = new Date();
  return now.toLocaleString("en-US", { month: "long" }) + " Payroll";
}
function nextPayrollLabel() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return next.toLocaleString("en-US", { month: "short" }) + " 1 · Automatic";
}

function TokenLogo({ src, alt, size = 18 }: { src: string; alt: string; size?: number }) {
  return (
    <Image src={src} width={size} height={size} alt={alt} unoptimized style={{ borderRadius: "50%", display: "block" }} />
  );
}

export function Hero({}: HeroProps) {
  const sectionRef  = useRef<HTMLElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const rightRef    = useRef<HTMLDivElement>(null);
  const glareRef    = useRef<HTMLDivElement>(null);

  const [paidIdx,    setPaidIdx]    = useState(-1);
  const [running,    setRunning]    = useState(false);
  const [total,      setTotal]      = useState(0);
  const [done,       setDone]       = useState(false);
  const [paidTimes,  setPaidTimes]  = useState<string[]>([]);
  const [paidHashes, setPaidHashes] = useState<string[]>([]);
  const [curLabel,   setCurLabel]   = useState(currentPayrollLabel);
  const [nextLabel,  setNextLabel]  = useState(nextPayrollLabel);

  useEffect(() => {
    const id = setInterval(() => {
      setCurLabel(currentPayrollLabel());
      setNextLabel(nextPayrollLabel());
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let timers: ReturnType<typeof setTimeout>[] = [];
    function cycle() {
      setPaidIdx(-1); setTotal(0); setDone(false); setRunning(true);
      setPaidTimes([]); setPaidHashes([]);
      let acc = 0;
      TEAM.forEach((emp, i) => {
        const t = setTimeout(() => {
          acc += emp.amount;
          setPaidIdx(i);
          setTotal(acc);
          const ts   = new Date().toLocaleTimeString("en-US", { hour12: false });
          const hash = "0x" + Math.random().toString(16).slice(2, 7) + "…" + Math.random().toString(16).slice(2, 6);
          setPaidTimes( prev => { const n = [...prev]; n[i] = ts;   return n; });
          setPaidHashes(prev => { const n = [...prev]; n[i] = hash; return n; });
          if (i === TEAM.length - 1) setTimeout(() => setDone(true), 400);
        }, PAY_DELAYS[i]);
        timers.push(t);
      });
      const reset = setTimeout(() => {
        setRunning(false);
        timers = [];
        setTimeout(cycle, 2200);
      }, 900 + TEAM.length * 600 + 1800);
      timers.push(reset);
    }
    const init = setTimeout(cycle, 500);
    return () => { clearTimeout(init); timers.forEach(clearTimeout); };
  }, []);

  const onSectionMove = useCallback((e: MouseEvent) => {
    const s = sectionRef.current;
    const sp = spotlightRef.current;
    if (!s || !sp) return;
    const r = s.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    sp.style.background = `radial-gradient(1000px circle at ${x}px ${y}px, rgba(91,127,255,0.28) 0%, rgba(91,127,255,0.08) 40%, transparent 70%)`;
  }, []);

  const onSectionLeave = useCallback(() => {
    if (spotlightRef.current) spotlightRef.current.style.background = "";
  }, []);

  const onRightMove = useCallback((e: MouseEvent) => {
    const el = rightRef.current;
    const glare = glareRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
    const cy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
    el.style.transform  = `perspective(700px) rotateY(${cx * 20}deg) rotateX(${-cy * 15}deg) scale(1.03)`;
    el.style.transition = "transform 0.06s ease";
    if (glare) {
      const gx = ((e.clientX - r.left) / r.width) * 100;
      const gy = ((e.clientY - r.top)  / r.height) * 100;
      glare.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 50%, transparent 70%)`;
    }
  }, []);

  const onRightLeave = useCallback(() => {
    const el = rightRef.current;
    const glare = glareRef.current;
    if (!el) return;
    el.style.transform  = "";
    el.style.transition = "transform 0.65s cubic-bezier(0.16,1,0.3,1)";
    if (glare) glare.style.background = "";
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const right   = rightRef.current;
    if (!section || !right) return;
    section.addEventListener("mousemove",  onSectionMove  as EventListener);
    section.addEventListener("mouseleave", onSectionLeave as EventListener);
    right.addEventListener("mousemove",    onRightMove    as EventListener);
    right.addEventListener("mouseleave",   onRightLeave   as EventListener);
    return () => {
      section.removeEventListener("mousemove",  onSectionMove  as EventListener);
      section.removeEventListener("mouseleave", onSectionLeave as EventListener);
      right.removeEventListener("mousemove",    onRightMove    as EventListener);
      right.removeEventListener("mouseleave",   onRightLeave   as EventListener);
    };
  }, [onSectionMove, onSectionLeave, onRightMove, onRightLeave]);

  return (
    <section className="hero" ref={sectionRef}>
      <div className="hero-grid" />
      <div ref={spotlightRef} className="hero-spotlight" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="hero-split">
        {/* Left — copy */}
        <div className="hero-left">
          <div className="h-badge">
            <span className="h-badge-dot" />
            Available on iOS &amp; Android
          </div>

          <h1 className="hero-h">
            Crypto in.<br />
            <span className="accent">Payday, out.</span>
          </h1>

          <p className="h-sub">
            Add your team once. The AI converts your deposits to stablecoins and pays everyone on schedule.
          </p>

          <div className="cta-row" style={{ justifyContent: "flex-start" }}>
            <a className="btn-primary" href="#mobile-app">
              Get Started
            </a>
          </div>

          {/* Two-row token strip — inputs vs output */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: "1.25rem" }}>
            {/* Volatile deposits */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "var(--text3)", fontWeight: 500, minWidth: 52 }}>Deposit:</span>
              {[
                { label: "SOMI", src: "/logos/somi-token-roundel-1.png" },
                { label: "ETH",  src: "/logos/eth.png"  },
                { label: "BTC",  src: "/logos/btc.png"  },
                { label: "BNB",  src: "/logos/bnb.png"  },
              ].map(({ label, src }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, background: "var(--bg2)", borderRadius: 20, padding: "3px 10px 3px 5px" }}>
                  <TokenLogo src={src} alt={label} size={18} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text2)" }}>{label}</span>
                </div>
              ))}
            </div>
            {/* Stable output */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "var(--text3)", fontWeight: 500, minWidth: 52 }}>Pays in:</span>
              {[
                { label: "USDC", src: "/logos/usdc.png" },
                { label: "USDT", src: "/logos/usdt.png" },
              ].map(({ label, src }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(79,196,144,0.07)", border: "1px solid rgba(79,196,144,0.18)", borderRadius: 20, padding: "3px 10px 3px 5px" }}>
                  <TokenLogo src={src} alt={label} size={18} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#4FC490" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right — 3D tilt payroll card */}
        <div
          className="hero-right"
          ref={rightRef}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="pay-card">
            <div className="pay-glare" ref={glareRef} />
            <div className="pay-card-header">
              <div>
                <div className="pay-card-title">{curLabel}</div>
                <div className="pay-card-sub">Somnia · USDC / USDT</div>
              </div>
              <div className={`pay-status ${done ? "pay-status-done" : "pay-status-run"}`}>
                {done ? "Complete" : running ? "Running" : "Scheduled"}
              </div>
            </div>

            <div className="pay-progress-wrap">
              <div
                className="pay-progress-bar"
                style={{ width: `${paidIdx < 0 ? 0 : Math.round(((paidIdx + 1) / TEAM.length) * 100)}%` }}
              />
            </div>
            <div className="pay-progress-label">
              <span>{paidIdx < 0 ? 0 : paidIdx + 1} of {TEAM.length} paid</span>
              <span>{paidIdx < 0 ? 0 : Math.round(((paidIdx + 1) / TEAM.length) * 100)}%</span>
            </div>

            <div className="pay-divider" />

            <div className="pay-employees">
              {TEAM.map((emp, i) => {
                const paid = paidIdx >= i;
                return (
                  <div key={emp.name} className={`pay-row${paid ? " pay-row-paid" : ""}`}>
                    <div className={`pay-av-wrap${paid ? " pay-av-paid" : ""}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="pay-av" src={emp.avatar} alt={emp.name} />
                      {paid && <div className="pay-av-check">✓</div>}
                    </div>
                    <div className="pay-emp-info">
                      <div className="pay-emp-name">{emp.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div className="pay-emp-role">{emp.role}</div>
                        {paid && paidHashes[i] && (
                          <span style={{ fontSize: 9, color: "rgba(79,196,144,0.55)", fontFamily: "monospace", letterSpacing: "0.02em" }}>
                            {paidHashes[i]}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="pay-right-col">
                      <div className="pay-amount">{emp.salary}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        {paid && paidTimes[i] && (
                          <span style={{ fontSize: 9, color: "rgba(79,196,144,0.7)", fontFamily: "monospace" }}>
                            {paidTimes[i]}
                          </span>
                        )}
                        <div className={`pay-badge ${paid ? "pay-badge-paid" : "pay-badge-pending"}`}>
                          {paid ? "Paid" : "Pending"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pay-divider" />

            <div className="pay-footer">
              <div className="pay-total-label">Total disbursed</div>
              <div className="pay-total-amt">
                ${total.toLocaleString()} <span className="pay-total-token">USDC/USDT</span>
              </div>
            </div>

          </div>

          <div className="pay-mini-card">
            <div className="pmc-dot" />
            <div>
              <div className="pmc-label">Next payroll</div>
              <div className="pmc-val">{nextLabel}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
