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
  const tokens = [
    { sym: "SOMI", logo: "/logos/somi-token-roundel-1.png", bal: "1,240.00", usd: "$5,890" },
    { sym: "ETH",  logo: "/logos/eth.png",                  bal: "1.82",     usd: "$4,730" },
    { sym: "BTC",  logo: "/logos/btc.png",                  bal: "0.062",    usd: "$4,120" },
    { sym: "USDC", logo: "/logos/usdc.png",                  bal: "2,104.00", usd: "$2,104" },
  ];
  return (
    <div style={{ padding: "12px 9px 8px", display: "flex", flexDirection: "column", gap: 7, height: "100%", boxSizing: "border-box" }}>
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Img src="/lymitra-mark-only.svg" size={14} radius="0" />
          <span style={{ fontSize: 8, fontWeight: 700, color: "var(--text)", letterSpacing: "0.04em" }}>Techflow Inc.</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Img src="/logos/somnia-logomark-1.svg" size={11} radius="0" />
          <span style={{ fontSize: 7, color: "var(--text3)", fontWeight: 500 }}>Somnia</span>
        </div>
      </div>

      {/* Portfolio card */}
      <div style={{ background: "linear-gradient(135deg,rgba(91,127,255,0.18),rgba(56,201,160,0.12))", border: "1px solid rgba(91,127,255,0.22)", borderRadius: 10, padding: "9px 10px" }}>
        <div style={{ fontSize: 6.5, color: "var(--text3)", marginBottom: 2 }}>Total Portfolio</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.04em", lineHeight: 1 }}>$16,844</div>
        <div style={{ fontSize: 6.5, color: "#4FC490", marginTop: 3 }}>+3.1% today</div>
      </div>

      {/* AI badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(79,196,144,0.09)", border: "1px solid rgba(79,196,144,0.22)", borderRadius: 20, padding: "4px 8px" }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#4FC490", flexShrink: 0 }} />
        <span style={{ fontSize: 7, color: "#4FC490", fontWeight: 600 }}>AI Payroll Active · Next: Jun 1</span>
      </div>

      {/* Token rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {tokens.map(({ sym, logo, bal, usd }) => (
          <div key={sym} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Img src={logo} size={16} />
              <div>
                <div style={{ fontSize: 7.5, fontWeight: 600, color: "var(--text)" }}>{sym}</div>
                <div style={{ fontSize: 6, color: "var(--text3)" }}>{bal}</div>
              </div>
            </div>
            <div style={{ fontSize: 7.5, fontWeight: 600, color: "var(--text2)" }}>{usd}</div>
          </div>
        ))}
      </div>

      {/* Bottom nav */}
      <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-around", borderTop: "1px solid var(--border)", paddingTop: 6 }}>
        {["Home", "Vault", "Pay", "Earn", "Profile"].map((t, i) => (
          <span key={t} style={{ fontSize: 6, color: i === 0 ? "var(--accent)" : "var(--text3)", fontWeight: i === 0 ? 700 : 400 }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

/* ── SCREEN 2: Vault / Deposit ───────────────────── */
function PhoneVault() {
  const assets = [
    { sym: "SOMI", logo: "/logos/somi-token-roundel-1.png", amt: "1,240", pct: 60, color: "#9B7FFF" },
    { sym: "ETH",  logo: "/logos/eth.png",                  amt: "1.82",  pct: 48, color: "#627EEA" },
    { sym: "BTC",  logo: "/logos/btc.png",                  amt: "0.062", pct: 35, color: "#F7931A" },
    { sym: "BNB",  logo: "/logos/bnb.png",                  amt: "3.10",  pct: 22, color: "#F3BA2F" },
  ];
  return (
    <div style={{ padding: "12px 9px 8px", display: "flex", flexDirection: "column", gap: 7, height: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 8.5, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.01em" }}>Vault</span>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Img src="/logos/somnia-logomark-1.svg" size={11} radius="0" />
          <span style={{ fontSize: 7, color: "var(--text3)" }}>Somnia</span>
        </div>
      </div>

      <div style={{ background: "var(--bg2)", borderRadius: 8, padding: "8px 9px", border: "1px solid var(--border)" }}>
        <div style={{ fontSize: 6.5, color: "var(--text3)", marginBottom: 1 }}>Total Deposited</div>
        <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em" }}>$11,510</div>
      </div>

      <div style={{ fontSize: 7, fontWeight: 600, color: "var(--text3)", letterSpacing: "0.07em", textTransform: "uppercase" }}>Holdings</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {assets.map(({ sym, logo, amt, pct, color }) => (
          <div key={sym}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Img src={logo} size={13} />
                <span style={{ fontSize: 7.5, fontWeight: 600, color: "var(--text)" }}>{sym}</span>
              </div>
              <span style={{ fontSize: 7, color: "var(--text3)" }}>{amt}</span>
            </div>
            <div style={{ height: 3, borderRadius: 2, background: "var(--border)", overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>

      <button style={{ marginTop: "auto", background: "var(--accent)", border: "none", borderRadius: 8, padding: "7px 0", fontSize: 8, fontWeight: 700, color: "#fff", cursor: "pointer", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
        + Deposit
      </button>

      <div style={{ display: "flex", justifyContent: "space-around", borderTop: "1px solid var(--border)", paddingTop: 6 }}>
        {["Home", "Vault", "Pay", "Earn", "Profile"].map((t, i) => (
          <span key={t} style={{ fontSize: 6, color: i === 1 ? "var(--accent)" : "var(--text3)", fontWeight: i === 1 ? 700 : 400 }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

/* ── SCREEN 3: Payroll Running ───────────────────── */
function PhonePay() {
  const employees = [
    { name: "Alex Kim",    role: "Product",  logo: "/logos/usdc.png", amt: "$4,500", paid: true  },
    { name: "Sofia Reyes", role: "Design",   logo: "/logos/usdt.png", amt: "$3,200", paid: true  },
    { name: "Marcus N.",   role: "Engineer", logo: "/logos/usdc.png", amt: "$6,800", paid: false },
  ];
  return (
    <div style={{ padding: "12px 9px 8px", display: "flex", flexDirection: "column", gap: 7, height: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 8.5, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.01em" }}>Payroll</span>
        <span style={{ fontSize: 6.5, background: "rgba(79,196,144,0.12)", color: "#4FC490", border: "1px solid rgba(79,196,144,0.28)", borderRadius: 20, padding: "2px 7px", fontWeight: 700 }}>Running</span>
      </div>

      {/* Progress */}
      <div style={{ background: "var(--bg2)", borderRadius: 8, padding: "7px 9px", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ fontSize: 6.5, color: "var(--text3)" }}>Total</div>
          <div style={{ fontSize: 7.5, fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 3 }}>
            $14,500
            <div style={{ display: "flex", gap: 2 }}>
              <Img src="/logos/usdc.png" size={10} />
              <Img src="/logos/usdt.png" size={10} />
            </div>
          </div>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: "var(--border)", overflow: "hidden" }}>
          <div style={{ width: "66%", height: "100%", background: "#4FC490", borderRadius: 2 }} />
        </div>
        <div style={{ fontSize: 6.5, color: "var(--text3)", marginTop: 3 }}>2 of 3 paid · 66%</div>
      </div>

      {/* Employees */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {employees.map(({ name, role, logo, amt, paid }) => (
          <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: paid ? "rgba(79,196,144,0.15)" : "var(--bg2)", border: `1px solid ${paid ? "rgba(79,196,144,0.4)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 700, color: paid ? "#4FC490" : "var(--text3)", flexShrink: 0 }}>
                {paid ? "✓" : name[0]}
              </div>
              <div>
                <div style={{ fontSize: 7.5, fontWeight: 600, color: "var(--text)" }}>{name}</div>
                <div style={{ fontSize: 6, color: "var(--text3)" }}>{role}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <span style={{ fontSize: 7.5, fontWeight: 700, color: "var(--text)" }}>{amt}</span>
                <Img src={logo} size={9} />
              </div>
              <span style={{ fontSize: 6, color: paid ? "#4FC490" : "var(--text3)", fontWeight: 600 }}>{paid ? "Paid" : "Pending"}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Somnia chain badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: "auto", paddingTop: 4, borderTop: "1px solid var(--border)" }}>
        <Img src="/logos/somnia-logomark-1.svg" size={10} radius="0" />
        <span style={{ fontSize: 6.5, color: "var(--text3)", fontWeight: 500 }}>Settled on Somnia · 0 failures</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-around", borderTop: "1px solid var(--border)", paddingTop: 6 }}>
        {["Home", "Vault", "Pay", "Earn", "Profile"].map((t, i) => (
          <span key={t} style={{ fontSize: 6, color: i === 2 ? "var(--accent)" : "var(--text3)", fontWeight: i === 2 ? 700 : 400 }}>{t}</span>
        ))}
      </div>
    </div>
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
        <a className="store-btn" href="#">
          <AppleLogo />
          <div className="store-btn-text">
            <span className="store-btn-sub">Download on the</span>
            <span className="store-btn-main">App Store</span>
          </div>
        </a>
        <a className="store-btn" href="#">
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
