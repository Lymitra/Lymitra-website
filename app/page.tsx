"use client";

import { useState } from "react";
import { Providers } from "./providers";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { AgentSection } from "@/components/landing/AgentSection";
import { Chains } from "@/components/landing/Chains";
import { FinalCta } from "@/components/landing/FinalCta";
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
          <HowItWorks />
          <AgentSection onLaunchApp={() => setView("app")} />
          <Chains />
          <FinalCta onLaunchApp={() => setView("app")} />
          <MiniGame />
          <Footer onGoLanding={() => setView("landing")} />
        </div>
      ) : (
        <AppShell onGoLanding={() => setView("landing")} />
      )}
    </Providers>
  );
}
