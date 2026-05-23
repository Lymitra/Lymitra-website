"use client";

import { useEffect, useRef } from "react";
import { useAccount, useBalance } from "wagmi";
import { formatUnits } from "viem";
import Image from "next/image";
import { TrendingUp, Users, BarChart2, Zap, Brain, CalendarCheck, AlertTriangle, ArrowRight, FileText, Shield } from "lucide-react";
import {
  useCompany, useEmployees, useMonthlyPayroll,
  useStakeOf, usePendingReward, useClaimReward,
  useWethBalance, useWbtcBalance, useWbnbBalance, useUsdcBalance, useUsdtBalance,
  useSomiUsdPrice, useWethUsdPrice, useWbtcUsdPrice, useBnbUsdPrice,
  useLymBalance, fmtUsdc, fmtStt, fmtLym,
} from "@/lib/hooks";
import { activeChain } from "@/lib/chains";

const LOGO: Record<string, string> = {
  LYM:  "/logos/lym.svg",
  SOMI: "/logos/somi-token-roundel-1.png",
  ETH:  "/logos/eth.png",
  BTC:  "/logos/btc.png",
  BNB:  "/logos/bnb.png",
  USDC: "/logos/usdc.png",
  USDT: "/logos/usdt.png",
};

function TokenImg({ symbol, size = 32 }: { symbol: string; size?: number }) {
  return (
    <Image
      src={LOGO[symbol] ?? LOGO["USDC"]}
      width={size} height={size} alt={symbol}
      unoptimized
      style={{ borderRadius: "50%", display: "block", flexShrink: 0 }}
    />
  );
}

function usd(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmt(n: number, d = 4) {
  return n.toLocaleString("en-US", { maximumFractionDigits: d });
}
function oracleToNum(raw?: bigint): number | null {
  if (!raw || raw === 0n) return null;
  return Number(raw) / 1e6;
}

type Panel = "dashboard" | "aichat" | "myagent" | "vault" | "payments" | "earn" | "analytics";
interface DashboardProps { onNav: (panel: Panel) => void }

export function Dashboard({ onNav }: DashboardProps) {
  const { address, isConnected } = useAccount();

  const { data: somiRaw } = useSomiUsdPrice();
  const { data: wethRaw } = useWethUsdPrice();
  const { data: wbtcRaw } = useWbtcUsdPrice();

  const somiPrice = oracleToNum(somiRaw as bigint | undefined);
  const ethPrice  = oracleToNum(wethRaw as bigint | undefined);
  const btcPrice  = oracleToNum(wbtcRaw as bigint | undefined);
  const bnbPrice  = useBnbUsdPrice();

  const { data: company }      = useCompany(address);
  const { data: employees }    = useEmployees(address);
  const { data: monthlyTotal } = useMonthlyPayroll(address);
  const { data: staked }       = useStakeOf(address);
  const { data: pendingReward, refetch: refetchReward } = usePendingReward(address);
  const { claim, isPending: claiming } = useClaimReward();
  const { data: lymBalance }   = useLymBalance(address);

  const isSetUp     = company?.owner === address;
  const companyName = company?.name as string | undefined;

  // Vault balances — tokens live in the vault contract after deposit
  const vaultUsdc = company?.usdcBalance as bigint | undefined;
  const nextPayrollMs = company?.nextPayrollMs as bigint | undefined;
  const empCount      = employees ? (employees as unknown[]).length : 0;
  const runwayMonths  = vaultUsdc && monthlyTotal && (monthlyTotal as bigint) > 0n
    ? (Number(vaultUsdc) / Number(monthlyTotal as bigint)).toFixed(1) : null;
  const lowVault      = runwayMonths !== null && Number(runwayMonths) < 1;
  const nextPayrollDate = nextPayrollMs && (nextPayrollMs as bigint) > 0n
    ? new Date(Number(nextPayrollMs)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  async function handleClaim() {
    try { await claim(); refetchReward(); } catch {}
  }

  // Wallet balances — what the user currently holds
  const { data: sttRaw  } = useBalance({ address, chainId: activeChain.id });
  const { data: wethBal } = useWethBalance(address);
  const { data: wbtcBal } = useWbtcBalance(address);
  const { data: wbnbBal } = useWbnbBalance(address);
  const { data: usdcBal } = useUsdcBalance(address);
  const { data: usdtBal } = useUsdtBalance(address);

  const somiAmt = sttRaw  ? Number(sttRaw.formatted)                  : 0;
  const wethAmt = wethBal ? Number(formatUnits(wethBal as bigint, 18)) : 0;
  const wbtcAmt = wbtcBal ? Number(wbtcBal) / 1e8                     : 0;
  const wbnbAmt = wbnbBal ? Number(formatUnits(wbnbBal as bigint, 18)) : 0;
  const usdcAmt = usdcBal ? Number(formatUnits(usdcBal as bigint, 6))  : 0;
  const usdtAmt = usdtBal ? Number(formatUnits(usdtBal as bigint, 6))  : 0;

  const somiUsd = somiPrice ? somiAmt * somiPrice : 0;
  const wethUsd = ethPrice  ? wethAmt * ethPrice  : 0;
  const wbtcUsd = btcPrice  ? wbtcAmt * btcPrice  : 0;
  const wbnbUsd = wbnbAmt   * bnbPrice;
  const totalUsd = somiUsd + wethUsd + wbtcUsd + wbnbUsd + usdcAmt + usdtAmt;

  const counterRef = useRef<HTMLDivElement>(null);
  const prevTotal  = useRef(0);
  useEffect(() => {
    const el = counterRef.current;
    if (!el) return;
    const from = prevTotal.current;
    prevTotal.current = totalUsd;
    const dur = 800;
    const t0  = performance.now();
    function step(now: number) {
      const p = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el!.textContent = usd(from + (totalUsd - from) * ease);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [totalUsd]);

  const lymAmt = lymBalance ? Number(lymBalance as bigint) / 1e18 : 0;

  const volatile = [
    { symbol: "SOMI", fmtAmt: fmt(somiAmt, 3),  tag: null },
    { symbol: "LYM",  fmtAmt: fmt(lymAmt, 2),   tag: "Rewards" },
    { symbol: "ETH",  fmtAmt: fmt(wethAmt, 4),  tag: null },
    { symbol: "BTC",  fmtAmt: fmt(wbtcAmt, 6),  tag: null },
    { symbol: "BNB",  fmtAmt: fmt(wbnbAmt, 3),  tag: null },
  ];
  const stable = [
    { symbol: "USDC", usdVal: usdcAmt, fmtAmt: fmt(usdcAmt, 2) },
    { symbol: "USDT", usdVal: usdtAmt, fmtAmt: fmt(usdtAmt, 2) },
  ];

  const agents = [
    { Icon: Zap,           label: "Rate Watch",        desc: "Monitors prices 24/7" },
    { Icon: Brain,         label: "AI Decision",       desc: "Converts at the best rate" },
    { Icon: CalendarCheck, label: "Auto Payroll",      desc: "Pays team on payday" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="dash-hero">
        <div className="dh-glow" />
        <div className="dh-top">
          <div className="dh-lbl">{companyName ? companyName + " · Portfolio value" : "Total portfolio value"}</div>
          <div className="dh-ai-badge">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3ED9B8", animation: "pulse 1.8s ease-in-out infinite", display: "inline-block", flexShrink: 0 }} />
            {isSetUp ? "Agents live" : "Connect vault to start"}
          </div>
        </div>
        <div className="dh-amt" ref={counterRef}>{usd(totalUsd)}</div>

        {/* Live price strip */}
        <div className="dh-prices" style={{ flexWrap: "wrap", gap: "6px 14px" }}>
          {[
            { symbol: "SOMI", price: somiPrice ? "$" + somiPrice.toFixed(4) : "—" },
            { symbol: "ETH",  price: ethPrice  ? "$" + Math.round(ethPrice).toLocaleString() : "—" },
            { symbol: "BTC",  price: btcPrice  ? "$" + Math.round(btcPrice).toLocaleString() : "—" },
            { symbol: "BNB",  price: "$" + Math.round(bnbPrice).toLocaleString() },
            { symbol: "USDC", price: "$1.00" },
            { symbol: "USDT", price: "$1.00" },
          ].map(({ symbol, price }) => (
            <div className="dh-price-item" key={symbol}>
              <TokenImg symbol={symbol} size={16} />
              <span className="dh-price-lbl">{symbol}</span>
              <span className="dh-price-val">{price}</span>
            </div>
          ))}
        </div>

        {/* App flow steps */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap", marginTop: "1.25rem" }}>
          {[
            { step: "1", label: "Deposit", sub: "Crypto in", nav: "vault",     Icon: TrendingUp, accent: true },
            { step: "2", label: "Add Team", sub: "Set salaries", nav: "payments", Icon: Users,      accent: false },
            { step: "3", label: "Stake",   sub: "Earn rewards", nav: "earn",     Icon: TrendingUp, accent: false },
            { step: "4", label: "History", sub: "Audit trail",  nav: "analytics",Icon: BarChart2,  accent: false },
          ].map(({ step, label, sub, nav, Icon, accent }, i) => (
            <div key={step} style={{ display: "flex", alignItems: "center" }}>
              <button
                onClick={() => onNav(nav as Panel)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "flex-start",
                  gap: 1, padding: "8px 14px", borderRadius: 10, cursor: "pointer",
                  background: accent ? "rgba(62,217,184,0.1)" : "var(--bg3)",
                  border: accent ? "1px solid rgba(62,217,184,0.25)" : "1px solid var(--border)",
                  fontFamily: "inherit", transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: accent ? "#3ED9B8" : "var(--text3)", letterSpacing: "0.06em" }}>
                    {step}
                  </span>
                  <Icon size={10} color={accent ? "#3ED9B8" : "var(--text3)"} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: accent ? "var(--text)" : "var(--text2)" }}>{label}</div>
                <div style={{ fontSize: 10, color: "var(--text3)" }}>{sub}</div>
              </button>
              {i < 3 && (
                <div style={{ width: 20, textAlign: "center", fontSize: 10, color: "var(--text3)", flexShrink: 0 }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── 4-stat strip ─────────────────────────────────────────────── */}
      <div className="ss">
        <div className="sc">
          <div className="sc-l">Payroll reserve</div>
          <div className="sc-v accent">{isSetUp ? fmtUsdc(vaultUsdc) : "—"}</div>
          <div className="sc-s">USDC + USDT ready</div>
        </div>
        <div className="sc">
          <div className="sc-l">Monthly payroll</div>
          <div className="sc-v">{isSetUp ? fmtUsdc(monthlyTotal as bigint | undefined) : "—"}</div>
          <div className="sc-s">{empCount > 0 ? `across ${empCount} employees` : "total salaries"}</div>
        </div>
        <div className="sc">
          <div className="sc-l">Next payday</div>
          <div className="sc-v" style={{ fontSize: nextPayrollDate ? 14 : 24, paddingTop: nextPayrollDate ? 6 : 0 }}>
            {nextPayrollDate ?? "—"}
          </div>
          <div className="sc-s">auto-executed</div>
        </div>
        <div className="sc">
          <div className="sc-l">Runway</div>
          <div className="sc-v" style={{ color: lowVault ? "#ff6b6b" : "var(--green)" }}>
            {runwayMonths ? runwayMonths + " mo" : "—"}
          </div>
          <div className="sc-s">months of payroll left</div>
        </div>
      </div>

      {/* ── Low vault warning ──────────────────────────────────────────── */}
      {lowVault && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.25)", borderRadius: 10, padding: "0.75rem 1rem", fontSize: 13 }}>
          <AlertTriangle size={15} color="#ff6b6b" style={{ flexShrink: 0 }} />
          <div>
            <span style={{ color: "#ff6b6b", fontWeight: 600 }}>Vault running low. </span>
            <span style={{ color: "var(--text2)" }}>less than 1 month of payroll remaining.</span>
          </div>
          <button className="tb-btn" style={{ marginLeft: "auto", flexShrink: 0 }} onClick={() => onNav("vault")}>Top up →</button>
        </div>
      )}

      {/* ── Main 2-col grid ───────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1rem", alignItems: "stretch" }}
           className="dash-main-grid">

        {/* Holdings */}
        <div className="card" style={{ height: "100%" }}>
          <div className="card-h">
            <div className="card-t">Holdings</div>
            <button className="card-a" onClick={() => onNav("vault")}>Deposit →</button>
          </div>

          {/* Volatile */}
          <div style={{ padding: "0.5rem 1.25rem 0.25rem", fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Volatile
          </div>
          {volatile.map(({ symbol, fmtAmt, tag }) => (
            <div key={symbol} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "0.7rem 1.25rem",
              borderBottom: "1px solid var(--border)",
              background: symbol === "LYM" ? "rgba(27,63,191,0.05)" : "transparent",
            }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <TokenImg symbol={symbol} size={36} />
                {symbol === "LYM" && (
                  <div style={{
                    position: "absolute", bottom: -2, right: -2,
                    width: 12, height: 12, borderRadius: "50%",
                    background: "#4FC4A8", border: "1.5px solid var(--bg1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{symbol}</span>
                  {tag && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: "0.07em",
                      textTransform: "uppercase", color: "#4FC4A8",
                      background: "rgba(79,196,168,0.12)", border: "1px solid rgba(79,196,168,0.25)",
                      borderRadius: 4, padding: "1px 5px",
                    }}>{tag}</span>
                  )}
                </div>
                {symbol === "LYM" && (
                  <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 1 }}>Lymitra Rewards Token</div>
                )}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: symbol === "LYM" ? "#4FC4A8" : "var(--text)" }}>
                  {isConnected ? fmtAmt + " " + symbol : "—"}
                </div>
              </div>
            </div>
          ))}

          {/* Stable */}
          <div style={{ padding: "0.75rem 1.25rem 0.25rem", fontSize: 11, fontWeight: 600, color: "#4FC490", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Stable
          </div>
          {stable.map(({ symbol, fmtAmt }) => (
            <div key={symbol} style={{ display: "flex", alignItems: "center", gap: 12, padding: "0.7rem 1.25rem", borderBottom: "1px solid var(--border)" }}>
              <TokenImg symbol={symbol} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{symbol}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{isConnected ? fmtAmt + " " + symbol : "—"}</div>
              </div>
            </div>
          ))}

          {!isConnected && (
            <div style={{ padding: "1.5rem", textAlign: "center", fontSize: 13, color: "var(--text3)" }}>
              Connect your wallet to see your balances.
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", height: "100%" }}>

          {/* Next payroll */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-h">
              <div className="card-t">Next payroll</div>
              {isSetUp && <button className="card-a" onClick={() => onNav("payments")}>Edit →</button>}
            </div>
            <div style={{ padding: "1rem 1.25rem" }}>
              {nextPayrollDate ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)" }}>{nextPayrollDate}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#4FC490" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4FC490", animation: "pulse 1.8s ease-in-out infinite", display: "inline-block" }} />
                    Agents handle this automatically
                  </div>
                </div>
              ) : isSetUp ? (
                <div>
                  <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 10 }}>No payroll scheduled yet.</div>
                  <button className="tb-btn" style={{ display: "flex", alignItems: "center", gap: 5 }} onClick={() => onNav("payments")}>
                    Schedule now <ArrowRight size={11} />
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 10 }}>Register your company first.</div>
                  <button className="tb-btn" style={{ display: "flex", alignItems: "center", gap: 5 }} onClick={() => onNav("vault")}>
                    Go to Vault <ArrowRight size={11} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Rewards */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-h">
              <div className="card-t">Rewards</div>
              <button className="card-a" onClick={() => onNav("earn")}>Manage →</button>
            </div>
            <div style={{ padding: "0.85rem 1.25rem", display: "flex", flexDirection: "column", gap: 8 }}>

              {/* LYM row */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.6rem 0.85rem", background: "rgba(27,63,191,0.07)", border: "1px solid rgba(79,196,168,0.2)", borderRadius: 10 }}>
                <Image src="/logos/lym.svg" width={28} height={28} alt="LYM" unoptimized style={{ borderRadius: "50%", display: "block", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: "var(--text3)", textTransform: "uppercase" }}>LYM Earned</div>
                  <div style={{ fontSize: 9, color: "var(--text3)" }}>1 per employee per run</div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#4FC4A8", flexShrink: 0 }}>{fmtLym(lymBalance as bigint | undefined)}</div>
              </div>

              {/* USDC staking row */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.6rem 0.85rem", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 10 }}>
                <Image src="/logos/usdc.png" width={28} height={28} alt="USDC" unoptimized style={{ borderRadius: "50%", display: "block", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: "var(--text3)", textTransform: "uppercase" }}>USDC Yield</div>
                  <div style={{ fontSize: 9, color: "var(--text3)" }}>{fmtStt(staked as bigint | undefined)} SOMI staked</div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--accent)", flexShrink: 0 }}>{fmtUsdc(pendingReward as bigint | undefined)}</div>
              </div>

              {(pendingReward as bigint | undefined) && (pendingReward as bigint) > 0n && (
                <button className="sub-btn" onClick={handleClaim} disabled={claiming} style={{ marginTop: 2 }}>
                  {claiming ? "Claiming…" : `Claim ${fmtUsdc(pendingReward as bigint)} USDC`}
                </button>
              )}
            </div>
          </div>

          {/* Agent status */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-h">
              <div className="card-t">
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div className="ag-led" style={{ width: 7, height: 7 }} />
                  Agents
                </span>
              </div>
              <button className="card-a" onClick={() => onNav("myagent")}>View →</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {agents.map(({ Icon, label, desc }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.7rem 1.25rem", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: isSetUp ? "rgba(79,196,144,0.1)" : "var(--bg2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={13} color={isSetUp ? "#4FC490" : "var(--text3)"} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{label}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{desc}</div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: isSetUp ? "#4FC490" : "var(--text3)", flexShrink: 0 }}>
                    {isSetUp ? "Live" : "Off"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Finance Reports teaser ─────────────────────────────────── */}
      <div className="card" style={{ marginTop: "1rem" }}>
        <div className="card-h">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(62,217,184,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={13} color="#3ED9B8" />
            </div>
            <div className="card-t">Finance Reports</div>
          </div>
          <button className="card-a" onClick={() => onNav("analytics")}>Open hub →</button>
        </div>
        <div style={{ padding: "0.75rem 1.25rem 1rem", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {[
            { Icon: BarChart2,     color: "#5B7FFF", title: "Monthly Summary",  sub: "Payroll breakdown · CFO-ready" },
            { Icon: CalendarCheck, color: "#3ED9B8", title: "Quarterly Audit",  sub: "Compliance report · Download" },
            { Icon: FileText,      color: "#F3BA2F", title: "Invoice",          sub: "Itemised · Per payroll cycle" },
          ].map(({ Icon, color, title, sub }) => (
            <button
              key={title}
              onClick={() => onNav("analytics")}
              style={{
                display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6,
                padding: "0.8rem 0.9rem", borderRadius: 10, cursor: "pointer", textAlign: "left",
                background: `${color}08`, border: `1px solid ${color}25`, fontFamily: "inherit",
              }}
            >
              <Icon size={14} color={color} />
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{title}</div>
              <div style={{ fontSize: 10, color: "var(--text3)", lineHeight: 1.4 }}>{sub}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
