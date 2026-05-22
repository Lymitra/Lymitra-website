"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useAccount, useBalance } from "wagmi";
import { formatUnits } from "viem";
import { TrendingUp, Users, BarChart2, Zap, Brain, CalendarCheck } from "lucide-react";
import { useCompany } from "@/lib/hooks";
import { activeChain } from "@/lib/chains";
import { useUsdcBalance, useWethBalance, fmtUsdc } from "@/lib/hooks";

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

function usePrices() {
  const [somi, setSomi] = useState<number | null>(null);
  const [eth,  setEth]  = useState<number | null>(null);

  useEffect(() => {
    const load = () =>
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=somnia,ethereum&vs_currencies=usd")
        .then((r) => r.json())
        .then((d) => {
          if (d?.somnia?.usd)   setSomi(d.somnia.usd);
          if (d?.ethereum?.usd) setEth(d.ethereum.usd);
        })
        .catch(() => {});
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, []);

  return { somi, eth };
}

function fmt(n: number, decimals = 4) {
  return n.toLocaleString("en-US", { maximumFractionDigits: decimals });
}
function usd(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

type Panel = "dashboard" | "aichat" | "myagent" | "vault" | "payments" | "earn" | "analytics";
interface DashboardProps { onNav: (panel: Panel) => void }

export function Dashboard({ onNav }: DashboardProps) {
  const { address, isConnected } = useAccount();
  const { somi: somiPrice, eth: ethPrice } = usePrices();
  const { data: company } = useCompany(address);
  const isSetUp = company?.owner === address;

  const { data: sttRaw }  = useBalance({ address, chainId: activeChain.id });
  const { data: wethRaw } = useWethBalance(address);
  const { data: usdcRaw } = useUsdcBalance(address);

  const sttAmt  = sttRaw  ? Number(sttRaw.formatted)                   : 0;
  const wethAmt = wethRaw ? Number(formatUnits(wethRaw as bigint, 18)) : 0;
  const usdcAmt = usdcRaw ? Number(formatUnits(usdcRaw as bigint, 6))  : 0;

  const sttUsd   = somiPrice ? sttAmt  * somiPrice : null;
  const wethUsd  = ethPrice  ? wethAmt * ethPrice  : null;
  const totalUsd = sttUsd !== null && wethUsd !== null
    ? sttUsd + wethUsd + usdcAmt
    : null;

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
      {/* Hero */}
      <div className="dash-hero">
        <div className="dh-glow" />
        <div className="dh-top">
          <div className="dh-lbl">Total portfolio value</div>
          <div className="dh-ai-badge">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3ED9B8", animation: "pulse 1.8s ease-in-out infinite", display: "inline-block", flexShrink: 0 }} />
            {isSetUp ? "Agents active" : "AI ready"}
          </div>
        </div>
        <div className="dh-amt" ref={counterRef}>
          {totalUsd !== null ? usd(totalUsd) : isConnected ? "Loading…" : "—"}
        </div>
        <div className="dh-prices">
          <div className="dh-price-item">
            <div className="dh-price-logo" style={{ background: "#5B7FFF" }} />
            <span className="dh-price-lbl">SOMI</span>
            <span className="dh-price-val">{somiPrice ? "$" + somiPrice.toFixed(4) : "—"}</span>
          </div>
          <div className="dh-price-item">
            <div className="dh-price-logo" style={{ background: "#627EEA" }} />
            <span className="dh-price-lbl">ETH</span>
            <span className="dh-price-val">{ethPrice ? "$" + Math.round(ethPrice).toLocaleString() : "—"}</span>
          </div>
          <div className="dh-price-item">
            <div className="dh-price-logo" style={{ background: "#2775CA" }} />
            <span className="dh-price-lbl">USDC</span>
            <span className="dh-price-val">$1.00</span>
          </div>
        </div>
        <div className="dh-acts">
          <button className="dh-btn p" onClick={() => onNav("vault")}>+ Deposit</button>
          <button className="dh-btn" onClick={() => onNav("payments")}>
            <Users size={12} />Team
          </button>
          <button className="dh-btn" onClick={() => onNav("earn")}>
            <TrendingUp size={12} />Stake
          </button>
          <button className="dh-btn" onClick={() => onNav("analytics")}>
            <BarChart2 size={12} />History
          </button>
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

        {/* Agent status */}
        <div className="agp">
          <div className="agp-h">
            <div className="agp-hl">
              <div className="ag-led" />
              <div className="agp-ht">Agents</div>
            </div>
            <button className="card-a" onClick={() => onNav("myagent")}>View all →</button>
          </div>
          <div className="agp-feed">
            {[
              { Icon: Zap,           label: "Rate Watch",        sub: "Monitors SOMI & ETH rates 24/7" },
              { Icon: Brain,         label: "LLM Decision",      sub: "Finds optimal conversion window" },
              { Icon: CalendarCheck, label: "Payroll Execution", sub: "Fires transfers on payday" },
            ].map(({ Icon, label, sub }) => (
              <div className="ag-item" key={label}>
                <div className="ai-ic"><Icon size={11} /></div>
                <div className="ai-body">
                  <div className="ai-title">{label}</div>
                  <div className="ai-sub">{sub}</div>
                </div>
                <div className="ai-time" style={{ color: isSetUp ? "#4FC490" : "var(--text3)" }}>
                  {isSetUp ? "Active" : "Waiting"}
                </div>
              </div>
            ))}
            {!isConnected && (
              <div style={{ padding: "1rem 1.25rem", fontSize: "12px", color: "var(--text3)" }}>
                Connect your wallet to activate agents.
              </div>
            )}
            {isConnected && !isSetUp && (
              <div style={{ padding: "1rem 1.25rem", fontSize: "12px", color: "var(--text3)" }}>
                Set up your vault to activate agents.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
