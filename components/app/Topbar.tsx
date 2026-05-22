"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

type Panel = "dashboard" | "aichat" | "myagent" | "vault" | "payments" | "earn" | "analytics";

const meta: Record<Panel, [string, string]> = {
  dashboard: ["Dashboard",  "Portfolio overview · Somnia Shannon"],
  aichat:    ["AI Chat",    "Powered by Somnia on-chain LLM"],
  myagent:   ["My Agent",   "Autonomous agents · On-chain reactivity"],
  vault:     ["Vault",      "Non-custodial treasury · Somnia Shannon"],
  payments:  ["Payments",   "Agent-executed payroll · USDC"],
  earn:      ["Earn",       "SOMI staking · Protocol rewards"],
  analytics: ["Analytics",  "Transaction history · All activity"],
};

interface TopbarProps {
  active: Panel;
}

const notifications: { text: string; time: string }[] = [];

export function Topbar({ active }: TopbarProps) {
  const [page, sub] = meta[active];
  const [bellOpen, setBellOpen] = useState(false);

  return (
    <div className="topbar">
      <div className="tb-l">
        <div className="tb-page">{page}</div>
        <div className="tb-sub">{sub}</div>
      </div>

      <div className="tb-r">
        {/* Notification bell */}
        <div style={{ position: "relative" }}>
          <button
            className="tb-bell"
            onClick={() => setBellOpen((o) => !o)}
            aria-label="Notifications"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M8 1.5C5.51 1.5 3.5 3.51 3.5 6v3.5L2 11h12l-1.5-1.5V6C12.5 3.51 10.49 1.5 8 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              <path d="M6.5 11.5C6.5 12.33 7.17 13 8 13C8.83 13 9.5 12.33 9.5 11.5" stroke="currentColor" strokeWidth="1.3"/>
            </svg>
            <span className="tb-bell-dot" />
          </button>

          {bellOpen && (
            <div className="notif-dropdown">
              <div className="notif-head">Notifications</div>
              {notifications.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center" }}>
                  <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 4 }}>All caught up</div>
                  <div style={{ fontSize: 12, color: "var(--text3)", opacity: 0.7 }}>Agent events will appear here</div>
                </div>
              ) : notifications.map((n, i) => (
                <div className="notif-row" key={i}>
                  <div className="notif-body">
                    <div className="notif-text">{n.text}</div>
                    <div className="notif-time">{n.time} ago</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RainbowKit connect button */}
        <ConnectButton
          showBalance={false}
          chainStatus="icon"
          accountStatus="avatar"
        />
      </div>
    </div>
  );
}
