"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { useAccount } from "wagmi";
import {
  useCompany,
  useDepositSomi,
  useDepositWeth,
  useWethBalance,
  useWethAllowance,
  useRegisterCompany,
  useExecutePayrollManual,
  useMonthlyPayroll,
  fmtUsdc,
  fmtStt,
} from "@/lib/hooks";
import { parseUnits } from "viem";

interface VaultProps {
  onSuccess: () => void;
}

type DepositTab = "somi" | "eth";

export function Vault({ onSuccess }: VaultProps) {
  const { address, isConnected } = useAccount();

  const { data: company, refetch: refetchCompany } = useCompany(address);
  const { data: payrollAmt } = useMonthlyPayroll(address);
  const { data: wethBalance } = useWethBalance(address);
  const { data: wethAllowance, refetch: refetchAllowance } = useWethAllowance(address);

  const { register, isPending: registering }          = useRegisterCompany();
  const { depositSomi, isPending: depositingSomi }    = useDepositSomi();
  const { approve, depositWeth, isPending: depositingWeth } = useDepositWeth();
  const { execute, isPending: executing }             = useExecutePayrollManual();

  const [tab, setTab]               = useState<DepositTab>("somi");
  const [somiAmount, setSomiAmount] = useState("");
  const [wethAmount, setWethAmount] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [txError, setTxError]       = useState("");
  const [approving, setApproving]   = useState(false);

  const isRegistered = company?.owner === address;
  const vaultUsdc    = company?.usdcBalance;
  const vaultSomi    = company?.somiBalance;
  const vaultWeth    = company?.wethBalance;

  const wethAmountParsed = wethAmount ? parseUnits(wethAmount, 18) : 0n;
  const needsApproval    = (wethAllowance ?? 0n) < wethAmountParsed && wethAmountParsed > 0n;

  async function handleRegister() {
    if (!companyName.trim()) return;
    try {
      await register(companyName.trim());
      refetchCompany();
    } catch (e: unknown) {
      setTxError(e instanceof Error ? e.message : "Register failed");
    }
  }

  async function handleDepositSomi() {
    if (!somiAmount || Number(somiAmount) <= 0) return;
    setTxError("");
    try {
      await depositSomi(somiAmount);
      setSomiAmount("");
      refetchCompany();
      onSuccess();
    } catch (e: unknown) {
      setTxError(e instanceof Error ? e.message : "Transaction failed");
    }
  }

  async function handleApproveWeth() {
    if (!wethAmount || Number(wethAmount) <= 0) return;
    setTxError("");
    setApproving(true);
    try {
      await approve(wethAmount);
      refetchAllowance();
    } catch (e: unknown) {
      setTxError(e instanceof Error ? e.message : "Approval failed");
    } finally {
      setApproving(false);
    }
  }

  async function handleDepositWeth() {
    if (!wethAmount || Number(wethAmount) <= 0) return;
    setTxError("");
    try {
      await depositWeth(wethAmount);
      setWethAmount("");
      refetchCompany();
      refetchAllowance();
      onSuccess();
    } catch (e: unknown) {
      setTxError(e instanceof Error ? e.message : "Transaction failed");
    }
  }

  async function handleManualRun() {
    setTxError("");
    try {
      await execute();
    } catch (e: unknown) {
      setTxError(e instanceof Error ? e.message : "Execution failed");
    }
  }

  if (!isConnected) {
    return (
      <div>
        <div className="sec-hd" style={{ marginBottom: "1.5rem" }}>
          <div><div className="sec-ht">Vault</div><div className="sec-hs">Connect your wallet to get started</div></div>
        </div>
        <div className="f-card" style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ color: "var(--text2)" }}>Connect your wallet using the button in the top-right corner.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="sec-hd" style={{ marginBottom: "1.5rem" }}>
        <div>
          <div className="sec-ht">Vault</div>
          <div className="sec-hs">Non-custodial treasury · Somnia Shannon Testnet</div>
        </div>
        {isRegistered && (
          <button className="tb-btn" onClick={handleManualRun} disabled={executing}>
            {executing ? "Running…" : <><Play size={11} style={{display:"inline",verticalAlign:"middle",marginRight:5}} />Run payroll now</>}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="ss" style={{ marginBottom: "1.5rem" }}>
        <div className="sc">
          <div className="sc-l">SOMI deposited</div>
          <div className="sc-v accent">{fmtStt(vaultSomi as bigint | undefined)} SOMI</div>
          <div className="sc-s">pending conversion</div>
        </div>
        <div className="sc">
          <div className="sc-l">ETH deposited</div>
          <div className="sc-v accent">{fmtStt(vaultWeth as bigint | undefined)} ETH</div>
          <div className="sc-s">pending conversion</div>
        </div>
        <div className="sc">
          <div className="sc-l">Converted USDC</div>
          <div className="sc-v">{fmtUsdc(vaultUsdc)}</div>
          <div className="sc-s">payroll reserve</div>
        </div>
        <div className="sc">
          <div className="sc-l">Monthly payroll</div>
          <div className="sc-v">{fmtUsdc(payrollAmt)}</div>
          <div className="sc-s">all employees</div>
        </div>
      </div>

      <div className="fw">
        {/* Registration step */}
        {!isRegistered && (
          <div className="f-card" style={{ marginBottom: "1rem" }}>
            <div className="f-head">
              <div className="f-title">Register your company</div>
              <div className="f-sub">One-time setup · Free · On-chain</div>
            </div>
            <div className="f-body">
              <label className="f-lbl">Company name</label>
              <input
                className="f-inp"
                placeholder="Acme Corp"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
              <button className="sub-btn" onClick={handleRegister} disabled={registering}>
                {registering ? "Registering…" : "Register company"}
              </button>
            </div>
          </div>
        )}

        {/* Deposit card with tabs */}
        <div className="f-card">
          <div className="f-head">
            <div className="f-title">Deposit tokens</div>
            <div className="f-sub">AI converts to USDC at the best rate · Non-custodial</div>
          </div>

          {/* Tab switcher */}
          <div style={{ display: "flex", gap: 6, padding: "0 1.25rem", marginBottom: 0 }}>
            <button
              onClick={() => { setTab("somi"); setTxError(""); }}
              style={{
                padding: "6px 16px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 600,
                background: tab === "somi" ? "var(--accent)" : "var(--bg2)",
                color: tab === "somi" ? "#fff" : "var(--text2)",
                transition: "all 0.15s",
              }}
            >
              SOMI
            </button>
            <button
              onClick={() => { setTab("eth"); setTxError(""); }}
              style={{
                padding: "6px 16px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 600,
                background: tab === "eth" ? "var(--accent)" : "var(--bg2)",
                color: tab === "eth" ? "#fff" : "var(--text2)",
                transition: "all 0.15s",
              }}
            >
              ETH
            </button>
          </div>

          <div className="f-body" style={{ paddingTop: "1rem" }}>
            {tab === "somi" ? (
              <>
                <label className="f-lbl">Amount (SOMI)</label>
                <input
                  className="f-inp"
                  type="number"
                  placeholder="0.00"
                  value={somiAmount}
                  onChange={(e) => setSomiAmount(e.target.value)}
                  disabled={!isRegistered}
                />

                <div className="ag-box">
                  <div className="ab-l"><div className="ab-d" />How it works</div>
                  <div className="ab-t">Deposit SOMI → AI watches rate → converts to USDC → pays employees</div>
                  <div className="ab-b">
                    The JSON API Agent monitors SOMI/USDC rates. The LLM Agent decides when to convert.
                    On payday, Reactivity fires automatically and your team receives USDC in one block.
                  </div>
                </div>

                {!isRegistered && (
                  <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: "0.5rem" }}>
                    Register your company above before depositing.
                  </div>
                )}
                {txError && (
                  <div style={{ color: "#ff6b6b", fontSize: "12px", marginBottom: "0.5rem", wordBreak: "break-all" }}>
                    {txError.slice(0, 180)}
                  </div>
                )}
                <button
                  className="sub-btn"
                  onClick={handleDepositSomi}
                  disabled={!isRegistered || depositingSomi || !somiAmount}
                >
                  {depositingSomi ? "Depositing…" : "Deposit SOMI"}
                </button>
                <div className="f-note">Native token · No approve step needed</div>
              </>
            ) : (
              <>
                <label className="f-lbl">Amount (ETH)</label>
                <input
                  className="f-inp"
                  type="number"
                  placeholder="0.00"
                  value={wethAmount}
                  onChange={(e) => setWethAmount(e.target.value)}
                  disabled={!isRegistered}
                />
                {wethBalance !== undefined && (
                  <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: "0.5rem" }}>
                    Wallet balance: {fmtStt(wethBalance)} ETH
                  </div>
                )}

                <div className="ag-box">
                  <div className="ab-l"><div className="ab-d" />How it works</div>
                  <div className="ab-t">Deposit ETH → AI watches ETH/USDC rate → converts → pays employees</div>
                  <div className="ab-b">
                    Bridged WETH on Somnia. Two steps: approve the vault to spend your ETH, then deposit.
                    The Lymitra DEX handles the WETH→USDC swap at payroll time.
                  </div>
                </div>

                {!isRegistered && (
                  <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: "0.5rem" }}>
                    Register your company above before depositing.
                  </div>
                )}
                {txError && (
                  <div style={{ color: "#ff6b6b", fontSize: "12px", marginBottom: "0.5rem", wordBreak: "break-all" }}>
                    {txError.slice(0, 180)}
                  </div>
                )}

                {needsApproval ? (
                  <button
                    className="sub-btn"
                    onClick={handleApproveWeth}
                    disabled={!isRegistered || approving || !wethAmount}
                  >
                    {approving ? "Approving…" : "Approve ETH"}
                  </button>
                ) : (
                  <button
                    className="sub-btn"
                    onClick={handleDepositWeth}
                    disabled={!isRegistered || depositingWeth || !wethAmount}
                  >
                    {depositingWeth ? "Depositing…" : "Deposit ETH"}
                  </button>
                )}
                <div className="f-note">ERC-20 WETH on Somnia · Step 1: approve · Step 2: deposit</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
