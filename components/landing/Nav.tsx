"use client";

import { Logo } from "@/components/ui/Logo";
import { useTheme } from "@/components/ui/ThemeContext";
import { Sun, Moon } from "lucide-react";

export function Nav() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="l-nav">
      <div className="l-logo">
        <Logo size={26} />
        <span className="l-wm">lymitra</span>
      </div>
      <ul className="l-links">
        <li><a href="#how">How it works</a></li>
        <li><a href="#rate-rush">Rate Rush</a></li>
        <li><a href="#mobile-app">Mobile App</a></li>
      </ul>
      <div className="l-nav-right">
        <button className="theme-btn-land" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </nav>
  );
}
