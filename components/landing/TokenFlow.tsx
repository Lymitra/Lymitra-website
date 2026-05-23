"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

const W = 500;
const H = 120;
const HISTORY = 70;
const ROUND_TIME = 15; // seconds per round

type TokenKey = "SOMI" | "ETH" | "BTC" | "BNB";

const DEFAULT_BASES: Record<TokenKey, number> = {
  SOMI: 0.031,
  ETH:  2500,
  BTC:  95000,
  BNB:  600,
};

const TOKEN_STATIC: Record<TokenKey, {
  amount: number; amp: number; dec: number;
  src: string; color: string; label: string; amtLabel: string;
}> = {
  SOMI: { amount: 10000, amp: 0.18, dec: 4, color: "#9B7FFF", src: "/logos/somi-token-roundel-1.png", label: "SOMI", amtLabel: "10,000 SOMI" },
  ETH:  { amount: 1,     amp: 0.12, dec: 0, color: "#627EEA", src: "/logos/eth.png",                  label: "ETH",  amtLabel: "1 ETH"        },
  BTC:  { amount: 0.01,  amp: 0.08, dec: 0, color: "#F7931A", src: "/logos/btc.png",                  label: "BTC",  amtLabel: "0.01 BTC"     },
  BNB:  { amount: 5,     amp: 0.15, dec: 2, color: "#F3BA2F", src: "/logos/bnb.png",                  label: "BNB",  amtLabel: "5 BNB"        },
};

function price(t: number, base: number, amp: number) {
  const a = base * amp;
  return (
    base +
    a * 0.50 * Math.sin(t * 0.07) +
    a * 0.28 * Math.sin(t * 0.19 + 1.4) +
    a * 0.14 * Math.sin(t * 0.43 + 0.7) +
    a * 0.08 * Math.sin(t * 0.89 + 2.1)
  );
}

function toPath(pts: number[]) {
  if (pts.length < 2) return "";
  const min = Math.min(...pts) - 0.001;
  const max = Math.max(...pts) + 0.001;
  return pts
    .map((p, i) => {
      const x = (i / (pts.length - 1)) * W;
      const y = H - ((p - min) / (max - min)) * (H - 8) - 4;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join("");
}

function TokenLogo({ src, alt, size = 26 }: { src: string; alt: string; size?: number }) {
  return <Image src={src} width={size} height={size} alt={alt} unoptimized style={{ borderRadius: "50%", display: "block", flexShrink: 0 }} />;
}

function playSound(type: "convert" | "win" | "lose" | "reset" | "tick") {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === "tick") {
      // Crisp high-frequency pip — like a premium countdown
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 2000;
      filter.Q.value = 10;
      osc.type = "sine";
      osc.frequency.value = 2000;
      osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.start(now); osc.stop(now + 0.08);
    }

    if (type === "convert") {
      // Three-note rising chime — modern payment confirmation feel
      [880, 1320, 1760].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        osc.connect(gain); gain.connect(ctx.destination);
        const t = now + i * 0.06;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(i === 0 ? 0.16 : 0.10, t + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        osc.start(t); osc.stop(t + 0.24);
      });
    }

    if (type === "win") {
      // Bright pentatonic arpeggio with shimmer — satisfying, not cheesy
      [523, 659, 784, 1047, 1319].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = i < 3 ? "triangle" : "sine";
        osc.frequency.value = freq;
        // Subtle vibrato on the final note
        if (i === 4) {
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.value = 7;
          lfoGain.gain.value = 6;
          lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
          lfo.start(now + i * 0.09); lfo.stop(now + i * 0.09 + 0.55);
        }
        osc.connect(gain); gain.connect(ctx.destination);
        const t = now + i * 0.09;
        const isLast = i === 4;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(i === 0 ? 0.18 : 0.11, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + (isLast ? 0.65 : 0.28));
        osc.start(t); osc.stop(t + (isLast ? 0.7 : 0.3));
      });
      // High-frequency noise shimmer on impact
      const bufSize = Math.floor(ctx.sampleRate * 0.08);
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      const nFilter = ctx.createBiquadFilter();
      const nGain = ctx.createGain();
      noise.buffer = buf;
      nFilter.type = "highpass"; nFilter.frequency.value = 5000;
      noise.connect(nFilter); nFilter.connect(nGain); nGain.connect(ctx.destination);
      nGain.gain.setValueAtTime(0.06, now);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      noise.start(now); noise.stop(now + 0.1);
    }

    if (type === "lose") {
      // Soft descending two-tone — gentle "oh well", not harsh
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass"; filter.frequency.value = 900;
      filter.connect(ctx.destination);
      [[440, 280], [330, 210]].forEach(([start, end], i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(start, now + i * 0.08);
        osc.frequency.exponentialRampToValueAtTime(end, now + i * 0.08 + 0.38);
        osc.connect(gain); gain.connect(filter);
        const t = now + i * 0.08;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.11, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
        osc.start(t); osc.stop(t + 0.48);
      });
    }

    if (type === "reset") {
      // Quick two-tone ascending "ready" ping — clean and fresh
      [560, 840].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        osc.connect(gain); gain.connect(ctx.destination);
        const t = now + i * 0.09;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.13, t + 0.007);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc.start(t); osc.stop(t + 0.2);
      });
    }
  } catch { /* AudioContext unavailable */ }
}

async function fetchLivePrices(): Promise<Partial<Record<TokenKey, number>>> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,binancecoin&vs_currencies=usd"
    );
    const d = await res.json();
    if (d.bitcoin?.usd) return { ETH: d.ethereum.usd, BTC: d.bitcoin.usd, BNB: d.binancecoin.usd };
  } catch { /* fall through */ }
  try {
    const res = await fetch(
      'https://api.binance.com/api/v3/ticker/price?symbols=%5B%22BTCUSDT%22%2C%22ETHUSDT%22%2C%22BNBUSDT%22%5D'
    );
    const arr: { symbol: string; price: string }[] = await res.json();
    const get = (sym: string) => parseFloat(arr.find(x => x.symbol === sym)?.price ?? "0");
    const btc = get("BTCUSDT");
    if (btc > 0) return { BTC: btc, ETH: get("ETHUSDT"), BNB: get("BNBUSDT") };
  } catch { /* keep defaults */ }
  return {};
}

type Phase = "playing" | "result";

export function TokenFlow() {
  const [token, setToken]         = useState<TokenKey>("ETH");
  const [pts, setPts]             = useState<number[]>([]);
  const [phase, setPhase]         = useState<Phase>("playing");
  const [userUsdc, setUserUsdc]   = useState(0);
  const [aiUsdc, setAiUsdc]       = useState(0);
  const [userPrice, setUserPrice] = useState(0);
  const [score, setScore]         = useState({ you: 0, ai: 0 });
  const [timeLeft, setTimeLeft]   = useState(ROUND_TIME);
  const [livePrices, setLivePrices] = useState(false);
  const [timedOut, setTimedOut]   = useState(false);

  const tickRef    = useRef(0);
  const ptsRef     = useRef<number[]>([]);
  const timerRef   = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const countRef   = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const basesRef   = useRef<Record<TokenKey, number>>({ ...DEFAULT_BASES });
  const cfgRef     = useRef({ ...TOKEN_STATIC.ETH, base: DEFAULT_BASES.ETH });
  const phaseRef   = useRef<Phase>("playing");
  const tokenRef   = useRef<TokenKey>("ETH");

  phaseRef.current = phase;
  tokenRef.current = token;

  const getCfg = useCallback((t: TokenKey) => ({
    ...TOKEN_STATIC[t],
    base: basesRef.current[t],
  }), []);

  const startLoop = useCallback((startTick: number, base: number, amp: number) => {
    clearInterval(timerRef.current);
    tickRef.current = startTick;
    timerRef.current = setInterval(() => {
      const t = tickRef.current++;
      const p = price(t, base, amp);
      ptsRef.current = [...ptsRef.current.slice(-(HISTORY - 1)), p];
      setPts([...ptsRef.current]);
    }, 100);
  }, []);

  const doConvert = useCallback((isTimeout = false) => {
    clearInterval(timerRef.current);
    clearInterval(countRef.current);
    const cfg = cfgRef.current;
    const cur = ptsRef.current[ptsRef.current.length - 1];
    let best = cur;
    const t0 = tickRef.current;
    for (let i = 1; i <= 20; i++) best = Math.max(best, price(t0 + i, cfg.base, cfg.amp));
    const userVal = Math.round(cfg.amount * cur * 100) / 100;
    const aiVal   = Math.round(cfg.amount * best * 100) / 100;
    setUserPrice(cur);
    setUserUsdc(userVal);
    setAiUsdc(aiVal);
    setTimedOut(isTimeout);
    setPhase("result");
    if (!isTimeout) playSound("convert");
    const won = aiVal <= userVal && !isTimeout;
    setTimeout(() => playSound(won ? "win" : "lose"), 220);
    setScore(s => won ? { ...s, you: s.you + 1 } : { ...s, ai: s.ai + 1 });
  }, []);

  const startCountdown = useCallback(() => {
    clearInterval(countRef.current);
    setTimeLeft(ROUND_TIME);
    let t = ROUND_TIME;
    countRef.current = setInterval(() => {
      t -= 1;
      setTimeLeft(t);
      if (t <= 3 && t > 0) playSound("tick");
      if (t <= 0) {
        clearInterval(countRef.current);
        if (phaseRef.current === "playing") doConvert(true);
      }
    }, 1000);
  }, [doConvert]);

  const initRound = useCallback((t: TokenKey) => {
    const cfg = getCfg(t);
    cfgRef.current = cfg;
    const offset = Math.random() * 200 + 50;
    ptsRef.current = Array.from({ length: HISTORY }, (_, i) => price(i + offset, cfg.base, cfg.amp));
    setPts([...ptsRef.current]);
    startLoop(HISTORY + offset, cfg.base, cfg.amp);
    startCountdown();
  }, [getCfg, startLoop, startCountdown]);

  useEffect(() => {
    initRound("ETH");
    return () => { clearInterval(timerRef.current); clearInterval(countRef.current); };
  }, [initRound]);

  useEffect(() => {
    let cancelled = false;
    fetchLivePrices().then(prices => {
      if (cancelled || !prices.BTC) return;
      basesRef.current = {
        SOMI: DEFAULT_BASES.SOMI,
        ETH:  prices.ETH ?? DEFAULT_BASES.ETH,
        BTC:  prices.BTC ?? DEFAULT_BASES.BTC,
        BNB:  prices.BNB ?? DEFAULT_BASES.BNB,
      };
      setLivePrices(true);
      if (phaseRef.current === "playing") initRound(tokenRef.current);
    });
    return () => { cancelled = true; };
  }, [initRound]);

  const handleTokenSelect = useCallback((t: TokenKey) => {
    if (phase !== "playing") return;
    setToken(t);
    initRound(t);
  }, [phase, initRound]);

  const handleConvert = useCallback(() => {
    if (phase !== "playing") return;
    doConvert(false);
  }, [phase, doConvert]);

  const handleNextRound = useCallback(() => {
    playSound("reset");
    setPhase("playing");
    setUserUsdc(0);
    setAiUsdc(0);
    setTimedOut(false);
    initRound(tokenRef.current);
  }, [initRound]);

  const cfg  = { ...TOKEN_STATIC[token], base: basesRef.current[token] };
  const cur  = pts[pts.length - 1] ?? cfg.base;
  const path = toPath(pts);
  const fillPath = path ? `${path}L${W},${H}L0,${H}Z` : "";
  const min  = pts.length ? Math.min(...pts) - 0.001 : 0;
  const max  = pts.length ? Math.max(...pts) + 0.001 : 1;
  const dotY = H - ((cur - min) / (max - min)) * (H - 8) - 4;
  const diff = +(aiUsdc - userUsdc).toFixed(2);
  const userWon = diff <= 0 && !timedOut;

  const timerPct  = (timeLeft / ROUND_TIME) * 100;
  const timerColor = timeLeft > 8 ? "var(--accent)" : timeLeft > 4 ? "#F59E0B" : "#EF4444";

  const fmtPrice = (p: number) =>
    p >= 1000 ? "$" + Math.round(p).toLocaleString() :
    p >= 1    ? "$" + p.toFixed(2) :
                "$" + p.toFixed(4);

  const fmtVal = (v: number) =>
    v >= 1000
      ? "$" + v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : "$" + v.toFixed(2);

  return (
    <section className="tf-sec" id="rate-rush">
      <div className="tf-wrap">

        {/* Header */}
        <div className="tf-head">
          <div className="tf-eyebrow">Mini Game · Rate Rush</div>
          <h3 className="tf-title">Beat the AI. Win the rate.</h3>
          <p className="tf-desc">
            The same decision the AI makes for your team every payday. Can you beat it?
          </p>
        </div>

        {/* Score bar */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center", gap: 12,
          padding: "10px 16px", borderRadius: 14,
          background: "var(--bg2)", border: "1px solid var(--border)",
        }}>
          {/* Live indicator — left */}
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "var(--text3)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: livePrices ? "#4FC490" : "var(--text3)", display: "inline-block", flexShrink: 0 }} />
            {livePrices ? "Live" : "Sim"}
          </div>
          {/* Scores — center */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 3 }}>You</div>
              <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1, color: score.you >= score.ai ? "var(--text)" : "var(--text3)", fontVariantNumeric: "tabular-nums" }}>{score.you}</div>
            </div>
            <div style={{ fontSize: 18, color: "var(--border2)", fontWeight: 700, paddingTop: 12 }}>:</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 3 }}>AI</div>
              <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1, color: score.ai > score.you ? "#4FC490" : "var(--text3)", fontVariantNumeric: "tabular-nums" }}>{score.ai}</div>
            </div>
          </div>
          {/* Right — empty, keeps scores centered */}
          <div />
        </div>

        {/* Token selector */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
          {(Object.keys(TOKEN_STATIC) as TokenKey[]).map((t) => {
            const s = TOKEN_STATIC[t];
            const active = t === token;
            const base = basesRef.current[t];
            return (
              <button
                key={t}
                onClick={() => handleTokenSelect(t)}
                disabled={phase === "result"}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "5px 11px 5px 6px", borderRadius: 20,
                  cursor: phase === "result" ? "default" : "pointer",
                  border: active ? `1.5px solid ${s.color}` : "1.5px solid var(--border)",
                  background: active ? `${s.color}18` : "var(--bg2)",
                  fontFamily: "inherit", fontSize: 12, fontWeight: 700,
                  color: active ? s.color : "var(--text3)",
                  transition: "all 0.15s",
                  opacity: phase === "result" ? 0.4 : 1,
                }}
              >
                <TokenLogo src={s.src} alt={s.label} size={16} />
                {s.label}
                <span style={{ fontSize: 10, fontWeight: 500, opacity: 0.7 }}>
                  {base >= 1000 ? `$${Math.round(base).toLocaleString()}` : `$${base.toFixed(3)}`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Game card — glows in token color while playing */}
        <div className="tf-card" style={{
          padding: "1rem",
          boxShadow: phase === "playing"
            ? `0 0 0 1px ${cfg.color}22, 0 8px 32px ${cfg.color}14`
            : undefined,
          transition: "box-shadow 0.4s",
        }}>

          {/* Rate row */}
          <div className="tf-rate-row">
            <div className="tf-rate-left">
              <TokenLogo src={cfg.src} alt={cfg.label} size={20} />
              <span className="tf-pair">{cfg.label} / USD</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className={`tf-rate-val${phase === "playing" ? " tf-rate-live" : ""}`} style={{ fontSize: 17 }}>
                {fmtPrice(phase === "playing" ? cur : userPrice)}
              </div>
              {phase === "playing" && (
                <span className="tf-live-badge">
                  <span className="tf-ai-pulse" style={{ width: 5, height: 5 }} />
                  Live
                </span>
              )}
            </div>
          </div>

          {/* Chart with subtle grid lines */}
          <div className="tf-chart" style={{ borderRadius: 10, marginBottom: "0.85rem" }}>
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="tfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={cfg.color} stopOpacity="0.28" />
                  <stop offset="100%" stopColor={cfg.color} stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Subtle horizontal grid lines */}
              {[0.25, 0.5, 0.75].map(f => (
                <line key={f} x1={0} y1={H * f} x2={W} y2={H * f} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              ))}
              {fillPath && <path d={fillPath} fill="url(#tfGrad)" />}
              {path && <path d={path} fill="none" stroke={cfg.color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />}
              {phase === "playing" && pts.length > 0 && (
                <>
                  <circle cx={W} cy={dotY} r="7" fill={cfg.color} opacity="0.18" />
                  <circle cx={W} cy={dotY} r="4" fill={cfg.color} />
                </>
              )}
              {phase === "result" && (
                <line x1={W} y1={0} x2={W} y2={H} stroke="rgba(255,255,255,0.22)" strokeWidth="1" strokeDasharray="4,3" />
              )}
            </svg>
          </div>

          {phase === "playing" ? (
            <>
              {/* Timer */}
              <div style={{ marginBottom: "0.8rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    Time remaining
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 800, fontVariantNumeric: "tabular-nums", color: timerColor, transition: "color 0.4s", minWidth: 28, textAlign: "right" }}>
                    {timeLeft}s
                  </span>
                </div>
                <div style={{ height: 5, background: "var(--bg4)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${timerPct}%`,
                    background: timerColor, borderRadius: 99,
                    transition: "width 0.9s linear, background 0.4s",
                  }} />
                </div>
              </div>

              {/* Convert button */}
              <button
                onClick={handleConvert}
                style={{
                  width: "100%", height: 54, borderRadius: 13,
                  background: cfg.color, color: "#fff",
                  border: "none", cursor: "pointer", fontFamily: "inherit",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1,
                  boxShadow: `0 0 ${timeLeft < 5 ? "28px" : "14px"} ${cfg.color}55`,
                  animation: "rr-pulse 1.8s ease-in-out infinite",
                  transition: "box-shadow 0.4s",
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "0.02em" }}>CONVERT NOW</span>
                <span style={{ fontSize: 11, opacity: 0.82, fontWeight: 500 }}>{cfg.amtLabel} · {fmtVal(cfg.amount * cur)}</span>
              </button>
            </>
          ) : (
            /* Result */
            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>

              {/* Outcome label */}
              <div style={{ textAlign: "center" }}>
                <span style={{
                  display: "inline-block", padding: "4px 14px", borderRadius: 100,
                  fontSize: 12, fontWeight: 700,
                  background: userWon ? "rgba(79,196,144,0.12)" : "rgba(255,107,107,0.1)",
                  color: userWon ? "#4FC490" : "#ff6b6b",
                  border: `1px solid ${userWon ? "rgba(79,196,144,0.3)" : "rgba(255,107,107,0.25)"}`,
                }}>
                  {timedOut ? "Time's up, AI auto-converted" : userWon ? "You win this round!" : "AI wins this round"}
                </span>
              </div>

              {/* Numbers — winner bigger */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* You */}
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: "var(--text3)", marginBottom: 3 }}>You</div>
                  <div style={{
                    fontSize: userWon ? 28 : 21, fontWeight: 800,
                    color: userWon ? "#4FC490" : "#ff6b6b",
                    fontVariantNumeric: "tabular-nums", lineHeight: 1.1,
                    transition: "font-size 0.2s",
                  }}>
                    {fmtVal(userUsdc)}
                  </div>
                </div>

                <div style={{ fontSize: 10, color: "var(--text3)", fontWeight: 600, flexShrink: 0 }}>vs</div>

                {/* AI */}
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: "var(--text3)", marginBottom: 3 }}>
                    AI <span style={{ fontSize: 8, background: "#4FC490", color: "#fff", borderRadius: 4, padding: "1px 4px", fontWeight: 700 }}>Auto</span>
                  </div>
                  <div style={{
                    fontSize: userWon ? 21 : 28, fontWeight: 800,
                    color: "#4FC490",
                    fontVariantNumeric: "tabular-nums", lineHeight: 1.1,
                    transition: "font-size 0.2s",
                  }}>
                    {fmtVal(aiUsdc)}
                  </div>
                </div>
              </div>

              {/* Diff bar */}
              <div style={{
                textAlign: "center", padding: "7px 12px", borderRadius: 8, fontSize: 12.5, fontWeight: 600,
                background: userWon ? "rgba(79,196,144,0.07)" : "rgba(255,107,107,0.06)",
                color: userWon ? "#4FC490" : "var(--text2)",
              }}>
                {userWon
                  ? `You got ${fmtVal(Math.abs(diff))} more, nice timing!`
                  : `AI got ${fmtVal(Math.abs(diff))} more without lifting a finger`}
              </div>

              <button
                onClick={handleNextRound}
                style={{
                  width: "100%", height: 44, borderRadius: 11,
                  background: "var(--accent)", color: "#fff",
                  border: "none", cursor: "pointer", fontFamily: "inherit",
                  fontSize: 14, fontWeight: 700, letterSpacing: "0.01em",
                }}
              >
                Next Round →
              </button>
            </div>
          )}
        </div>

        <p style={{ textAlign: "center", fontSize: 11.5, color: "var(--text3)", maxWidth: 380 }}>
          {livePrices ? "Live market prices. " : ""}In the app, the AI does this for your team every payday. You just deposit.
        </p>

      </div>
    </section>
  );
}
