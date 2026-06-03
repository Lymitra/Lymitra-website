"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

function Img({ src, size = 16, radius = "50%" }: { src: string; size?: number; radius?: string }) {
  return (
    <Image src={src} width={size} height={size} alt="" unoptimized
      style={{ borderRadius: radius, display: "block", flexShrink: 0 }} />
  );
}

function AppleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function GooglePlayLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 20.5v-17c0-.83.94-1.3 1.6-.8l14 8.5c.6.37.6 1.23 0 1.6l-14 8.5c-.66.5-1.6.03-1.6-.8z" />
    </svg>
  );
}

/* ── SCREEN 1: Dashboard ─────────────────────────── */
function PhoneDashboard() {
  return (
    <Image src="/screenshots/home-dark.png" alt="Home Screen" width={294} height={600} unoptimized style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  );
}

/* ── SCREEN 2: Vault / Deposit ───────────────────── */
function PhoneVault() {
  return (
    <Image src="/screenshots/vault-dark.png" alt="Vault Screen" width={294} height={600} unoptimized style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  );
}

/* ── SCREEN 3: Payroll Running ───────────────────── */
function PhonePay() {
  return (
    <Image src="/screenshots/payroll-dark.png" alt="Payroll Screen" width={294} height={600} unoptimized style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  );
}

/* ── Main export ─────────────────────────────────── */
export function AppPreview() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); }),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="mobile-app" className="app-preview-sec" ref={ref}>
      <div className="reveal" style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div className="sec-eyebrow">Mobile App</div>
        <h2 className="sec-h">Your payroll desk. <span className="accent">In your pocket.</span></h2>
        <p style={{ color: "var(--text3)", fontSize: "0.95rem", maxWidth: 460, margin: "0.5rem auto 0" }}>
          Pay your team, monitor rates, and manage your vault, from anywhere in the world.
        </p>
      </div>

      {/* Phones */}
      <div className="app-phones-row reveal">
        <div className="phone-wrap phone-side">
          <div className="phone-label">Vault</div>
          <div className="phone-frame">
            <div className="phone-notch" />
            <div className="phone-screen"><PhoneVault /></div>
          </div>
        </div>

        <div className="phone-wrap phone-center">
          <div className="phone-label">Dashboard</div>
          <div className="phone-frame phone-frame-featured">
            <div className="phone-notch" />
            <div className="phone-screen"><PhoneDashboard /></div>
          </div>
        </div>

        <div className="phone-wrap phone-side">
          <div className="phone-label">Payroll</div>
          <div className="phone-frame">
            <div className="phone-notch" />
            <div className="phone-screen"><PhonePay /></div>
          </div>
        </div>
      </div>

      {/* Store buttons */}
      <div className="reveal" style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "2.5rem", flexWrap: "wrap" }}>
        <a className="store-btn" href="https://expo.dev/accounts/tevinprime66/projects/lymitra-mobile/builds/9011101e-3829-467d-adfd-230912d5adf0" target="_blank" rel="noopener noreferrer">
          <AppleLogo />
          <div className="store-btn-text">
            <span className="store-btn-sub">Download on the</span>
            <span className="store-btn-main">App Store</span>
          </div>
        </a>
        <a className="store-btn" href="https://expo.dev/accounts/tevinprime66/projects/lymitra-mobile/builds/9011101e-3829-467d-adfd-230912d5adf0" target="_blank" rel="noopener noreferrer">
          <GooglePlayLogo />
          <div className="store-btn-text">
            <span className="store-btn-sub">Get it on</span>
            <span className="store-btn-main">Google Play</span>
          </div>
        </a>
      </div>

      <div className="reveal" style={{ textAlign: "center", marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <Img src="/logos/somnia-logomark-1.svg" size={13} radius="0" />
        <span style={{ fontSize: "0.75rem", color: "var(--text3)" }}>Built on Somnia</span>
      </div>
    </section>
  );
}
