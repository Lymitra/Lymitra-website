"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { useAccount } from "wagmi";
import {
  useCompany,
  useDepositSomi,
  useRegisterCompany,
  useExecutePayrollManual,
  useMonthlyPayroll,
  fmtUsdc,
  fmtStt,
} from "@/lib/hooks";

interface VaultProps {
  onSuccess: () => void;
}

export function Vault({ onSuccess }: VaultProps) {
  const { address, isConnected } = useAccount();

  const { data: company, refetch: refetchCompany } = useCompany(address);
  const { data: payrollAmt } = useMonthlyPayroll(address);

  const { register, isPending: registering }          = useRegisterCompany();
  const { depositSomi, isPending: depositing }        = useDepositSomi();
  const { execute, isPending: executing }             = useExecutePayrollManual();

  const [amount, setAmount] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [txError, setTxError] = useState("");

  const isRegistered = company?.owner === address;
  const vaultUsdc    = company?.usdcBalance;
  const vaultSomi    = company?.somiBalance;

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
    if (!amount || Number(amount) <= 0) return;
    setTxError("");
    try {
      await depositSomi(amount);
      setAmount("");
      refetchCompany();
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
          <div className="sc-l">Converted USDC</div>
          <div className="sc-v">{fmtUsdc(vaultUsdc)}</div>
          <div className="sc-s">payroll reserve</div>
        </div>
        <div className="sc">
          <div className="sc-l">Monthly payroll</div>
          <div className="sc-v">{fmtUsdc(payrollAmt)}</div>
          <div className="sc-s">all employees</div>
        </div>
        <div className="sc">
          <div className="sc-l">Agent gas</div>
          <div className="sc-v gold">2 SOMI</div>
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

        {/* SOMI deposit form */}
        <div className="f-card">
          <div className="f-head">
            <div className="f-title">Deposit SOMI</div>
            <div className="f-sub">Send your SOMI — AI converts to USDC at the best rate · Non-custodial</div>
          </div>
          <div className="f-body">
            <label className="f-lbl">Amount (SOMI)</label>
            <input
              className="f-inp"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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
              disabled={!isRegistered || depositing || !amount}
            >
              {depositing ? "Depositing…" : "Deposit SOMI"}
            </button>
            <div className="f-note">Somnia testnet · Native SOMI · No real value</div>
          </div>
        </div>
      </div>
    </div>
  );
}
