"use client";

import { Logo } from "@/components/ui/Logo";

interface FooterProps {
  onGoLanding: () => void;
}

export function Footer({ onGoLanding }: FooterProps) {
  return (
    <footer className="l-foot">
      <div className="l-logo" onClick={onGoLanding} style={{ cursor: "pointer" }}>
        <Logo size={20} />
        <span className="l-wm" style={{ fontSize: 15 }}>lymitra</span>
      </div>
<div className="f-links">
        <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X" style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L2.058 2.25H8.08l4.225 5.593zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          X
        </a>
        <a href="https://t.me" target="_blank" rel="noopener noreferrer" aria-label="Telegram" style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.67l-2.95-.924c-.64-.204-.658-.64.136-.954l11.57-4.461c.532-.194.998.13.968.89z"/>
          </svg>
          Telegram
        </a>
        <a href="https://discord.com" target="_blank" rel="noopener noreferrer" aria-label="Discord" style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.055a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.995a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          Discord
        </a>
      </div>
    </footer>
  );
}
