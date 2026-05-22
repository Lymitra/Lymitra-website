"use client";

import { Logo } from "@/components/ui/Logo";
import { useTheme } from "@/components/ui/ThemeContext";
import { Sun, Moon } from "lucide-react";

type Panel = "dashboard" | "aichat" | "myagent" | "vault" | "payments" | "earn" | "analytics";

interface SidebarProps {
  active: Panel;
  onNav: (panel: Panel) => void;
  onGoLanding: () => void;
}

const mainNav: { id: Panel; label: string; icon: React.ReactNode }[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/></svg>,
  },
  {
    id: "myagent",
    label: "My Agent",
    icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/><circle cx="7" cy="7" r="2" fill="currentColor" opacity="0.4"/><circle cx="4.5" cy="5" r="0.8" fill="currentColor"/><circle cx="9.5" cy="5" r="0.8" fill="currentColor"/></svg>,
  },
  {
    id: "aichat",
    label: "AI Chat",
    icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2.5C2 1.67 2.67 1 3.5 1h7C11.33 1 12 1.67 12 2.5v6C12 9.33 11.33 10 10.5 10H8L5 13v-3H3.5C2.67 10 2 9.33 2 8.5v-6z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  },
  {
    id: "payments",
    label: "Payments",
    icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.2"/><path d="M1 12C1 9.8 2.8 8 5 8C7.2 8 9 9.8 9 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="10.5" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.1"/><path d="M13 12C13 10.3 11.9 9 10.5 9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>,
  },
  {
    id: "vault",
    label: "Vault",
    icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="2" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.2"/><path d="M7 5V4M7 10V9M9 7h1M4 7h1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  },
  {
    id: "earn",
    label: "Earn",
    icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L12 3.5V10.5L7 13L2 10.5V3.5L7 1Z" stroke="currentColor" strokeWidth="1.2"/><path d="M7 4.5V7.5M5.5 6H8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  },
];

const bottomNav: { id: Panel; label: string; icon: React.ReactNode }[] = [
  {
    id: "analytics",
    label: "Analytics",
    icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 11L5 7.5L7.5 9.5L11 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="11" cy="5" r="1.2" fill="currentColor"/></svg>,
  },
];

export function Sidebar({ active, onNav, onGoLanding }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="sb">
      <div className="sb-logo" onClick={onGoLanding}>
        <Logo size={26} />
        <div>
          <div className="sb-wm">lymitra</div>
          <div className="sb-tag">Autonomous Payroll</div>
        </div>
      </div>

      <nav className="sb-nav">
        {mainNav.map((item) => (
          <div
            key={item.id}
            className={`sb-item${active === item.id ? " on" : ""}`}
            onClick={() => onNav(item.id)}
          >
            <div className="sb-ic">{item.icon}</div>
            <span className="sb-lbl">{item.label}</span>
          </div>
        ))}

        <div className="sb-divider" />

        {bottomNav.map((item) => (
          <div
            key={item.id}
            className={`sb-item${active === item.id ? " on" : ""}`}
            onClick={() => onNav(item.id)}
          >
            <div className="sb-ic">{item.icon}</div>
            <span className="sb-lbl">{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="sb-bot">
        <div className="sb-net-row">
          <div className="net-dot" />
          <span style={{ fontSize: "11.5px", color: "var(--text2)" }}>Somnia Shannon</span>
          <span style={{ fontSize: "10px", color: "#3ED9B8", marginLeft: "auto", display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: "#3ED9B8", display: "inline-block" }} />Live</span>
        </div>
        <button className="theme-btn-app" onClick={toggleTheme}>
          <span>{theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}</span>
          <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        </button>
      </div>
    </aside>
  );
}
