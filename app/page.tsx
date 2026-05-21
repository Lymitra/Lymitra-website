"use client";

import { useState } from "react";
import { Providers } from "./providers";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { AiSection } from "@/components/landing/AiSection";
import { TokenFlow } from "@/components/landing/TokenFlow";
import { AgentSection } from "@/components/landing/AgentSection";
import { MiniGame } from "@/components/landing/MiniGame";
import { Footer } from "@/components/landing/Footer";
import { AppShell } from "@/components/app/AppShell";

export default function Home() {
  const [view, setView] = useState<"landing" | "app">("landing");

  return (
    <Providers>
      {view === "landing" ? (
        <div>
          <Nav onLaunchApp={() => setView("app")} />
          <Hero onLaunchApp={() => setView("app")} />
          <TokenFlow />
          <HowItWorks />
          <AiSection />
          <AgentSection />
<MiniGame onLaunchApp={() => setView("app")} />
          <Footer onGoLanding={() => setView("landing")} />
        </div>
      ) : (
        <AppShell onGoLanding={() => setView("landing")} />
      )}
    </Providers>
  );
}
