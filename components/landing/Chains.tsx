"use client";

import { useEffect, useRef } from "react";

export function Chains() {
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
    <section id="chains-l" className="chains" ref={ref}>
      <div className="c-lbl reveal">Built on Somnia. Ultra-fast blocks, near-zero gas, on-chain AI.</div>
      <div className="c-pills reveal">
        <div className="cp live">
          <div className="cp-dot cpd-a" />Somnia Testnet<span className="live-t">● LIVE</span>
        </div>
        <div className="cp"><div className="cp-dot cpd-b" />DIA Oracle pricing</div>
        <div className="cp"><div className="cp-dot cpd-b" />On-chain LLM agents</div>
        <div className="cp"><div className="cp-dot cpd-gr" />Somnia Reactivity</div>
        <div className="cp"><div className="cp-dot cpd-p" />~$0 gas per payroll</div>
      </div>
    </section>
  );
}
