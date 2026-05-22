"use client";

import { useAccount } from "wagmi";
import { useCompany, useEmployees, fmtUsdc } from "@/lib/hooks";
import { Zap, Brain, CalendarCheck, CheckCircle, Circle, ArrowRight } from "lucide-react";

type Panel = "vault" | "payments" | "dashboard" | "aichat" | "myagent" | "earn" | "analytics";
interface MyAgentProps { onNav?: (panel: Panel) => void }

export function MyAgent({ onNav }: MyAgentProps) {
  const { address, isConnected } = useAccount();
  const { data: company }   = useCompany(address);
  const { data: employees } = useEmployees(address);

  const isRegistered   = company?.owner === address;
  const hasDeposit     = isRegistered && company != null &&
    ((company.usdcBalance as bigint) > 0n || (company.somiBalance as bigint) > 0n);
  const hasEmployees   = employees ? (employees as unknown[]).length > 0 : false;
  const agentsEnabled  = isRegistered && !!(company?.agentsEnabled);
  const hasSchedule    = isRegistered && company != null && (company.nextPayrollMs as bigint) > 0n;

  // Determine next action
  const nextStep =
    !isConnected  ? "connect" :
    !isRegistered ? "register" :
    !hasDeposit   ? "deposit" :
    !hasEmployees ? "employees" :
    !hasSchedule  ? "schedule" :
    "done";

  const steps = [
    {
      n: 1,
      label: "Register company",
      sub: "One-time setup in Vault",
      done: isRegistered,
      panel: "vault" as Panel,
    },
    {
      n: 2,
      label: "Deposit SOMI",
      sub: "Fund vault — AI converts to USDC at the best rate",
      done: hasDeposit,
      panel: "vault" as Panel,
    },
    {
      n: 3,
      label: "Add employees",
      sub: "Set wallets and salaries",
      done: hasEmployees,
      panel: "payments" as Panel,
    },
    {
      n: 4,
      label: "Schedule payroll",
      sub: "This transaction activates the agents",
      done: agentsEnabled || hasSchedule,
      panel: "payments" as Panel,
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;

  const agents = [
    {
      Icon: Zap,
      name: "Rate Watch",
      desc: "Monitors SOMI/USDC rate every 60 seconds using Somnia's JSON API Agent — fully on-chain, no server.",
      activeAfter: "Step 2 — deposit SOMI",
      live: hasDeposit,
    },
    {
      Icon: Brain,
      name: "LLM Decision",
      desc: "Somnia's on-chain AI analyzes the rate and decides: convert now or wait 24 h? Runs 7 days before each payday.",
      activeAfter: "Step 4 — schedule payroll",
      live: agentsEnabled || hasSchedule,
    },
    {
      Icon: CalendarCheck,
      name: "Payroll Execution",
      desc: "On payday, Somnia Reactivity fires the contract automatically. All employees receive USDC in a single block.",
      activeAfter: "Step 4 — schedule payroll",
      live: agentsEnabled || hasSchedule,
    },
  ];

  return (
    <div>
      <div className="sec-hd">
        <div>
          <div className="sec-ht">My Agent</div>
          <div className="sec-hs">Autonomous agents · Powered by Somnia Reactivity</div>
        </div>
        {agentsEnabled && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(79,196,144,0.1)", border: "1px solid rgba(79,196,144,0.25)", borderRadius: 100, padding: "5px 13px", fontSize: 12, color: "#4FC490", fontWeight: 600 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4FC490", animation: "pulse 1.8s ease-in-out infinite", display: "inline-block" }} />
            Agents live
          </div>
        )}
      </div>

      {/* Activation checklist */}
      <div className="card" style={{ marginBottom: "1.25rem" }}>
        <div className="card-h">
          <div className="card-t">Activation checklist</div>
          <div style={{ fontSize: 12, color: completedCount === 4 ? "#4FC490" : "var(--text3)", fontWeight: 500 }}>
            {completedCount} / 4 complete
          </div>
        </div>
        <div style={{ padding: "0.5rem 0" }}>
          {steps.map((s) => (
            <div
              key={s.n}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "0.85rem 1.4rem",
                borderBottom: s.n < 4 ? "1px solid var(--border)" : "none",
                opacity: s.done ? 1 : 0.75,
              }}
            >
              {s.done
                ? <CheckCircle size={18} color="#4FC490" style={{ flexShrink: 0 }} />
                : <Circle size={18} color="var(--text3)" style={{ flexShrink: 0 }} />
              }
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: s.done ? 400 : 600, color: s.done ? "var(--text3)" : "var(--text)", textDecoration: s.done ? "line-through" : "none" }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--text3)", marginTop: 2 }}>{s.sub}</div>
              </div>
              {!s.done && onNav && (
                <button
                  className="tb-btn"
                  style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 5 }}
                  onClick={() => onNav(s.panel)}
                >
                  Go <ArrowRight size={11} />
                </button>
              )}
            </div>
          ))}
        </div>

        {nextStep === "done" && (
          <div style={{ margin: "0 1.4rem 1.1rem", padding: "0.85rem 1rem", borderRadius: 10, background: "rgba(79,196,144,0.08)", border: "1px solid rgba(79,196,144,0.2)", fontSize: 13, color: "#4FC490", textAlign: "center" }}>
            All steps complete — agents are active and monitoring
          </div>
        )}
      </div>

      {/* Agent cards */}
      <div className="agent-grid">
        {agents.map(({ Icon, name, desc, activeAfter, live }) => (
          <div className="agent-card" key={name}>
            <div className="ac-header">
              <div className="ac-icon" style={{ background: live ? "rgba(79,196,144,0.1)" : "var(--accent-dim)", color: live ? "#4FC490" : "var(--accent)" }}>
                <Icon size={16} strokeWidth={1.6} />
              </div>
              <div>
                <div className="ac-name">{name}</div>
                <div className="ac-status" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: live ? "#4FC490" : "var(--text3)", display: "inline-block", animation: live ? "pulse 1.8s ease-in-out infinite" : "none" }} />
                  <span style={{ color: live ? "#4FC490" : "var(--text3)" }}>{live ? "Active" : "Waiting"}</span>
                </div>
              </div>
            </div>
            <div className="ac-desc">{desc}</div>
            <div className="ac-when">Activates after: {activeAfter}</div>
          </div>
        ))}
      </div>

      {/* Action log */}
      <div className="card" style={{ marginTop: "1.25rem" }}>
        <div className="card-h">
          <div className="card-t">Action log</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text3)" }}>
            <div className="ag-led" style={{ width: 6, height: 6 }} />
            Live
          </div>
        </div>
        <div style={{ padding: "2.5rem", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 6 }}>
            {agentsEnabled ? "Waiting for first agent event…" : "No agent activity yet"}
          </div>
          <div style={{ fontSize: 12, color: "var(--text3)", opacity: 0.7 }}>
            Rate checks, LLM decisions, and payroll executions will appear here in real time once agents are active.
          </div>
        </div>
      </div>
    </div>
  );
}
