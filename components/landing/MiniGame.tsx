"use client";

import { useState, useRef } from "react";

const EMPLOYEES = [
  { name: "Alex",   salary: 500, avatar: "👩‍💻" },
  { name: "Marcus", salary: 500, avatar: "👨‍🔧" },
  { name: "Yuki",   salary: 500, avatar: "👩‍🎨" },
];
const TOTAL_SALARY = EMPLOYEES.reduce((s, e) => s + e.salary, 0);
const CLICK_AMOUNT = 150;

export function MiniGame() {
  const [vault,   setVault]   = useState(0);
  const [paid,    setPaid]    = useState<boolean[]>([false, false, false]);
  const [runs,    setRuns]    = useState(0);
  const [paying,  setPaying]  = useState(false);
  const [ripples, setRipples] = useState<number[]>([]);
  const rippleId = useRef(0);

  function addFunds() {
    if (paying) return;
    const next = Math.min(vault + CLICK_AMOUNT, TOTAL_SALARY);
    setVault(next);

    const id = ++rippleId.current;
    setRipples((r) => [...r, id]);
    setTimeout(() => setRipples((r) => r.filter((x) => x !== id)), 600);

    if (next >= TOTAL_SALARY) startPaying();
  }

  function startPaying() {
    setPaying(true);
    EMPLOYEES.forEach((_, i) => {
      setTimeout(() => {
        setPaid((p) => { const n = [...p]; n[i] = true; return n; });
      }, i * 350);
    });
    setTimeout(() => {
      setVault(0);
      setPaid([false, false, false]);
      setPaying(false);
      setRuns((r) => r + 1);
    }, 1800);
  }

  const pct = Math.round((vault / TOTAL_SALARY) * 100);

  return (
    <section className="mg-section">
      <div className="mg-eyebrow">Payroll Rush · Mini-game</div>
      <h2 className="mg-heading">
        See what we do —<br />
        <span className="accent">in 10 seconds.</span>
      </h2>
      <p className="mg-subtext">
        Tap the vault to fund it. Watch your team get paid automatically.
        {runs > 0 && <span style={{ color: "var(--accent)", marginLeft: 6 }}>You&apos;ve run payroll {runs}× so far!</span>}
      </p>

      <div className="minigame">
        <div className="mg-label">
          Fund the vault
          <span style={{ marginLeft: "auto", color: "var(--text3)", fontSize: 11 }}>
            {runs > 0 ? `${runs} run${runs > 1 ? "s" : ""} · saving you hours every month` : "click the vault to add funds"}
          </span>
        </div>

        <div className="mg-body">
          {/* Vault button */}
          <div className="mg-vault-wrap">
            <button className="mg-vault" onClick={addFunds} disabled={paying}>
              {paying ? "⚡" : "🏦"}
              {ripples.map((id) => (
                <span key={id} className="mg-ripple" />
              ))}
            </button>
            <div className="mg-vault-lbl">+${CLICK_AMOUNT} / tap</div>
          </div>

          {/* Progress */}
          <div className="mg-progress-wrap">
            <div className="mg-progress-track">
              <div
                className="mg-progress-fill"
                style={{ width: `${pct}%`, transition: "width 0.3s ease" }}
              />
            </div>
            <div className="mg-progress-labels">
              <span>${vault.toLocaleString()}</span>
              <span style={{ color: pct === 100 ? "var(--accent)" : "var(--text3)" }}>
                {pct === 100 ? "✓ Funded!" : `$${TOTAL_SALARY.toLocaleString()} target`}
              </span>
            </div>
            {paying && (
              <div className="mg-paying-badge">
                <span className="mg-pulse-dot" /> Paying team…
              </div>
            )}
          </div>

          {/* Employees */}
          <div className="mg-team">
            {EMPLOYEES.map((e, i) => (
              <div key={e.name} className={`mg-emp${paid[i] ? " mg-emp-paid" : ""}`}>
                <div className="mg-avatar">{e.avatar}</div>
                <div className="mg-emp-name">{e.name}</div>
                <div className="mg-emp-sal">${e.salary}</div>
                {paid[i] && <div className="mg-paid-badge">Paid ✓</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="mg-footer">
          In real Lymitra — this happens automatically on payday. Zero clicks needed.
        </div>
      </div>
    </section>
  );
}
