"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface HeroProps {
  onLaunchApp: () => void;
}

const TEAM = [
  { name: "Alex Kim",    role: "Engineering Lead",  salary: "$4,500", initials: "AK" },
  { name: "Sofia Reyes", role: "Product Design",    salary: "$3,800", initials: "SR" },
  { name: "Marcus N.",   role: "Smart Contracts",   salary: "$4,200", initials: "MN" },
];

export function Hero({ onLaunchApp }: HeroProps) {
  const sectionRef  = useRef<HTMLElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const rightRef    = useRef<HTMLDivElement>(null);

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
    sp.style.background = `radial-gradient(600px circle at ${e.clientX - r.left}px ${e.clientY - r.top}px, rgba(91,127,255,0.10), transparent 65%)`;
  }, []);

  const onSectionLeave = useCallback(() => {
    if (spotlightRef.current) spotlightRef.current.style.background = "";
  }, []);

  // 3D perspective tilt on the card column
  const onRightMove = useCallback((e: MouseEvent) => {
    const el = rightRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
    const cy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
    el.style.transform  = `perspective(900px) rotateY(${cx * 9}deg) rotateX(${-cy * 7}deg)`;
    el.style.transition = "transform 0.08s ease";
  }, []);

  const onRightLeave = useCallback(() => {
    const el = rightRef.current;
    if (!el) return;
    el.style.transform  = "";
    el.style.transition = "transform 0.55s ease";
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
            Pay your team.<br />
            <span className="accent">Automatically.</span>
          </h1>

          <p className="h-sub">
            Deposit USDC once. Our AI picks the optimal payroll moment
            and pays every employee — every month, without you.
          </p>

          <div className="cta-row" style={{ justifyContent: "flex-start" }}>
            <button className="btn-primary" onClick={onLaunchApp}>
              Get started free
            </button>
            <a className="btn-ghost" href="#how">How it works</a>
          </div>

          <div className="hero-trust">
            <span className="ht-item">Deposit USDC</span>
            <span className="ht-sep">·</span>
            <span className="ht-item">AI-optimized timing</span>
            <span className="ht-sep">·</span>
            <span className="ht-item">On-chain vault</span>
            <span className="ht-sep">·</span>
            <span className="ht-item">5 min setup</span>
          </div>
        </div>

        {/* Right — 3D tilt payroll card */}
        <div
          className="hero-right"
          ref={rightRef}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="pay-card">
            <div className="pay-card-header">
              <div>
                <div className="pay-card-title">June Payroll</div>
                <div className="pay-card-sub">Somnia · USDC</div>
              </div>
              <div className={`pay-status ${done ? "pay-status-done" : "pay-status-run"}`}>
                {done ? "Complete" : running ? "Running" : "Scheduled"}
              </div>
            </div>

            <div className="pay-divider" />

            <div className="pay-employees">
              {TEAM.map((emp, i) => {
                const paid = paidIdx >= i;
                return (
                  <div key={emp.name} className={`pay-row${paid ? " pay-row-paid" : ""}`}>
                    <div className="pay-av">{emp.initials}</div>
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
