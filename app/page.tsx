"use client";

import { Providers } from "./providers";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { AppPreview } from "@/components/landing/AppPreview";
import { TokenFlow } from "@/components/landing/TokenFlow";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <Providers>
      <Nav />
      <Hero />
      <HowItWorks />
      <TokenFlow />
      <AppPreview />
      <Footer />
    </Providers>
  );
}
