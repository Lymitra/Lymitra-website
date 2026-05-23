"use client";

import { useEffect, useRef } from "react";
import { ShieldCheck, Zap, Users, DollarSign } from "lucide-react";

const benefits = [
  {
    Icon: ShieldCheck,
    title: "Your vault, not ours",
    desc: "Your money stays in your own on-chain vault. Lymitra never touches it.",
  },
  {
    Icon: DollarSign,
    title: "Every run is on-chain",
    desc: "Every conversion and payment is recorded on-chain forever. Full audit trail, no spreadsheets.",
  },
  {
    Icon: Zap,
    title: "No exchange needed",
    desc: "One deposit, one schedule. No logging in to convert and send every month.",
  },
  {
    Icon: Users,
    title: "Any team size",
    desc: "1 employee or 100. Same setup, same fee. Add or remove people anytime.",
  },
];

export function AgentSection() {
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
    <section id="why" className="why-sec" ref={ref}>
      <div className="reveal" style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div className="sec-eyebrow">Why Lymitra</div>
        <h2 className="sec-h">Built different. <span className="accent">Not just automated.</span></h2>
      </div>

      <div className="why-grid">
        {benefits.map((b) => (
          <div key={b.title} className="why-card reveal">
            <div className="why-ico-wrap">
              <b.Icon size={20} strokeWidth={1.6} />
            </div>
            <div className="why-title">{b.title}</div>
            <div className="why-desc">{b.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
