"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface HeroProps {
  onLaunchApp: () => void;
}

const TEAM = [
  { name: "Alex Kim",    role: "Product Lead",   salary: "$4,500", avatar: "https://i.pravatar.cc/80?img=11" },
  { name: "Sofia Reyes", role: "Designer",       salary: "$3,800", avatar: "https://i.pravatar.cc/80?img=5"  },
  { name: "Marcus N.",   role: "Lead Engineer",  salary: "$4,200", avatar: "https://i.pravatar.cc/80?img=52" },
];

export function Hero({ onLaunchApp }: HeroProps) {
  const sectionRef  = useRef<HTMLElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const rightRef    = useRef<HTMLDivElement>(null);
  const glareRef    = useRef<HTMLDivElement>(null);

  const [paidIdx, setPaidIdx] = useState(-1);
  const [running, setRunning] = useState(false);
  const [total,   setTotal]   = useState(0);
  const [done,    setDone]    = useState(false);

  useEffect(() => {
    let timers: ReturnType<typeof setTimeout>[] = [];
    function cycle() {
      setPaidIdx(-1); setTotal(0); setDone(false); setRunning(true);
      const amounts = [4500, 3800, 4200];
      let acc = 0;
      TEAM.forEach((_, i) => {
        const t = setTimeout(() => {
          acc += amounts[i];
          setPaidIdx(i);
          setTotal(acc);
          if (i === TEAM.length - 1) setTimeout(() => setDone(true), 400);
        }, 900 + i * 600);
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

  // Soft spotlight follows cursor across the whole hero
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

  // Strong 3D tilt + card glare
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
            AI-powered payroll on Somnia
          </div>

          <h1 className="hero-h">
            Hold crypto.<br />
            <span className="accent">Pay in stablecoins.</span>
          </h1>

          <p className="h-sub">
            Deposit ETH or STT. Our AI converts at the right moment
            and pays your team in USDC — every month, automatically.
          </p>

          <div className="cta-row" style={{ justifyContent: "flex-start" }}>
            <button className="btn-primary" onClick={onLaunchApp}>
              Get started free
            </button>
            <a className="btn-ghost" href="#how">How it works</a>
          </div>

          <div className="hero-trust">
            <span className="ht-item">No manual transfers. Ever.</span>
            <span className="ht-sep">·</span>
            <span className="ht-item">Your team gets paid while you sleep.</span>
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
                <div className="pay-card-title">June Payroll</div>
                <div className="pay-card-sub">Somnia · USDC</div>
              </div>
              <div className={`pay-status ${done ? "pay-status-done" : "pay-status-run"}`}>
                {done ? "Complete" : running ? "Running" : "Scheduled"}
              </div>
            </div>

            {/* Progress bar */}
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
                      <div className="pay-emp-role">{emp.role}</div>
                    </div>
                    <div className="pay-right-col">
                      <div className="pay-amount">{emp.salary}</div>
                      <div className={`pay-badge ${paid ? "pay-badge-paid" : "pay-badge-pending"}`}>
                        {paid ? "Paid" : "Pending"}
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
                ${total.toLocaleString()} <span className="pay-total-token">USDC</span>
              </div>
            </div>

            {done && (
              <div className="pay-exec-badge">Executed in 0.8s · 0 failures · 1% fee</div>
            )}
          </div>

          <div className="pay-mini-card">
            <div className="pmc-dot" />
            <div>
              <div className="pmc-label">Next payroll</div>
              <div className="pmc-val">Jul 1 · Automatic</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
