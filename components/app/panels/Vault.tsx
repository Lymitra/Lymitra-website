"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import {
  useCompany,
  useDeposit,
  useRegisterCompany,
  useExecutePayrollManual,
  useUsdcBalance,
  useUsdcAllowance,
  useMonthlyPayroll,
  fmtUsdc,
} from "@/lib/hooks";
import { parseUnits } from "viem";

interface VaultProps {
  onSuccess: () => void;
}

export function Vault({ onSuccess }: VaultProps) {
  const { address, isConnected } = useAccount();

  const { data: company, refetch: refetchCompany } = useCompany(address);
  const { data: usdcBal }    = useUsdcBalance(address);
  const { data: allowance }  = useUsdcAllowance(address);
  const { data: payrollAmt } = useMonthlyPayroll(address);

  const { register, isPending: registering }   = useRegisterCompany();
  const { approve, deposit, isPending: depositing } = useDeposit();
  const { execute, isPending: executing }      = useExecutePayrollManual();

  const [amount, setAmount] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [step, setStep] = useState<"idle" | "approve" | "deposit">("idle");
  const [txError, setTxError] = useState("");

  const isRegistered = company?.owner === address;
  const vaultUsdc    = company?.usdcBalance;
  const needsApprove = !allowance || allowance < parseUnits(amount || "0", 6);

  async function handleRegister() {
    if (!companyName.trim()) return;
    try {
      await register(companyName.trim());
      refetchCompany();
    } catch (e: unknown) {
      setTxError(e instanceof Error ? e.message : "Register failed");
    }
  }

  async function handleDeposit() {
    if (!amount || Number(amount) <= 0) return;
    setTxError("");
    try {
      if (needsApprove) {
        setStep("approve");
        await approve(amount);
      }
      setStep("deposit");
      await deposit(amount);
      setAmount("");
      setStep("idle");
      refetchCompany();
      onSuccess();
    } catch (e: unknown) {
      setStep("idle");
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
            {executing ? "Running…" : "▶ Run payroll now"}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="ss" style={{ marginBottom: "1.5rem" }}>
        <div className="sc">
          <div className="sc-l">Vault USDC</div>
          <div className="sc-v accent">{fmtUsdc(vaultUsdc)}</div>
          <div className="sc-s">payroll reserve</div>
        </div>
        <div className="sc">
          <div className="sc-l">Monthly payroll</div>
          <div className="sc-v">{fmtUsdc(payrollAmt)}</div>
          <div className="sc-s">all employees</div>
        </div>
        <div className="sc">
          <div className="sc-l">Your USDC</div>
          <div className="sc-v">{fmtUsdc(usdcBal)}</div>
          <div className="sc-s">wallet balance</div>
        </div>
        <div className="sc">
          <div className="sc-l">Agent gas</div>
          <div className="sc-v gold">2 STT</div>
          <div className="sc-s">seeded</div>
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

        {/* Deposit form */}
        <div className="f-card">
          <div className="f-head">
            <div className="f-title">Deposit USDC</div>
            <div className="f-sub">Funds go directly to your on-chain vault · Non-custodial</div>
          </div>
          <div className="f-body">
            <label className="f-lbl">Amount (USDC)</label>
            <input
              className="f-inp"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!isRegistered}
            />

            <div className="ag-box">
              <div className="ab-l"><div className="ab-d" />Agents activate on deposit</div>
              <div className="ab-t">Rate Watch starts immediately</div>
              <div className="ab-b">
                JSON API Agent monitors ETH/USDC rates. LLM Agent decides optimal conversion before each payroll.
                Reactivity fires payroll automatically on payday.
              </div>
            </div>

            {txError && (
              <div style={{ color: "#ff6b6b", fontSize: "12px", marginBottom: "0.5rem", wordBreak: "break-all" }}>
                {txError.slice(0, 180)}
              </div>
            )}

            {step === "approve" && (
              <div style={{ color: "var(--text2)", fontSize: "12px", marginBottom: "0.5rem" }}>
                Step 1/2: Approve USDC spend…
              </div>
            )}
            {step === "deposit" && (
              <div style={{ color: "var(--text2)", fontSize: "12px", marginBottom: "0.5rem" }}>
                Step 2/2: Depositing to vault…
              </div>
            )}

            <button
              className="sub-btn"
              onClick={handleDeposit}
              disabled={!isRegistered || depositing || !amount}
            >
              {depositing
                ? step === "approve" ? "Approving USDC…" : "Depositing…"
                : needsApprove && amount
                  ? "Approve & deposit USDC"
                  : "Deposit USDC"}
            </button>
            <div className="f-note">Somnia testnet · STT tokens · No real value</div>
          </div>
        </div>
      </div>
    </div>
  );
}
