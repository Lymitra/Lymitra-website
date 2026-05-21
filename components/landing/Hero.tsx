"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface HeroProps {
  onLaunchApp: () => void;
}

export function Hero({ onLaunchApp }: HeroProps) {
  const heroRef    = useRef<HTMLElement>(null);
  const innerRef   = useRef<HTMLDivElement>(null);
  const orb1Ref    = useRef<HTMLDivElement>(null);
  const orb2Ref    = useRef<HTMLDivElement>(null);
  const burstRef   = useRef<HTMLDivElement>(null);
  const btnRef     = useRef<HTMLButtonElement>(null);
  const rafRef     = useRef<number>(0);
  const mouseRef   = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  const [clicked, setClicked] = useState(false);

  // Smooth parallax animation loop
  useEffect(() => {
    function tick() {
      const m = mouseRef.current;
      const c = currentRef.current;
      const f = 0.07;

      c.x  += (m.x - c.x)  * f;
      c.y  += (m.y - c.y)  * f;
      c.ox += (-m.x * 0.5 - c.ox) * 0.04;
      c.oy += (-m.y * 0.5 - c.oy) * 0.04;

      if (innerRef.current) {
        innerRef.current.style.transform =
          `perspective(900px) rotateX(${c.y * 4}deg) rotateY(${c.x * 4}deg) translateZ(0)`;
      }
      if (orb1Ref.current) {
        orb1Ref.current.style.transform = `translate(${c.x * 40}px, ${c.y * 30}px)`;
      }
      if (orb2Ref.current) {
        orb2Ref.current.style.transform = `translate(${c.ox * 35}px, ${c.oy * 25}px)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    const hero = heroRef.current;
    if (!hero) return;
    const { left, top, width, height } = hero.getBoundingClientRect();
    mouseRef.current = {
      x: (e.clientX - left - width  / 2) / (width  / 2),
      y: (e.clientY - top  - height / 2) / (height / 2),
    };
  }, []);

  const onMouseLeave = useCallback(() => {
    mouseRef.current = { x: 0, y: 0 };
  }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", onMouseLeave);
    return () => {
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [onMouseMove, onMouseLeave]);

  // Coin burst on button click
  function handleLaunch() {
    const burst = burstRef.current;
    const btn   = btnRef.current;
    if (!burst || !btn) { onLaunchApp(); return; }

    setClicked(true);
    burst.innerHTML = "";

    const rect     = btn.getBoundingClientRect();
    const heroRect = heroRef.current!.getBoundingClientRect();
    const bx = rect.left + rect.width  / 2 - heroRect.left;
    const by = rect.top  + rect.height / 2 - heroRect.top;

    const emojis = ["💸", "💵", "🤑", "💰", "✅"];
    for (let i = 0; i < 20; i++) {
      const span  = document.createElement("span");
      span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      const angle = Math.random() * 360 * (Math.PI / 180);
      const dist  = 80 + Math.random() * 140;
      span.style.cssText = `
        position:absolute;
        left:${bx}px;
        top:${by}px;
        font-size:${18 + Math.random() * 14}px;
        pointer-events:none;
        transform:translate(-50%,-50%);
        animation:coinBurst 0.9s ease-out forwards;
        --dx:${Math.cos(angle) * dist}px;
        --dy:${Math.sin(angle) * dist}px;
        animation-delay:${Math.random() * 0.15}s;
      `;
      burst.appendChild(span);
    }

    setTimeout(() => {
      setClicked(false);
      onLaunchApp();
    }, 700);
  }

  return (
    <section className="hero" ref={heroRef} style={{ overflow: "hidden", position: "relative" }}>
      <style>{`
        @keyframes coinBurst {
          0%   { opacity:1; transform:translate(-50%,-50%) scale(1); }
          100% { opacity:0; transform:translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.4); }
        }
      `}</style>

      <div className="hero-grid" />
      <div className="orb orb-1" ref={orb1Ref} style={{ transition: "none" }} />
      <div className="orb orb-2" ref={orb2Ref} style={{ transition: "none" }} />
      <div className="orb orb-3" />
      <div ref={burstRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 20 }} />

      <div className="hero-inner" ref={innerRef} style={{ willChange: "transform" }}>
        <h1 className="hero-h">
          Your team gets paid.<br />
          <span className="accent">Automatically.</span><br />
          <span className="muted">Every single month.</span>
        </h1>
        <p className="h-sub">
          Add your team once. Set a date. Walk away.
          Lymitra handles the rest — converting, timing, and paying everyone in stable dollars
          while you focus on building your business.
        </p>
        <div className="cta-row">
          <button
            ref={btnRef}
            className={`btn-primary${clicked ? " btn-burst" : ""}`}
            onClick={handleLaunch}
            style={{ position: "relative", overflow: "visible" }}
          >
            {clicked ? "Sending pay… 🚀" : "Pay your team now"}
            {!clicked && (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 6 }}>
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <a className="btn-ghost" href="#how">See how it works</a>
        </div>

        <div className="h-stats">
          <div><div className="hs-n">5 min</div><div className="hs-l">Setup time</div></div>
          <div className="hs-div" />
          <div><div className="hs-n">$0</div><div className="hs-l">Monthly fee</div></div>
          <div className="hs-div" />
          <div><div className="hs-n accent">100%</div><div className="hs-l">Automatic</div></div>
          <div className="hs-div" />
          <div><div className="hs-n">&lt;30s</div><div className="hs-l">Pay time</div></div>
        </div>
      </div>
    </section>
  );
}
