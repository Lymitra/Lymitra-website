"use client";

import { useEffect, useState, useRef, type ReactNode } from "react";
import Image from "next/image";
import { useAccount, useBalance } from "wagmi";
import { formatUnits } from "viem";
import { TrendingUp, Users, BarChart2, Zap, Check, Search } from "lucide-react";
import { somniaTestnet } from "@/lib/chains";
import { useUsdcBalance, useWethBalance, fmtUsdc } from "@/lib/hooks";

// ── Inline token logos ──────────────────────────────────────────────────────
function EthLogo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="22" fill="#627EEA" />
      <polygon points="22,9 13,23 22,28 31,23" fill="white" fillOpacity="0.95" />
      <polygon points="22,28 13,23 22,35 31,23" fill="white" fillOpacity="0.55" />
    </svg>
  );
}
function UsdcLogo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="22" fill="#2775CA" />
      <circle cx="22" cy="22" r="15" stroke="white" strokeWidth="1.6" fill="none" />
      <text x="22" y="27" textAnchor="middle" fill="white" fontSize="13" fontWeight="700" fontFamily="system-ui,sans-serif">$</text>
    </svg>
  );
}

// ── Live price fetch ────────────────────────────────────────────────────────
function usePrices() {
  const [somi, setSomi] = useState<number | null>(null);
  const [eth,  setEth]  = useState<number | null>(null);

  useEffect(() => {
    const load = () =>
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=somnia,ethereum&vs_currencies=usd")
        .then((r) => r.json())
        .then((d) => {
          if (d?.somnia?.usd)  setSomi(d.somnia.usd);
          if (d?.ethereum?.usd) setEth(d.ethereum.usd);
        })
        .catch(() => {});
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, []);

  return { somi, eth };
}

// ── Agent feed (context only — not live contract data) ──────────────────────
const agentFeed: { ic: ReactNode; cls: string; title: string; sub: string; time: string }[] = [
  { ic: <Zap size={11} />,    cls: "",      title: "Rate watch — SOMI/USDC optimal window", sub: "AI queuing conversion for next payroll run.", time: "2m" },
  { ic: <span style={{ fontSize: 11, fontWeight: 700 }}>$</span>, cls: "gold", title: "Payroll prep — 11 days to execution", sub: "Jun 1 · $18,500 queued · auto-execute on payday.", time: "1h" },
  { ic: <Check size={11} />,  cls: "green", title: "USDC conversion complete", sub: "Best rate locked · transferred to payroll pool.", time: "3h" },
  { ic: <Search size={11} />, cls: "",      title: "Fraud check passed — 0xA8f…3b2c", sub: "AI reviewed recipient wallet · no flags.", time: "1d" },
  { ic: <Zap size={11} />,    cls: "gold",  title: "May payroll executed — $18,500", sub: "6 transfers · 1 block · May 1 00:00 UTC.", time: "20d" },
];

// ── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n: number, decimals = 4) {
  return n.toLocaleString("en-US", { maximumFractionDigits: decimals });
}
function usd(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

type Panel = "dashboard" | "aichat" | "myagent" | "vault" | "payments" | "earn" | "analytics";
interface DashboardProps { onNav: (panel: Panel) => void }

// ── Component ────────────────────────────────────────────────────────────────
export function Dashboard({ onNav }: DashboardProps) {
  const { address, isConnected } = useAccount();
  const { somi: somiPrice, eth: ethPrice } = usePrices();

  // Native STT balance on Somnia
  const { data: sttRaw } = useBalance({ address, chainId: somniaTestnet.id });
  // WETH ERC-20 balance
  const { data: wethRaw } = useWethBalance(address);
  // USDC ERC-20 balance
  const { data: usdcRaw } = useUsdcBalance(address);

  // Numeric values
  const sttAmt  = sttRaw  ? Number(sttRaw.formatted)               : 0;
  const wethAmt = wethRaw ? Number(formatUnits(wethRaw as bigint, 18)) : 0;
  const usdcAmt = usdcRaw ? Number(formatUnits(usdcRaw as bigint, 6))  : 0;

  // USD values
  const sttUsd  = somiPrice ? sttAmt  * somiPrice : null;
  const wethUsd = ethPrice  ? wethAmt * ethPrice  : null;
  const totalUsd = sttUsd !== null && wethUsd !== null
    ? sttUsd + wethUsd + usdcAmt
    : null;

  // Animate total counter
  const counterRef = useRef<HTMLDivElement>(null);
  const prevTotal  = useRef(0);
  useEffect(() => {
    const el = counterRef.current;
    if (!el || totalUsd === null) return;
    const from = prevTotal.current;
    const to   = totalUsd;
    prevTotal.current = to;
    const dur = 900;
    const t0  = performance.now();
    function step(now: number) {
      const p    = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el!.textContent = usd(from + (to - from) * ease);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [totalUsd]);

  return (
    <div>
      {/* Network strip */}
      <div className="app-cs">
        <div className="acs-l">Network</div>
        <div className="acs-ps">
          <div className="acp live">
            <div className="acp-dot acp-a" />Somnia Shannon
            <span style={{ fontSize: "8.5px", color: "#3ED9B8", letterSpacing: ".05em", fontWeight: 500, marginLeft: 4 }}>TESTNET</span>
          </div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: "10px", color: "var(--text3)", letterSpacing: ".02em" }}>AI runs on Somnia</div>
      </div>

      {/* Hero */}
      <div className="dash-hero">
        <div className="dh-glow" />
        <div className="dh-lbl">Total portfolio value</div>
        <div className="dh-amt" ref={counterRef}>
          {totalUsd !== null ? usd(totalUsd) : isConnected ? "Loading…" : "—"}
        </div>
        <div className="dh-chg">
          {somiPrice
            ? <>SOMI&nbsp;<span style={{ fontWeight: 600 }}>${somiPrice.toFixed(4)}</span>&nbsp;·&nbsp;ETH&nbsp;<span style={{ fontWeight: 600 }}>{ethPrice ? "$" + Math.round(ethPrice).toLocaleString() : "—"}</span></>
            : "Fetching live prices…"}
        </div>
        <div className="dh-acts">
          <button className="dh-btn p" onClick={() => onNav("vault")}>+ Deposit</button>
          <button className="dh-btn" onClick={() => onNav("payments")}><Users size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />Team</button>
          <button className="dh-btn" onClick={() => onNav("earn")}><TrendingUp size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />Stake</button>
          <button className="dh-btn" onClick={() => onNav("analytics")}><BarChart2 size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />History</button>
        </div>
      </div>

      {/* Stat strip */}
      <div className="ss">
        <div className="sc">
          <div className="sc-l" style={{ display: "flex", alignItems: "center", gap: 5 }}>
            SOMI price
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "rgba(79,196,144,0.1)", borderRadius: 100, padding: "1px 6px", fontSize: 9, color: "#4FC490", fontWeight: 600 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4FC490", animation: "pulse 1.8s ease-in-out infinite", display: "inline-block" }} />
              LIVE
            </span>
          </div>
          <div className="sc-v accent">{somiPrice ? "$" + somiPrice.toFixed(4) : "—"}</div>
          <div className="sc-s">Somnia mainnet</div>
        </div>
        <div className="sc">
          <div className="sc-l">ETH price</div>
          <div className="sc-v">{ethPrice ? "$" + Math.round(ethPrice).toLocaleString() : "—"}</div>
          <div className="sc-s">CoinGecko · live</div>
        </div>
        <div className="sc">
          <div className="sc-l">STT balance</div>
          <div className="sc-v gold">{isConnected ? fmt(sttAmt, 3) : "—"}</div>
          <div className="sc-s">Somnia testnet</div>
        </div>
        <div className="sc">
          <div className="sc-l">USDC balance</div>
          <div className="sc-v green">{isConnected ? fmtUsdc(usdcRaw as bigint | undefined) : "—"}</div>
          <div className="sc-s">Payroll reserve</div>
        </div>
      </div>

      {/* Main grid */}
      <div className="g2">
        {/* Holdings */}
        <div className="card">
          <div className="card-h">
            <div className="card-t">Holdings</div>
            <button className="card-a" onClick={() => onNav("vault")}>Manage →</button>
          </div>

          {/* STT / SOMI row */}
          <div className="tr">
            <div className="db-logo">
              <Image src="/logos/somi-token-roundel-1.png" width={34} height={34} alt="SOMI" style={{ borderRadius: "50%", display: "block" }} />
            </div>
            <div className="ti-inf">
              <div className="ti-n">Somnia (SOMI)</div>
              <div className="ti-t">Native token · Testnet STT</div>
            </div>
            <div className="t-bal">
              <div className="t-usd">{sttUsd !== null ? usd(sttUsd) : "—"}</div>
              <div className="t-amt">{fmt(sttAmt, 3)} STT</div>
              <div className="t-chg up">{somiPrice ? "$" + somiPrice.toFixed(4) : "—"}</div>
            </div>
          </div>

          {/* WETH row */}
          <div className="tr">
            <div className="db-logo"><EthLogo size={34} /></div>
            <div className="ti-inf">
              <div className="ti-n">Ethereum (WETH)</div>
              <div className="ti-t">Wrapped ETH on Somnia</div>
            </div>
            <div className="t-bal">
              <div className="t-usd">{wethUsd !== null ? usd(wethUsd) : "—"}</div>
              <div className="t-amt">{fmt(wethAmt, 4)} WETH</div>
              <div className="t-chg up">{ethPrice ? "$" + Math.round(ethPrice).toLocaleString() : "—"}</div>
            </div>
          </div>

          {/* USDC row */}
          <div className="tr">
            <div className="db-logo"><UsdcLogo size={34} /></div>
            <div className="ti-inf">
              <div className="ti-n">USD Coin (USDC)</div>
              <div className="ti-t">Payroll reserve · Stable</div>
            </div>
            <div className="t-bal">
              <div className="t-usd">{isConnected ? usd(usdcAmt) : "—"}</div>
              <div className="t-amt">{fmt(usdcAmt, 2)} USDC</div>
              <div className="t-chg up">Stable · $1.00</div>
            </div>
          </div>
        </div>

        {/* Agent activity */}
        <div className="agp">
          <div className="agp-h">
            <div className="agp-hl"><div className="ag-led" /><div className="agp-ht">Agent Activity</div></div>
            <div className="agp-cnt">AI running</div>
          </div>
          <div className="agp-feed">
            {agentFeed.map((a, i) => (
              <div className="ag-item" key={i}>
                <div className={`ai-ic${a.cls ? " " + a.cls : ""}`}>{a.ic}</div>
                <div className="ai-body">
                  <div className="ai-title">{a.title}</div>
                  <div className="ai-sub">{a.sub}</div>
                </div>
                <div className="ai-time">{a.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
