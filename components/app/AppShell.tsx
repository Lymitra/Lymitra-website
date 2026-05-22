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
    </div>
  );
}
