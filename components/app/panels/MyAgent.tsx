"use client";

import { useAccount } from "wagmi";
import { useCompany } from "@/lib/hooks";
import { Zap, Brain, CalendarCheck, Circle, ArrowRight } from "lucide-react";

type Panel = "vault" | "payments" | "dashboard" | "aichat" | "myagent" | "earn" | "analytics";
interface MyAgentProps { onNav?: (panel: Panel) => void }

const agentTypes = [
  {
    Icon: Zap,
    name: "Rate Watch Agent",
    desc: "Monitors SOMI and ETH rates every 60 seconds across multiple sources. Flags the optimal conversion window before your payroll date.",
    when: "Activates when you deposit funds into your vault.",
  },
  {
    Icon: Brain,
    name: "LLM Decision Agent",
    desc: "Uses Somnia's on-chain AI to decide the exact moment to convert your tokens to USDC — balancing market conditions against your payday deadline.",
    when: "Activates 7 days before each scheduled payroll run.",
  },
  {
    Icon: CalendarCheck,
    name: "Payroll Execution Agent",
    desc: "Fires all employee transfers in a single block via Somnia Reactivity on your payday. Every employee receives USDC in under 1 second.",
    when: "Activates on the payday date you set in Payments.",
  },
];

export function MyAgent({ onNav }: MyAgentProps) {
  const { address, isConnected } = useAccount();
  const { data: company } = useCompany(address);
  const isRegistered = company?.owner === address;

  return (
    <div>
      <div className="sec-hd">
        <div>
          <div className="sec-ht">My Agent</div>
          <div className="sec-hs">Autonomous agents · Running on Somnia Reactivity</div>
        </div>
      </div>

      {isConnected && !isRegistered && (
        <div className="agent-setup-banner">
          <div className="asb-left">
            <div className="ag-led" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>Agents are ready to activate</div>
              <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: 2 }}>
                Register your company and deposit funds to start your autonomous payroll agents.
              </div>
            </div>
          </div>
          {onNav && (
            <button className="dh-btn p" style={{ flexShrink: 0 }} onClick={() => onNav("vault")}>
              Set up vault <ArrowRight size={12} style={{ display: "inline", verticalAlign: "middle", marginLeft: 4 }} />
            </button>
          )}
        </div>
      )}

      <div className="agent-grid">
        {agentTypes.map(({ Icon, name, desc, when }) => (
          <div className="agent-card" key={name}>
            <div className="ac-header">
              <div className="ac-icon"><Icon size={16} strokeWidth={1.6} /></div>
              <div>
                <div className="ac-name">{name}</div>
                <div className="ac-status">
                  <Circle size={5} fill={isRegistered ? "#4FC490" : "var(--text3)"} stroke="none"
                    style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                  {isRegistered ? "Active" : "Waiting for setup"}
                </div>
              </div>
            </div>
            <div className="ac-desc">{desc}</div>
            <div className="ac-when">{when}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: "1.25rem" }}>
        <div className="card-h">
          <div className="card-t">Action log</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "11px", color: "var(--text3)" }}>
            <div className="ag-led" style={{ width: 6, height: 6 }} />Live
          </div>
        </div>
        <div style={{ padding: "2.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "13px", color: "var(--text3)", marginBottom: 6 }}>No agent actions yet</div>
          <div style={{ fontSize: "12px", color: "var(--text3)", opacity: 0.7 }}>
            Rate checks, conversions, and payroll executions will appear here in real time.
          </div>
        </div>
      </div>
    </div>
  );
}
