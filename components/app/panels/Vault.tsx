"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, ArrowDown } from "lucide-react";
import { useAccount, useBalance } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import {
  useCompany, useRegisterCompany, useExecutePayrollManual, useMonthlyPayroll,
  useDepositSomi,
  useDepositWeth,  useWethBalance,  useWethAllowance,
  useDepositWbtc,  useWbtcBalance,  useWbtcAllowance,
  useDepositWbnb,  useWbnbBalance,  useWbnbAllowance,
  useDeposit,      useUsdcBalance,  useUsdcAllowance,
  useDepositUsdt,  useUsdtBalance,  useUsdtAllowance,
  useGetAmountsOut, useRouterAllowance, useSwapTokens,
  useWsttBalance, useWrapStt,
  fmtUsdc, fmtStt,
} from "@/lib/hooks";
import { WETH_ADDRESS, WBTC_ADDRESS, WBNB_ADDRESS, WSTT_ADDRESS, USDC_ADDRESS } from "@/lib/chains";
import { activeChain } from "@/lib/chains";

type SwapTokenId = "somi" | "eth" | "btc" | "bnb";

const SWAP_TOKENS: { id: SwapTokenId; label: string; color: string; address: `0x${string}`; decimals: number }[] = [
  { id: "somi", label: "SOMI", color: "#9B7FFF", address: WSTT_ADDRESS, decimals: 18 },
  { id: "eth",  label: "ETH",  color: "#627EEA", address: WETH_ADDRESS, decimals: 18 },
  { id: "btc",  label: "BTC",  color: "#F7931A", address: WBTC_ADDRESS, decimals: 8  },
  { id: "bnb",  label: "BNB",  color: "#F3BA2F", address: WBNB_ADDRESS, decimals: 18 },
];

function SwapCard({ address }: { address?: `0x${string}` }) {
  const [swapToken, setSwapToken] = useState<SwapTokenId>("somi");
  const [swapAmt, setSwapAmt]     = useState("");
  const [swapError, setSwapError] = useState("");
  const [approving, setApproving] = useState(false);
  const [swapping, setSwapping]   = useState(false);
  const [wrapping, setWrapping]   = useState(false);
  const [txDone, setTxDone]       = useState("");

  const cfg = SWAP_TOKENS.find(t => t.id === swapToken)!;
  const isSomi = swapToken === "somi";

  const amountIn: bigint = (() => {
    try { return swapAmt ? parseUnits(swapAmt, cfg.decimals) : 0n; } catch { return 0n; }
  })();

  const { data: amountsOut }  = useGetAmountsOut(amountIn, [cfg.address, USDC_ADDRESS]);
  const { data: allowanceRaw, refetch: refetchAllowance } = useRouterAllowance(cfg.address, address);
  const { approveRouter, swap } = useSwapTokens();
  const { wrap, isPending: wrapPending } = useWrapStt();

  const { data: sttRaw }  = useBalance({ address, chainId: activeChain.id });
  const { data: wsttBal, refetch: refetchWstt } = useWsttBalance(address);
  const { data: wethBal } = useWethBalance(address);
  const { data: wbtcBal } = useWbtcBalance(address);
  const { data: wbnbBal } = useWbnbBalance(address);

  const sttAmt   = sttRaw  ? Number(sttRaw.formatted).toFixed(4)                   : "0";
  const wsttAmt  = wsttBal ? Number(formatUnits(wsttBal as bigint, 18)).toFixed(4)  : "0";

  const walletBal = (() => {
    if (isSomi)            return `${wsttAmt} WSTT (${sttAmt} STT available to wrap)`;
    if (swapToken === "eth") return wethBal ? Number(formatUnits(wethBal as bigint, 18)).toFixed(4) + " ETH" : "0 ETH";
    if (swapToken === "btc") return wbtcBal ? (Number(wbtcBal) / 1e8).toFixed(6) + " BTC" : "0 BTC";
    if (swapToken === "bnb") return wbnbBal ? Number(formatUnits(wbnbBal as bigint, 18)).toFixed(4) + " BNB" : "0 BNB";
  })();

  const wsttBalance = wsttBal as bigint | undefined ?? 0n;
  const needsWrap   = isSomi && amountIn > 0n && wsttBalance < amountIn;
  const estUsdc     = amountsOut ? Number(formatUnits((amountsOut as bigint[])[1], 6)).toFixed(2) : "—";
  const needsApprove = !needsWrap && (allowanceRaw as bigint | undefined ?? 0n) < amountIn && amountIn > 0n;

  async function handleWrap() {
    setSwapError(""); setWrapping(true);
    try {
      await wrap(amountIn);
      await refetchWstt();
      setTxDone(`Wrapped ${swapAmt} STT → WSTT. Now approve and swap.`);
    } catch (e: unknown) { setSwapError(e instanceof Error ? e.message.slice(0, 120) : "Wrap failed"); }
    finally { setWrapping(false); }
  }

  async function handleApprove() {
    setSwapError(""); setApproving(true);
    try {
      await approveRouter(cfg.address, amountIn);
      await refetchAllowance();
    } catch (e: unknown) { setSwapError(e instanceof Error ? e.message.slice(0, 120) : "Approve failed"); }
    finally { setApproving(false); }
  }

  async function handleSwap() {
    setSwapError(""); setSwapping(true); setTxDone("");
    try {
      const minOut = amountsOut ? (amountsOut as bigint[])[1] * 95n / 100n : 0n;
      await swap(amountIn, minOut, [cfg.address, USDC_ADDRESS], address!);
      setTxDone(`Swapped ${swapAmt} ${cfg.label} → ${estUsdc} USDC`);
      setSwapAmt("");
    } catch (e: unknown) { setSwapError(e instanceof Error ? e.message.slice(0, 120) : "Swap failed"); }
    finally { setSwapping(false); }
  }

  return (
    <div className="f-card" style={{ marginTop: "1rem" }}>
      <div className="f-head">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(62,217,184,0.1)", border: "1px solid rgba(62,217,184,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ArrowDown size={16} color="#3ED9B8" />
          </div>
          <div>
            <div className="f-title">Swap to USDC</div>
            <div className="f-sub">Convert volatile tokens at live DEX rate</div>
          </div>
        </div>
      </div>

      {/* Token tabs */}
      <div style={{ display: "flex", gap: 5, padding: "0 1.25rem 0.75rem", flexWrap: "wrap" }}>
        {SWAP_TOKENS.map(t => (
          <button key={t.id} onClick={() => { setSwapToken(t.id); setSwapAmt(""); setSwapError(""); setTxDone(""); }}
            style={{
              padding: "5px 12px 5px 8px", borderRadius: 8, cursor: "pointer",
              fontFamily: "inherit", fontSize: 12, fontWeight: 700,
              display: "inline-flex", alignItems: "center", gap: 5,
              border: swapToken === t.id ? `1.5px solid ${t.color}` : "1.5px solid transparent",
              background: swapToken === t.id ? `${t.color}18` : "var(--bg2)",
              color: swapToken === t.id ? t.color : "var(--text2)",
              transition: "all 0.15s",
            }}>
            <Image src={LOGOS[t.id]} width={16} height={16} alt={t.label} unoptimized style={{ borderRadius: "50%" }} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="f-body" style={{ paddingTop: "0.25rem" }}>
        {/* Input */}
        <label className="f-lbl">
          You pay
          <span style={{ float: "right", fontSize: 11, color: "var(--text3)", fontWeight: 400 }}>Wallet: {walletBal}</span>
        </label>
        <input className="f-inp" type="number" placeholder="0.00" value={swapAmt}
          onChange={e => { setSwapAmt(e.target.value); setTxDone(""); }} />

        {/* Arrow */}
        <div style={{ display: "flex", justifyContent: "center", margin: "6px 0" }}>
          <ArrowDown size={14} color="var(--text3)" />
        </div>

        {/* Output estimate */}
        <label className="f-lbl">You receive (estimated)</label>
        <div style={{
          padding: "10px 12px", borderRadius: 10, background: "var(--bg3)",
          border: "1px solid var(--border)", fontSize: 15, fontWeight: 700,
          color: estUsdc === "—" ? "var(--text3)" : "#4FC490",
          display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem",
        }}>
          <span>{estUsdc} USDC</span>
          <Image src={LOGOS["usdc"]} width={20} height={20} alt="USDC" unoptimized style={{ borderRadius: "50%" }} />
        </div>

        <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: "0.75rem" }}>
          5% max slippage · Rate updates every 5s · Lymitra DEX
        </div>

        {isSomi && (
          <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: "0.5rem", padding: "6px 10px", background: "rgba(155,127,255,0.06)", borderRadius: 8, border: "1px solid rgba(155,127,255,0.15)" }}>
            SOMI swap: STT must be wrapped to WSTT first, then swapped via DEX.
          </div>
        )}

        {swapError && <div style={{ color: "#ff6b6b", fontSize: 12, marginBottom: "0.5rem", wordBreak: "break-all" }}>{swapError}</div>}
        {txDone    && <div style={{ color: "#4FC490", fontSize: 12, marginBottom: "0.5rem" }}>{txDone}</div>}

        {needsWrap ? (
          <button className="sub-btn" onClick={handleWrap} disabled={wrapping || wrapPending || !swapAmt || !address}>
            {wrapping || wrapPending ? "Wrapping…" : `Wrap ${swapAmt} STT → WSTT`}
          </button>
        ) : needsApprove ? (
          <button className="sub-btn" onClick={handleApprove} disabled={approving || !swapAmt || !address}>
            {approving ? "Approving…" : `Approve ${cfg.label}`}
          </button>
        ) : (
          <button className="sub-btn" onClick={handleSwap} disabled={swapping || !swapAmt || !address || amountIn === 0n}>
            {swapping ? "Swapping…" : `Swap ${cfg.label} → USDC`}
          </button>
        )}
        <div className="f-note">
          {isSomi ? "SOMI: Step 1: wrap STT → WSTT · Step 2: approve · Step 3: swap" : "ERC-20 · Step 1: approve router · Step 2: swap"}
        </div>
      </div>
    </div>
  );
}

interface VaultProps { onSuccess: () => void }

type Tab = "somi" | "eth" | "btc" | "bnb" | "usdc" | "usdt";

const LOGOS: Record<Tab, string> = {
  somi: "/logos/somi-token-roundel-1.png",
  eth:  "/logos/eth.png",
  btc:  "/logos/btc.png",
  bnb:  "/logos/bnb.png",
  usdc: "/logos/usdc.png",
  usdt: "/logos/usdt.png",
};

const TABS: { id: Tab; label: string; color: string; desc: string }[] = [
  { id: "somi", label: "SOMI", color: "#9B7FFF", desc: "Native Somnia token" },
  { id: "eth",  label: "ETH",  color: "#627EEA", desc: "Bridged Ethereum" },
  { id: "btc",  label: "BTC",  color: "#F7931A", desc: "Bridged Bitcoin" },
  { id: "bnb",  label: "BNB",  color: "#F3BA2F", desc: "Bridged BNB" },
  { id: "usdc", label: "USDC", color: "#2775CA", desc: "USD Coin stablecoin" },
  { id: "usdt", label: "USDT", color: "#26A17B", desc: "Tether stablecoin" },
];

function TokenImg({ id, size = 32 }: { id: Tab; size?: number }) {
  return <Image src={LOGOS[id]} width={size} height={size} alt={id} unoptimized style={{ borderRadius: "50%", display: "block", flexShrink: 0 }} />;
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
              <TokenImg id={tab} size={36} />
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
                  padding: "5px 12px 5px 8px", borderRadius: 8, cursor: "pointer",
                  fontFamily: "inherit", fontSize: 12, fontWeight: 700,
                  display: "inline-flex", alignItems: "center", gap: 5,
                  border: tab === t.id ? `1.5px solid ${t.color}` : "1.5px solid transparent",
                  background: tab === t.id ? `${t.color}18` : "var(--bg2)",
                  color: tab === t.id ? t.color : "var(--text2)",
                  transition: "all 0.15s",
                }}
              >
                <TokenImg id={t.id} size={16} />
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

      <SwapCard address={address} />
    </div>
  );
}
