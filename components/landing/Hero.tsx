"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface HeroProps {
  onLaunchApp: () => void;
}

const TEAM = [
  { name: "Alex Kim",    role: "Engineering Lead",  salary: "$4,500", av: "AK" },
  { name: "Sofia Reyes", role: "Product Design",    salary: "$3,800", av: "SR" },
  { name: "Marcus N.",   role: "Smart Contracts",   salary: "$4,200", av: "MN" },
];

export function Hero({ onLaunchApp }: HeroProps) {
  const cardRef   = useRef<HTMLDivElement>(null);
  const glowRef   = useRef<HTMLDivElement>(null);
  const btnRef    = useRef<HTMLButtonElement>(null);
  const [paidIdx, setPaidIdx] = useState(-1);
  const [running, setRunning] = useState(false);
  const [total,   setTotal]   = useState(0);
  const [done,    setDone]    = useState(false);

  // Payroll loop animation
  useEffect(() => {
    let timeouts: ReturnType<typeof setTimeout>[] = [];

    function runCycle() {
      setPaidIdx(-1);
      setTotal(0);
      setDone(false);
      setRunning(true);

      const salaries = [4500, 3800, 4200];
      let running_total = 0;

      TEAM.forEach((_, i) => {
        const t = setTimeout(() => {
          setPaidIdx(i);
          running_total += salaries[i];
          setTotal(running_total);
          if (i === TEAM.length - 1) {
            setTimeout(() => setDone(true), 400);
          }
        }, 900 + i * 700);
        timeouts.push(t);
      });

      const reset = setTimeout(() => {
        setRunning(false);
        timeouts = [];
        setTimeout(runCycle, 1800);
      }, 900 + TEAM.length * 700 + 2000);
      timeouts.push(reset);
    }

    const initial = setTimeout(runCycle, 800);
    return () => {
      clearTimeout(initial);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  // Mouse glow spotlight on card
  const onMouseMove = useCallback((e: MouseEvent) => {
    const card = cardRef.current;
    const glow = glowRef.current;
    if (!card || !glow) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    glow.style.background = `radial-gradient(300px circle at ${x}px ${y}px, rgba(91,127,255,0.12), transparent 70%)`;
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    card.addEventListener("mousemove", onMouseMove);
    return () => card.removeEventListener("mousemove", onMouseMove);
  }, [onMouseMove]);

  // Magnetic pull on CTA button
  const onBtnMouseMove = useCallback((e: MouseEvent) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width  / 2;
    const y = e.clientY - rect.top  - rect.height / 2;
    btn.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
  }, []);

  const onBtnMouseLeave = useCallback(() => {
    if (btnRef.current) btnRef.current.style.transform = "translate(0,0)";
  }, []);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    btn.addEventListener("mousemove", onBtnMouseMove);
    btn.addEventListener("mouseleave", onBtnMouseLeave);
    return () => {
      btn.removeEventListener("mousemove", onBtnMouseMove);
      btn.removeEventListener("mouseleave", onBtnMouseLeave);
    };
  }, [onBtnMouseMove, onBtnMouseLeave]);

  return (
    <section className="hero hero-split">
      <div className="hero-grid" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* ── Left: copy ── */}
      <div className="hero-left">
        <div className="h-badge">
          <span className="h-badge-dot" />
          Autonomous payroll · Live on Somnia
        </div>

        <h1 className="hero-h">
          Pay your team.<br />
          <span className="accent">Never think</span><br />
          about it again.
        </h1>

        <p className="h-sub">
          Deposit once. Add your team. Set a date.
          Lymitra automatically converts and pays everyone in stable dollars —
          every month, on time, without you lifting a finger.
        </p>

        <div className="cta-row" style={{ justifyContent: "flex-start" }}>
          <button
            ref={btnRef}
            className="btn-primary"
            onClick={onLaunchApp}
            style={{ transition: "transform 0.15s ease, opacity 0.2s" }}
          >
            Get started free
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <a className="btn-ghost" href="#how">See how it works</a>
        </div>

        <div className="hero-stats">
          <div className="hstat">
            <div className="hstat-n">5 min</div>
            <div className="hstat-l">Setup</div>
          </div>
          <div className="hstat-div" />
          <div className="hstat">
            <div className="hstat-n">$0</div>
            <div className="hstat-l">Monthly fee</div>
          </div>
          <div className="hstat-div" />
          <div className="hstat">
            <div className="hstat-n" style={{ color: "var(--accent)" }}>100%</div>
            <div className="hstat-l">Automatic</div>
          </div>
          <div className="hstat-div" />
          <div className="hstat">
            <div className="hstat-n">&lt;1s</div>
            <div className="hstat-l">Pay execution</div>
          </div>
        </div>
      </div>

      {/* ── Right: live payroll card ── */}
      <div className="hero-right">
        <div className="pay-card" ref={cardRef}>
          <div ref={glowRef} className="pay-card-glow" />

          <div className="pay-card-header">
            <div>
              <div className="pay-card-title">June Payroll</div>
              <div className="pay-card-sub">Somnia Shannon · USDC</div>
            </div>
            <div className={`pay-status ${done ? "pay-status-done" : "pay-status-run"}`}>
              {done ? "✓ Complete" : running ? "⚡ Running…" : "Scheduled"}
            </div>
          </div>

          <div className="pay-divider" />

          <div className="pay-employees">
            {TEAM.map((emp, i) => {
              const isPaid = paidIdx >= i;
              return (
                <div key={emp.name} className={`pay-row ${isPaid ? "pay-row-paid" : ""}`}>
                  <div className="pay-av">{emp.av}</div>
                  <div className="pay-emp-info">
                    <div className="pay-emp-name">{emp.name}</div>
                    <div className="pay-emp-role">{emp.role}</div>
                  </div>
                  <div className="pay-right-col">
                    <div className="pay-amount">{emp.salary}</div>
                    <div className={`pay-badge ${isPaid ? "pay-badge-paid" : "pay-badge-pending"}`}>
                      {isPaid ? "Paid ✓" : "Pending"}
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
            <div className="pay-exec-badge">
              Executed in 0.8s · 0 failures
            </div>
          )}
        </div>

        {/* Floating secondary card */}
        <div className="pay-mini-card">
          <div className="pmc-dot" />
          <div>
            <div className="pmc-label">Next payroll</div>
            <div className="pmc-val">Jul 1 · Auto</div>
          </div>
        </div>
      </div>
    </section>
  );
}
