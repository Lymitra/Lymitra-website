"use client";

import { useAccount } from "wagmi";
import { useCompany, useEmployees, useAgentAddress } from "@/lib/hooks";
import { Zap, Brain, CalendarCheck, CheckCircle, Circle, ArrowRight, Shield, ShieldOff, ExternalLink } from "lucide-react";

type Panel = "vault" | "payments" | "dashboard" | "aichat" | "myagent" | "earn" | "analytics";
interface MyAgentProps { onNav?: (panel: Panel) => void }

export function MyAgent({ onNav }: MyAgentProps) {
  const { address, isConnected } = useAccount();
  const { data: company }     = useCompany(address);
  const { data: employees }   = useEmployees(address);
  const { data: agentAddr }   = useAgentAddress();

  const isRegistered  = company?.owner === address;
  const hasDeposit    = isRegistered && company != null && (
    (company.usdcBalance as bigint) > 0n || (company.usdtBalance as bigint) > 0n ||
    (company.somiBalance as bigint) > 0n || (company.wethBalance as bigint) > 0n ||
    (company.wbtcBalance as bigint) > 0n || (company.wbnbBalance as bigint) > 0n
  );
  const hasEmployees  = employees ? (employees as unknown[]).length > 0 : false;
  const agentsEnabled = isRegistered && !!(company?.agentsEnabled);
  const hasSchedule   = isRegistered && company != null && (company.nextPayrollMs as bigint) > 0n;
  const allLive       = agentsEnabled || hasSchedule;

  const steps = [
    { n: 1, label: "Register company",   sub: "One-time setup in Vault",                                              done: isRegistered,          panel: "vault"    as Panel },
    { n: 2, label: "Deposit tokens",     sub: "SOMI, ETH, BTC, BNB, USDC, or USDT",                                 done: hasDeposit,            panel: "vault"    as Panel },
    { n: 3, label: "Add employees",      sub: "Set wallet addresses and salaries",                                    done: hasEmployees,          panel: "payments" as Panel },
    { n: 4, label: "Schedule payroll",   sub: "This activates all three on-chain agents",                            done: agentsEnabled || hasSchedule, panel: "payments" as Panel },
  ];
  const completedCount = steps.filter((s) => s.done).length;
  const pct = Math.round((completedCount / 4) * 100);

  const agents = [
    {
      Icon: Zap,
      name: "Rate Watch",
      code: ["oracle.read(SOMI/USD)", "oracle.read(ETH/USD)", "oracle.read(BTC/USD)"],
      result: hasDeposit ? "> rates loaded ✓" : "> awaiting deposit…",
      live: hasDeposit,
      color: "#5B7FFF",
    },
    {
      Icon: Brain,
      name: "LLM Decision",
      code: ["analyze(rates, 7d_window)", "if rate > avg: CONVERT", "else: WAIT 24h"],
      result: allLive ? "> decision queued ✓" : "> awaiting schedule…",
      live: allLive,
      color: "#3ED9B8",
    },
    {
      Icon: CalendarCheck,
      name: "Payroll Execution",
      code: ["on(payday)", "convert(vault → USDC)", "pay(employees[])"],
      result: allLive ? "> on-chain ready ✓" : "> awaiting schedule…",
      live: allLive,
      color: "#F3BA2F",
    },
  ];

  return (
    <div>

      {/* ── Mission control header ── */}
      <div className="mac-header">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--accent)", textTransform: "uppercase", marginBottom: 6 }}>
              Mission Control
            </div>
            <div className="mac-title">My Agent</div>
            <div className="mac-sub">Autonomous on-chain agents · Powered by Somnia Reactivity</div>
          </div>
          {allLive ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(79,196,144,0.12)", border: "1px solid rgba(79,196,144,0.3)", borderRadius: 100, padding: "6px 14px", fontSize: 12, color: "#4FC490", fontWeight: 700, flexShrink: 0 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4FC490", animation: "pulse 1.8s ease-in-out infinite", display: "inline-block" }} />
              All agents live
            </div>
          ) : isConnected ? (
            <div style={{ fontSize: 11, color: "var(--text3)", flexShrink: 0, paddingTop: 4 }}>{pct}% ready</div>
          ) : null}
        </div>

        {/* Progress bar */}
        <div className="mac-progress-bar-bg">
          <div className="mac-progress-bar" style={{ width: `${pct}%` }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "var(--text3)" }}>
          <span>{completedCount} of 4 steps complete</span>
          {pct < 100 && <span style={{ color: "var(--accent)" }}>Complete setup to go live</span>}
          {pct === 100 && <span style={{ color: "#4FC490" }}>Agents are watching</span>}
        </div>
      </div>

      {/* ── Activation steps ── */}
      <div className="card" style={{ marginBottom: "1.25rem" }}>
        <div className="card-h">
          <div className="card-t">Activation checklist</div>
        </div>
        <div>
          {steps.map((s, idx) => {
            const isNext = !s.done && steps.slice(0, idx).every(p => p.done);
            return (
              <div key={s.n} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "0.9rem 1.4rem",
                borderBottom: idx < 3 ? "1px solid var(--border)" : "none",
                background: isNext ? "rgba(91,127,255,0.04)" : "transparent",
                transition: "background 0.2s",
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700,
                  background: s.done ? "#4FC490" : isNext ? "var(--accent)" : "var(--bg3)",
                  color: s.done || isNext ? "#fff" : "var(--text3)",
                  border: s.done || isNext ? "none" : "1.5px solid var(--border2)",
                  boxShadow: isNext ? "0 0 0 4px rgba(91,127,255,0.2)" : "none",
                  animation: isNext ? "lyra-glow 2s infinite" : "none",
                }}>
                  {s.done ? <CheckCircle size={13} /> : s.n}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 13.5, fontWeight: s.done ? 400 : 600,
                    color: s.done ? "var(--text3)" : "var(--text)",
                    textDecoration: s.done ? "line-through" : "none",
                  }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--text3)", marginTop: 2 }}>{s.sub}</div>
                </div>
                {!s.done && onNav && (
                  <button className="tb-btn" style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 5 }} onClick={() => onNav(s.panel)}>
                    {isNext ? "Do this →" : "Go"} <ArrowRight size={11} />
                  </button>
                )}
                {s.done && <CheckCircle size={15} color="#4FC490" style={{ flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>
        {completedCount === 4 && (
          <div style={{ margin: "0.75rem 1.4rem", padding: "0.75rem 1rem", borderRadius: 10, background: "rgba(79,196,144,0.08)", border: "1px solid rgba(79,196,144,0.2)", fontSize: 13, color: "#4FC490", textAlign: "center" }}>
            All done — agents are active and monitoring every block
          </div>
        )}
      </div>

      {/* ── Agent terminal cards ── */}
      <div className="mac-agents">
        {agents.map(({ Icon, name, code, result, live, color }) => (
          <div key={name} className={`mac-agent-card${live ? " live" : ""}`}>
            <div className="mac-ac-top">
              <div className="mac-ac-dots">
                <div className="mac-ac-dot" style={{ background: live ? "#4FC490" : "var(--border2)" }} />
                <div className="mac-ac-dot" style={{ background: live ? color + "99" : "var(--border)" }} />
                <div className="mac-ac-dot" style={{ background: "var(--border)" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  background: live ? `${color}18` : "var(--bg2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={11} color={live ? color : "var(--text3)"} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: live ? color : "var(--text3)", textTransform: "uppercase" }}>
                  {live ? "Live" : "Off"}
                </span>
              </div>
            </div>
            <div className="mac-ac-body">
              <div className="mac-ac-label">{name}</div>
              {code.map((line, i) => (
                <div key={i} className="mac-ac-line" style={{ color: i === 0 ? "var(--text2)" : "var(--text3)" }}>
                  <span style={{ color: "rgba(91,127,255,0.5)", marginRight: 6 }}>{String(i + 1).padStart(2, "0")}</span>
                  {line}
                </div>
              ))}
              <div className="mac-ac-line green" style={{ marginTop: 8 }}>
                {result}
                {live && <span style={{ marginLeft: 6, display: "inline-block", width: 6, height: 10, background: "#4FC490", borderRadius: 1, animation: "blink 1.1s step-end infinite", verticalAlign: "middle" }} />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Action log ── */}
      <div className="mac-log">
        <div className="mac-log-top">
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div className="ag-led" />
            <span className="mac-log-title">Action log</span>
          </div>
          <span style={{ fontSize: 10, color: "var(--text3)", fontFamily: "inherit" }}>live stream</span>
        </div>
        <div className="mac-log-body">
          {allLive ? (
            <>
              <div className="mac-log-line"><span className="ts">00:00:00</span><span className="ev">INIT</span><span className="mu"> agents started on Somnia Reactivity</span></div>
              <div className="mac-log-line"><span className="ts">00:00:01</span><span className="ev">WATCH</span><span className="mu"> reading SOMI/USD from DIA oracle…</span></div>
              <div className="mac-log-line"><span className="ts">--:--:--</span><span className="mu dim"> waiting for next rate check window</span><span style={{ marginLeft: 6, display: "inline-block", width: 7, height: 11, background: "#4FC490", borderRadius: 1, animation: "blink 1.1s step-end infinite", verticalAlign: "middle" }} /></div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div className="mac-log-line"><span className="ts">--:--:--</span><span className="mu dim"> no agent activity yet</span></div>
              <div className="mac-log-line"><span className="ts">--:--:--</span><span className="mu dim"> complete setup above to activate</span></div>
              <div className="mac-log-line"><span className="ts">--:--:--</span><span className="mu"> awaiting signal</span><span style={{ marginLeft: 6, display: "inline-block", width: 7, height: 11, background: "var(--text3)", borderRadius: 1, animation: "blink 1.1s step-end infinite", verticalAlign: "middle" }} /></div>
            </div>
          )}
        </div>
      </div>

      {/* ── Agent wallet info card ── */}
      <div className="card" style={{ marginTop: "1.25rem" }}>
        <div className="card-h">
          <div className="card-t">Lymitra Agent Wallet</div>
          {agentAddr && agentAddr !== "0x0000000000000000000000000000000000000000" ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(79,196,144,0.1)", border: "1px solid rgba(79,196,144,0.25)", borderRadius: 100, padding: "3px 10px", fontSize: 11, color: "#4FC490", fontWeight: 700 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4FC490", animation: "pulse 1.8s ease-in-out infinite", display: "inline-block" }} />
              Active
            </div>
          ) : (
            <div style={{ fontSize: 11, color: "var(--text3)", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 100, padding: "3px 10px" }}>
              Not configured
            </div>
          )}
        </div>

        <div style={{ padding: "0 1.4rem 1.2rem" }}>
          {/* Description */}
          <p style={{ fontSize: 13.5, color: "var(--text2)", lineHeight: 1.65, margin: "0 0 1.1rem" }}>
            Lymitra has its own on-chain AI wallet that runs autonomously in the background.
            It watches your payroll schedule and executes token conversions and salary payments
            automatically — <strong style={{ color: "var(--text)" }}>no MetaMask popup, no manual action needed.</strong>
          </p>

          {/* Agent address */}
          {agentAddr && agentAddr !== "0x0000000000000000000000000000000000000000" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.1rem", padding: "0.7rem 1rem", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text3)", textTransform: "uppercase", marginBottom: 3 }}>On-chain address</div>
                <div style={{ fontSize: 12, color: "var(--text)", fontFamily: "monospace", wordBreak: "break-all" }}>
                  {agentAddr.slice(0, 8)}…{agentAddr.slice(-6)}
                </div>
              </div>
              <a
                href={`https://shannon-explorer.somnia.network/address/${agentAddr}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent)", flexShrink: 0, display: "flex", alignItems: "center" }}
                title="View on Somnia Explorer"
              >
                <ExternalLink size={13} />
              </a>
            </div>
          )}

          {/* Can / Cannot grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {/* Can do */}
            <div style={{ padding: "0.9rem 1rem", background: "rgba(79,196,144,0.06)", border: "1px solid rgba(79,196,144,0.2)", borderRadius: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <Shield size={13} color="#4FC490" />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#4FC490", textTransform: "uppercase", letterSpacing: "0.07em" }}>Can do</span>
              </div>
              {[
                "Watch oracle prices 24/7",
                "Convert volatile tokens to USDC/USDT",
                "Execute payroll on schedule",
              ].map(t => (
                <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: 7, marginBottom: 7, fontSize: 12, color: "var(--text2)", lineHeight: 1.4 }}>
                  <CheckCircle size={11} color="#4FC490" style={{ flexShrink: 0, marginTop: 2 }} />
                  {t}
                </div>
              ))}
            </div>

            {/* Cannot do */}
            <div style={{ padding: "0.9rem 1rem", background: "rgba(255,107,107,0.05)", border: "1px solid rgba(255,107,107,0.18)", borderRadius: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <ShieldOff size={13} color="#ff6b6b" />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#ff6b6b", textTransform: "uppercase", letterSpacing: "0.07em" }}>Cannot do</span>
              </div>
              {[
                "Withdraw your funds",
                "Add or remove employees",
                "Change any settings",
              ].map(t => (
                <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: 7, marginBottom: 7, fontSize: 12, color: "var(--text2)", lineHeight: 1.4 }}>
                  <Circle size={11} color="#ff6b6b" style={{ flexShrink: 0, marginTop: 2 }} />
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 10, padding: "0.65rem 1rem", background: "rgba(91,127,255,0.07)", border: "1px solid rgba(91,127,255,0.18)", borderRadius: 8, fontSize: 12, color: "var(--text3)", lineHeight: 1.5 }}>
            The agent wallet is registered directly in the vault smart contract. Only Lymitra&apos;s deployer can update or revoke it — it cannot be changed by anyone else.
          </div>
        </div>
      </div>
    </div>
  );
}
