"use client";

import { Logo } from "@/components/ui/Logo";
import { useTheme } from "@/components/ui/ThemeContext";

interface NavProps {
  onLaunchApp: () => void;
}

export function Nav({ onLaunchApp }: NavProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="l-nav">
      <div className="l-logo" onClick={onLaunchApp}>
        <Logo size={26} />
        <span className="l-wm">lymitra</span>
      </div>
      <ul className="l-links">
        <li><a href="#how">How it works</a></li>
        <li><a href="#agents-l">Agents</a></li>
        <li><a href="#chains-l">Chains</a></li>
      </ul>
      <div className="l-nav-right">
        <button className="theme-btn-land" onClick={toggleTheme}>
          {theme === "dark" ? "☀" : "☾"}
        </button>
        <div className="l-cta" onClick={onLaunchApp}>Launch app →</div>
      </div>
    </nav>
  );
}
