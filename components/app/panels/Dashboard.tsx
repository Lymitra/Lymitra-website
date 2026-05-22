"use client";

import { useEffect, useState, useRef } from "react";
import { useAccount, useBalance } from "wagmi";
import { formatUnits } from "viem";
import { TrendingUp, Users, BarChart2, Zap, Brain, CalendarCheck, AlertTriangle } from "lucide-react";
import {
  useCompany, useEmployees, useMonthlyPayroll,
  useStakeOf, usePendingReward, useClaimReward,
  useUsdcBalance, useWethBalance, useWbtcBalance, useWbnbBalance, useUsdtBalance,
  useSomiUsdPrice, useWethUsdPrice, useWbtcUsdPrice,
  fmtUsdc, fmtStt,
} from "@/lib/hooks";
import { activeChain } from "@/lib/chains";

// Token brand colors + symbols
const TOKENS = [
  { id: "somi", label: "SOMI", color: "#9B7FFF", stable: false },
  { id: "eth",  label: "ETH",  color: "#627EEA", stable: false },
  { id: "btc",  label: "BTC",  color: "#F7931A", stable: false },
  { id: "bnb",  label: "BNB",  color: "#F3BA2F", stable: false },
  { id: "usdc", label: "USDC", color: "#2775CA", stable: true  },
  { id: "usdt", label: "USDT", color: "#26A17B", stable: true  },
] as const;

function TokenLogo({ label, color, size = 34 }: { label: string; color: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.28, fontWeight: 800, color: "#fff", flexShrink: 0,
      letterSpacing: "-0.5px",
    }}>
      {label.slice(0, 3)}
    </div>
  );
}

function fmt(n: number, decimals = 4) {
  return n.toLocaleString("en-US", { maximumFractionDigits: decimals });
}
function usd(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
// Convert 6-dec oracle uint to human price
function oracleToNum(raw?: bigint): number | null {
  if (raw === undefined || raw === 0n) return null;
  return Number(raw) / 1e6;
}

type Panel = "dashboard" | "aichat" | "myagent" | "vault" | "payments" | "earn" | "analytics";
interface DashboardProps { onNav: (panel: Panel) => void }

export function Dashboard({ onNav }: DashboardProps) {
  const { address, isConnected } = useAccount();

  // On-chain oracle prices (DIA — free, always fresh)
  const { data: somiRaw } = useSomiUsdPrice();
  const { data: wethRaw } = useWethUsdPrice();
  const { data: wbtcRaw } = useWbtcUsdPrice();

  const somiPrice = oracleToNum(somiRaw as bigint | undefined);
  const ethPrice  = oracleToNum(wethRaw as bigint | undefined);
  const btcPrice  = oracleToNum(wbtcRaw as bigint | undefined);
  // BNB: no oracle on testnet — show seeded DEX price
  const bnbPrice  = 600;

  const { data: company }      = useCompany(address);
  const { data: employees }    = useEmployees(address);
  const { data: monthlyTotal } = useMonthlyPayroll(address);
  const { data: staked }       = useStakeOf(address);
  const { data: pendingReward, refetch: refetchReward } = usePendingReward(address);
  const { claim, isPending: claiming } = useClaimReward();
  const isSetUp = company?.owner === address;

  const vaultUsdc     = company?.usdcBalance as bigint | undefined;
  const companyName   = company?.name as string | undefined;
  const nextPayrollMs = company?.nextPayrollMs as bigint | undefined;
  const empCount      = employees ? (employees as unknown[]).length : 0;
  const runwayMonths  =
    vaultUsdc && monthlyTotal && (monthlyTotal as bigint) > 0n
      ? (Number(vaultUsdc) / Number(monthlyTotal as bigint)).toFixed(1)
      : null;
  const lowVault = runwayMonths !== null && Number(runwayMonths) < 1;

  const nextPayrollDate = nextPayrollMs && (nextPayrollMs as bigint) > 0n
    ? new Date(Number(nextPayrollMs)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  async function handleClaim() {
    try { await claim(); refetchReward(); } catch {}
  }

  // Wallet balances
  const { data: sttRaw  } = useBalance({ address, chainId: activeChain.id });
  const { data: wethBal } = useWethBalance(address);
  const { data: wbtcBal } = useWbtcBalance(address);
  const { data: wbnbBal } = useWbnbBalance(address);
  const { data: usdcBal } = useUsdcBalance(address);
  const { data: usdtBal } = useUsdtBalance(address);

  const sttAmt  = sttRaw  ? Number(sttRaw.formatted)                  : 0;
  const wethAmt = wethBal ? Number(formatUnits(wethBal as bigint, 18)) : 0;
  const wbtcAmt = wbtcBal ? Number(wbtcBal) / 1e8                     : 0;
  const wbnbAmt = wbnbBal ? Number(formatUnits(wbnbBal as bigint, 18)) : 0;
  const usdcAmt = usdcBal ? Number(formatUnits(usdcBal as bigint, 6))  : 0;
  const usdtAmt = usdtBal ? Number(formatUnits(usdtBal as bigint, 6))  : 0;

  const sttUsd  = somiPrice ? sttAmt  * somiPrice : null;
  const wethUsd = ethPrice  ? wethAmt * ethPrice  : null;
  const wbtcUsd = btcPrice  ? wbtcAmt * btcPrice  : null;
  const wbnbUsd = wbnbAmt   * bnbPrice;
  const totalUsd = sttUsd !== null && wethUsd !== null && wbtcUsd !== null
    ? sttUsd + wethUsd + wbtcUsd + wbnbUsd + usdcAmt + usdtAmt
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

  // Live price ticker data
  const priceTicker = [
    { label: "SOMI", price: somiPrice ? "$" + somiPrice.toFixed(4) : "—",     color: "#9B7FFF" },
    { label: "ETH",  price: ethPrice  ? "$" + Math.round(ethPrice).toLocaleString() : "—", color: "#627EEA" },
    { label: "BTC",  price: btcPrice  ? "$" + Math.round(btcPrice).toLocaleString() : "—", color: "#F7931A" },
    { label: "BNB",  price: "$" + bnbPrice.toLocaleString(),                  color: "#F3BA2F" },
    { label: "USDC", price: "$1.00",                                           color: "#2775CA" },
    { label: "USDT", price: "$1.00",                                           color: "#26A17B" },
  ];

  // Holdings rows
  const holdings = [
    { label: "SOMI", color: "#9B7FFF", usdVal: sttUsd,  amt: fmt(sttAmt, 3)  + " SOMI", price: somiPrice ? "$" + somiPrice.toFixed(4) : "—" },
    { label: "ETH",  color: "#627EEA", usdVal: wethUsd, amt: fmt(wethAmt, 4) + " ETH",  price: ethPrice  ? "$" + Math.round(ethPrice).toLocaleString() : "—" },
    { label: "BTC",  color: "#F7931A", usdVal: wbtcUsd, amt: fmt(wbtcAmt, 6) + " BTC",  price: btcPrice  ? "$" + Math.round(btcPrice).toLocaleString() : "—" },
    { label: "BNB",  color: "#F3BA2F", usdVal: wbnbUsd, amt: fmt(wbnbAmt, 3) + " BNB",  price: "$" + bnbPrice },
    { label: "USDC", color: "#2775CA", usdVal: usdcAmt, amt: fmt(usdcAmt, 2) + " USDC", price: "$1.00" },
    { label: "USDT", color: "#26A17B", usdVal: usdtAmt, amt: fmt(usdtAmt, 2) + " USDT", price: "$1.00" },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="dash-hero">
        <div className="dh-glow" />
        <div className="dh-top">
          <div className="dh-lbl">{companyName ?? "Total portfolio value"}</div>
          <div className="dh-ai-badge">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3ED9B8", animation: "pulse 1.8s ease-in-out infinite", display: "inline-block", flexShrink: 0 }} />
            {isSetUp ? "Agents active" : "AI ready"}
          </div>
        </div>
        <div className="dh-amt" ref={counterRef}>
          {totalUsd !== null ? usd(totalUsd) : isConnected ? "Loading…" : "—"}
        </div>

        {/* 6-token live price strip */}
        <div className="dh-prices" style={{ flexWrap: "wrap", gap: "6px 16px" }}>
          {priceTicker.map(({ label, price, color }) => (
            <div className="dh-price-item" key={label}>
              <TokenLogo label={label} color={color} size={18} />
              <span className="dh-price-lbl">{label}</span>
              <span className="dh-price-val">{price}</span>
            </div>
          ))}
        </div>

        <div className="dh-acts">
          <button className="dh-btn p" onClick={() => onNav("vault")}>+ Deposit</button>
          <button className="dh-btn" onClick={() => onNav("payments")}><Users size={12} />Team</button>
          <button className="dh-btn" onClick={() => onNav("earn")}><TrendingUp size={12} />Stake</button>
          <button className="dh-btn" onClick={() => onNav("analytics")}><BarChart2 size={12} />History</button>
        </div>
      </div>

      {/* Payroll stat strip */}
      <div className="ss">
        <div className="sc">
          <div className="sc-l">Vault (USDC+USDT)</div>
          <div className="sc-v accent">{isSetUp ? fmtUsdc(vaultUsdc) : "—"}</div>
          <div className="sc-s">stable reserve</div>
        </div>
        <div className="sc">
          <div className="sc-l">Monthly payroll</div>
          <div className="sc-v">{isSetUp ? fmtUsdc(monthlyTotal as bigint | undefined) : "—"}</div>
          <div className="sc-s">total across team</div>
        </div>
        <div className="sc">
          <div className="sc-l">Employees</div>
          <div className="sc-v gold">{isConnected ? empCount : "—"}</div>
          <div className="sc-s">on payroll</div>
        </div>
        <div className="sc">
          <div className="sc-l">Runway</div>
          <div className="sc-v green">{runwayMonths ? runwayMonths + " mo" : "—"}</div>
          <div className="sc-s">months covered</div>
        </div>
      </div>

      {lowVault && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.25)", borderRadius: 10, padding: "0.75rem 1rem", marginBottom: "1.25rem", fontSize: 13 }}>
          <AlertTriangle size={15} color="#ff6b6b" style={{ flexShrink: 0 }} />
          <span style={{ color: "#ff6b6b", fontWeight: 600 }}>Vault running low</span>
          <span style={{ color: "var(--text2)", marginLeft: 4 }}>Less than 1 month of payroll remaining. Deposit tokens to top up.</span>
          <button className="tb-btn" style={{ marginLeft: "auto", flexShrink: 0 }} onClick={() => onNav("vault")}>Deposit →</button>
        </div>
      )}

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
        {/* Holdings — all 6 tokens */}
        <div className="card">
          <div className="card-h">
            <div className="card-t">Holdings</div>
            <button className="card-a" onClick={() => onNav("vault")}>Manage →</button>
          </div>
          {holdings.map(({ label, color, usdVal, amt, price }) => (
            <div className="tr" key={label}>
              <div className="db-logo">
                <TokenLogo label={label} color={color} size={34} />
              </div>
              <div className="ti-inf">
                <div className="ti-n">{label}</div>
                <div className="ti-t">{price}</div>
              </div>
              <div className="t-bal">
                <div className="t-usd">{isConnected ? usd(usdVal ?? 0) : "—"}</div>
                <div className="t-amt">{isConnected ? amt : "—"}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Next payroll + staking */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card">
            <div className="card-h">
              <div className="card-t">Next payroll</div>
              {isSetUp && <button className="card-a" onClick={() => onNav("payments")}>Manage →</button>}
            </div>
            <div style={{ padding: "1.1rem" }}>
              {nextPayrollDate ? (
                <>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)", marginBottom: 4 }}>{nextPayrollDate}</div>
                  <div style={{ fontSize: 12, color: "var(--text2)" }}>
                    {fmtUsdc(monthlyTotal as bigint | undefined)} · {empCount} {empCount === 1 ? "employee" : "employees"}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 13, color: "var(--text3)" }}>
                  {isSetUp ? "No payroll scheduled yet." : "Set up your vault to schedule payroll."}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-h">
              <div className="card-t">Staking</div>
              <button className="card-a" onClick={() => onNav("earn")}>View →</button>
            </div>
            <div style={{ padding: "1.1rem" }}>
              <div className="kv">
                <span className="kk">Staked</span>
                <span className="kv-v gold">{fmtStt(staked as bigint | undefined)} SOMI</span>
              </div>
              <div className="kv">
                <span className="kk">Pending reward</span>
                <span className="kv-v accent">{fmtUsdc(pendingReward as bigint | undefined)}</span>
              </div>
              {(pendingReward as bigint | undefined) && (pendingReward as bigint) > 0n && (
                <button className="sub-btn" onClick={handleClaim} disabled={claiming} style={{ marginTop: "0.75rem" }}>
                  {claiming ? "Claiming…" : `Claim ${fmtUsdc(pendingReward as bigint)} USDC`}
                </button>
              )}
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
              { Icon: Zap,           label: "Rate Watch",        sub: "Monitors SOMI, ETH, BTC rates 24/7 via DIA oracle" },
              { Icon: Brain,         label: "LLM Decision",      sub: "Picks optimal moment to convert 4 volatile tokens" },
              { Icon: CalendarCheck, label: "Payroll Execution", sub: "Sends USDC/USDT to all employees on payday" },
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
