"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Dashboard } from "./panels/Dashboard";
import { AiChat } from "./panels/AiChat";
import { MyAgent } from "./panels/MyAgent";
import { Vault } from "./panels/Vault";
import { Payments } from "./panels/Payments";
import { Earn } from "./panels/Earn";
import { Analytics } from "./panels/Analytics";

type Panel = "dashboard" | "aichat" | "myagent" | "vault" | "payments" | "earn" | "analytics";

interface AppShellProps {
  onGoLanding: () => void;
}

const mobileNav: { id: Panel; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Home",     icon: <svg width="18" height="18" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/></svg> },
  { id: "myagent",   label: "Agent",    icon: <svg width="18" height="18" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="7" cy="7" r="2" fill="currentColor" opacity="0.4"/><circle cx="4.5" cy="5" r="0.8" fill="currentColor"/><circle cx="9.5" cy="5" r="0.8" fill="currentColor"/></svg> },
  { id: "vault",     label: "Vault",    icon: <svg width="18" height="18" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="2" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M7 5V4M7 10V9M9 7h1M4 7h1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { id: "payments",  label: "Pay",      icon: <svg width="18" height="18" viewBox="0 0 14 14" fill="none"><circle cx="5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M1 12C1 9.8 2.8 8 5 8C7.2 8 9 9.8 9 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="10.5" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M13 12C13 10.3 11.9 9 10.5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> },
  { id: "earn",      label: "Earn",     icon: <svg width="18" height="18" viewBox="0 0 14 14" fill="none"><path d="M7 1L12 3.5V10.5L7 13L2 10.5V3.5L7 1Z" stroke="currentColor" strokeWidth="1.3"/><path d="M7 4.5V7.5M5.5 6H8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { id: "aichat",    label: "Lyra",     icon: <svg width="18" height="18" viewBox="0 0 14 14" fill="none"><path d="M2 2.5C2 1.67 2.67 1 3.5 1h7C11.33 1 12 1.67 12 2.5v6C12 9.33 11.33 10 10.5 10H8L5 13v-3H3.5C2.67 10 2 9.33 2 8.5v-6z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg> },
  { id: "analytics", label: "Stats",    icon: <svg width="18" height="18" viewBox="0 0 14 14" fill="none"><path d="M2 11L5 7.5L7.5 9.5L11 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><circle cx="11" cy="5" r="1.2" fill="currentColor"/></svg> },
];

export function AppShell({ onGoLanding }: AppShellProps) {
  const [active, setActive] = useState<Panel>("dashboard");

  function renderPanel() {
    switch (active) {
      case "dashboard": return <Dashboard onNav={setActive} />;
      case "aichat":    return <AiChat />;
      case "myagent":   return <MyAgent onNav={setActive} />;
      case "vault":     return <Vault onSuccess={() => setActive("dashboard")} />;
      case "payments":  return <Payments />;
      case "earn":      return <Earn />;
      case "analytics": return <Analytics />;
    }
  }

  return (
    <div style={{ display: "flex", position: "fixed", inset: 0, background: "var(--bg)" }}>
      <Sidebar active={active} onNav={setActive} onGoLanding={onGoLanding} />
      <div className="main">
        <Topbar active={active} />
        <div className="content">{renderPanel()}</div>
      </div>

      {/* Mobile bottom nav — CSS shows this only on ≤768px */}
      <nav className="mobile-nav">
        {mobileNav.map((item) => (
          <button
            key={item.id}
            className={`mn-item${active === item.id ? " on" : ""}`}
            onClick={() => setActive(item.id)}
          >
            <span className="mn-ic">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
