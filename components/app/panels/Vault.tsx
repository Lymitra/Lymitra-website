"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { useAccount } from "wagmi";
import { parseUnits } from "viem";
import {
  useCompany, useRegisterCompany, useExecutePayrollManual, useMonthlyPayroll,
  useDepositSomi,
  useDepositWeth,  useWethBalance,  useWethAllowance,
  useDepositWbtc,  useWbtcBalance,  useWbtcAllowance,
  useDepositWbnb,  useWbnbBalance,  useWbnbAllowance,
  useDeposit,      useUsdcBalance,  useUsdcAllowance,
  useDepositUsdt,  useUsdtBalance,  useUsdtAllowance,
  fmtUsdc, fmtStt,
} from "@/lib/hooks";

interface VaultProps { onSuccess: () => void }

type Tab = "somi" | "eth" | "btc" | "bnb" | "usdc" | "usdt";

const TABS: { id: Tab; label: string; color: string; desc: string }[] = [
  { id: "somi", label: "SOMI", color: "#9B7FFF", desc: "Native Somnia token" },
  { id: "eth",  label: "ETH",  color: "#627EEA", desc: "Bridged Ethereum" },
  { id: "btc",  label: "BTC",  color: "#F7931A", desc: "Bridged Bitcoin" },
  { id: "bnb",  label: "BNB",  color: "#F3BA2F", desc: "Bridged BNB" },
  { id: "usdc", label: "USDC", color: "#2775CA", desc: "USD Coin stablecoin" },
  { id: "usdt", label: "USDT", color: "#26A17B", desc: "Tether stablecoin" },
];

function TokenBadge({ symbol, color }: { symbol: string; color: string }) {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: "50%", background: color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 10, fontWeight: 800, color: "#fff", flexShrink: 0,
      letterSpacing: "-0.5px",
    }}>
      {symbol.slice(0, 3)}
    </div>
  );
}

export function Vault({ onSuccess }: VaultProps) {
  const { address, isConnected } = useAccount();

  const { data: company, refetch: refetchCompany } = useCompany(address);
  const { data: payrollAmt } = useMonthlyPayroll(address);

  // balances
  const { data: wethBal } = useWethBalance(address);
  const { data: wbtcBal } = useWbtcBalance(address);
  const { data: wbnbBal } = useWbnbBalance(address);
  const { data: usdcBal } = useUsdcBalance(address);
  const { data: usdtBal } = useUsdtBalance(address);

  // allowances
  const { data: wethAllow, refetch: refetchWethAllow } = useWethAllowance(address);
  const { data: wbtcAllow, refetch: refetchWbtcAllow } = useWbtcAllowance(address);
  const { data: wbnbAllow, refetch: refetchWbnbAllow } = useWbnbAllowance(address);
  const { data: usdcAllow, refetch: refetchUsdcAllow } = useUsdcAllowance(address);
  const { data: usdtAllow, refetch: refetchUsdtAllow } = useUsdtAllowance(address);

  // write hooks
  const { register, isPending: registering }              = useRegisterCompany();
  const { depositSomi, isPending: depositingSomi }        = useDepositSomi();
  const { approve: approveWeth, depositWeth, isPending: depositingWeth } = useDepositWeth();
  const { approve: approveWbtc, depositWbtc, isPending: depositingWbtc } = useDepositWbtc();
  const { approve: approveWbnb, depositWbnb, isPending: depositingWbnb } = useDepositWbnb();
  const { approve: approveUsdc, deposit: depositUsdc,  isPending: depositingUsdc }  = useDeposit();
  const { approve: approveUsdt, depositUsdt, isPending: depositingUsdt } = useDepositUsdt();
  const { execute, isPending: executing } = useExecutePayrollManual();

  const [tab, setTab]           = useState<Tab>("somi");
  const [amount, setAmount]     = useState("");
  const [companyName, setCompanyName] = useState("");
  const [txError, setTxError]   = useState("");
  const [approving, setApproving] = useState(false);

  const isRegistered = company?.owner === address;
  const vaultUsdc = company?.usdcBalance;
  const vaultUsdt = company?.usdtBalance;
  const vaultSomi = company?.somiBalance;
  const vaultWeth = company?.wethBalance;
  const vaultWbtc = company?.wbtcBalance;
  const vaultWbnb = company?.wbnbBalance;

  // Determine if current ERC-20 tab needs approval
  const amtParsed = (dec: number) => { try { return amount ? parseUnits(amount, dec) : 0n; } catch { return 0n; } };
  const needsApproval = (() => {
    if (tab === "eth")  return (wethAllow ?? 0n) < amtParsed(18) && amtParsed(18) > 0n;
    if (tab === "btc")  return (wbtcAllow ?? 0n) < amtParsed(8)  && amtParsed(8)  > 0n;
    if (tab === "bnb")  return (wbnbAllow ?? 0n) < amtParsed(18) && amtParsed(18) > 0n;
    if (tab === "usdc") return (usdcAllow ?? 0n) < amtParsed(6)  && amtParsed(6)  > 0n;
    if (tab === "usdt") return (usdtAllow ?? 0n) < amtParsed(6)  && amtParsed(6)  > 0n;
    return false;
  })();

  const walletBal = (() => {
    if (tab === "eth")  return wethBal ? fmtStt(wethBal as bigint) + " ETH"  : null;
    if (tab === "btc")  return wbtcBal ? (Number(wbtcBal) / 1e8).toFixed(6) + " BTC"  : null;
    if (tab === "bnb")  return wbnbBal ? fmtStt(wbnbBal as bigint) + " BNB"  : null;
    if (tab === "usdc") return usdcBal ? fmtUsdc(usdcBal as bigint) : null;
    if (tab === "usdt") return usdtBal ? fmtUsdc(usdtBal as bigint) + " USDT" : null;
    return null;
  })();

  async function handleRegister() {
    if (!companyName.trim()) return;
    try { await register(companyName.trim()); refetchCompany(); }
    catch (e: unknown) { setTxError(e instanceof Error ? e.message : "Register failed"); }
  }

  async function handleApprove() {
    if (!amount || Number(amount) <= 0) return;
    setTxError(""); setApproving(true);
    try {
      if (tab === "eth")  { await approveWeth(amount); refetchWethAllow(); }
      if (tab === "btc")  { await approveWbtc(amount); refetchWbtcAllow(); }
      if (tab === "bnb")  { await approveWbnb(amount); refetchWbnbAllow(); }
      if (tab === "usdc") { await approveUsdc(amount); refetchUsdcAllow(); }
      if (tab === "usdt") { await approveUsdt(amount); refetchUsdtAllow(); }
    } catch (e: unknown) { setTxError(e instanceof Error ? e.message : "Approval failed"); }
    finally { setApproving(false); }
  }

  async function handleDeposit() {
    if (!amount || Number(amount) <= 0) return;
    setTxError("");
    try {
      if (tab === "somi") await depositSomi(amount);
      if (tab === "eth")  await depositWeth(amount);
      if (tab === "btc")  await depositWbtc(amount);
      if (tab === "bnb")  await depositWbnb(amount);
      if (tab === "usdc") await depositUsdc(amount);
      if (tab === "usdt") await depositUsdt(amount);
      setAmount(""); refetchCompany(); onSuccess();
    } catch (e: unknown) { setTxError(e instanceof Error ? e.message : "Transaction failed"); }
  }

  async function handleManualRun() {
    setTxError("");
    try { await execute(); }
    catch (e: unknown) { setTxError(e instanceof Error ? e.message : "Execution failed"); }
  }

  if (!isConnected) return (
    <div>
      <div className="sec-hd" style={{ marginBottom: "1.5rem" }}>
        <div><div className="sec-ht">Vault</div><div className="sec-hs">Connect your wallet to get started</div></div>
      </div>
      <div className="f-card" style={{ textAlign: "center", padding: "2rem" }}>
        <p style={{ color: "var(--text2)" }}>Connect your wallet using the button in the top-right corner.</p>
      </div>
    </div>
  );

  const currentTab = TABS.find(t => t.id === tab)!;
  const isStable   = tab === "usdc" || tab === "usdt";
  const isSomi     = tab === "somi";
  const depositing = depositingSomi || depositingWeth || depositingWbtc || depositingWbnb || depositingUsdc || depositingUsdt;

  return (
    <div>
      <div className="sec-hd" style={{ marginBottom: "1.5rem" }}>
        <div>
          <div className="sec-ht">Vault</div>
          <div className="sec-hs">Multi-token treasury · 4 volatile · 2 stable · Somnia Testnet</div>
        </div>
        {isRegistered && (
          <button className="tb-btn" onClick={handleManualRun} disabled={executing}>
            {executing ? "Running…" : <><Play size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: 5 }} />Run payroll now</>}
          </button>
        )}
      </div>

      {/* Stats — volatile holdings */}
      <div className="ss" style={{ marginBottom: "0.75rem" }}>
        <div className="sc">
          <div className="sc-l">SOMI</div>
          <div className="sc-v" style={{ color: "#9B7FFF" }}>{fmtStt(vaultSomi as bigint | undefined)}</div>
          <div className="sc-s">in vault</div>
        </div>
        <div className="sc">
          <div className="sc-l">ETH</div>
          <div className="sc-v" style={{ color: "#627EEA" }}>{fmtStt(vaultWeth as bigint | undefined)}</div>
          <div className="sc-s">in vault</div>
        </div>
        <div className="sc">
          <div className="sc-l">BTC</div>
          <div className="sc-v" style={{ color: "#F7931A" }}>
            {vaultWbtc !== undefined ? (Number(vaultWbtc) / 1e8).toFixed(6) : "—"}
          </div>
          <div className="sc-s">in vault</div>
        </div>
        <div className="sc">
          <div className="sc-l">BNB</div>
          <div className="sc-v" style={{ color: "#F3BA2F" }}>{fmtStt(vaultWbnb as bigint | undefined)}</div>
          <div className="sc-s">in vault</div>
        </div>
      </div>

      {/* Stats — stable reserves */}
      <div className="ss" style={{ marginBottom: "1.5rem" }}>
        <div className="sc">
          <div className="sc-l">USDC reserve</div>
          <div className="sc-v accent">{fmtUsdc(vaultUsdc as bigint | undefined)}</div>
          <div className="sc-s">payroll-ready</div>
        </div>
        <div className="sc">
          <div className="sc-l">USDT reserve</div>
          <div className="sc-v accent">{fmtUsdc(vaultUsdt as bigint | undefined)}</div>
          <div className="sc-s">payroll-ready</div>
        </div>
        <div className="sc">
          <div className="sc-l">Monthly payroll</div>
          <div className="sc-v">{fmtUsdc(payrollAmt)}</div>
          <div className="sc-s">total all employees</div>
        </div>
        <div className="sc">
          <div className="sc-l">Agent gas</div>
          <div className="sc-v gold">1 SOMI</div>
          <div className="sc-s">seeded</div>
        </div>
      </div>

      <div className="fw">
        {!isRegistered && (
          <div className="f-card" style={{ marginBottom: "1rem" }}>
            <div className="f-head">
              <div className="f-title">Register your company</div>
              <div className="f-sub">One-time setup · Free · On-chain</div>
            </div>
            <div className="f-body">
              <label className="f-lbl">Company name</label>
              <input className="f-inp" placeholder="Acme Corp" value={companyName} onChange={e => setCompanyName(e.target.value)} />
              <button className="sub-btn" onClick={handleRegister} disabled={registering}>
                {registering ? "Registering…" : "Register company"}
              </button>
            </div>
          </div>
        )}

        <div className="f-card">
          <div className="f-head">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <TokenBadge symbol={currentTab.label} color={currentTab.color} />
              <div>
                <div className="f-title">Deposit {currentTab.label}</div>
                <div className="f-sub">{currentTab.desc}</div>
              </div>
            </div>
          </div>

          {/* Token tabs */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, padding: "0 1.25rem 0.75rem" }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setAmount(""); setTxError(""); }}
                style={{
                  padding: "5px 13px", borderRadius: 8, border: "none", cursor: "pointer",
                  fontFamily: "inherit", fontSize: 12, fontWeight: 700,
                  background: tab === t.id ? t.color : "var(--bg2)",
                  color: tab === t.id ? "#fff" : "var(--text2)",
                  transition: "all 0.15s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="f-body" style={{ paddingTop: "0.5rem" }}>
            <label className="f-lbl">
              Amount ({currentTab.label})
              {walletBal && (
                <span style={{ float: "right", fontSize: 11, color: "var(--text3)", fontWeight: 400 }}>
                  Wallet: {walletBal}
                </span>
              )}
            </label>
            <input
              className="f-inp"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              disabled={!isRegistered}
            />

            <div className="ag-box">
              <div className="ab-l"><div className="ab-d" />{isStable ? "Stablecoin deposit" : "How AI converts"}</div>
              <div className="ab-t">
                {isStable
                  ? `${currentTab.label} is payroll-ready — no conversion needed. Goes directly to your stable reserve.`
                  : `Deposit ${currentTab.label} → AI watches rate → converts to USDC at the best moment → employees get paid`}
              </div>
              {!isStable && (
                <div className="ab-b">
                  {isSomi
                    ? "Native SOMI wraps to WSTT then swaps via Lymitra DEX. No approve step needed."
                    : `Two steps: approve the vault, then deposit. Lymitra DEX handles ${currentTab.label}/USDC swap at payroll time.`}
                </div>
              )}
            </div>

            {!isRegistered && (
              <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: "0.5rem" }}>
                Register your company above before depositing.
              </div>
            )}
            {txError && (
              <div style={{ color: "#ff6b6b", fontSize: 12, marginBottom: "0.5rem", wordBreak: "break-all" }}>
                {txError.slice(0, 200)}
              </div>
            )}

            {/* Action button — approve first for ERC-20s, then deposit */}
            {!isSomi && needsApproval ? (
              <button className="sub-btn" onClick={handleApprove} disabled={!isRegistered || approving || !amount}>
                {approving ? "Approving…" : `Approve ${currentTab.label}`}
              </button>
            ) : (
              <button className="sub-btn" onClick={handleDeposit} disabled={!isRegistered || depositing || !amount}>
                {depositing ? "Depositing…" : `Deposit ${currentTab.label}`}
              </button>
            )}
            <div className="f-note">
              {isSomi ? "Native token · No approve needed" : isStable ? "Stable reserve · No AI conversion" : "ERC-20 · Step 1: approve · Step 2: deposit"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
