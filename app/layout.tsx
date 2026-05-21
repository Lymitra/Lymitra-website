import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/ThemeContext";

export const metadata: Metadata = {
  title: "Lymitra — Autonomous Crypto Payroll",
  description: "Pay your team. Agents handle everything else. Powered by Somnia Agentic L1.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
