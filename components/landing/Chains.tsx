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
      <div className="c-lbl reveal">Assets from any chain · Intelligence on Somnia</div>
      <div className="c-pills reveal">
        <div className="cp live">
          <div className="cp-dot cpd-a" />Somnia<span className="live-t">● LIVE</span>
        </div>
        <div className="cp"><div className="cp-dot cpd-b" />Ethereum</div>
        <div className="cp"><div className="cp-dot cpd-b" />Base</div>
        <div className="cp"><div className="cp-dot cpd-p" />Polygon</div>
        <div className="cp"><div className="cp-dot cpd-gr" />More soon</div>
      </div>
    </section>
  );
}
