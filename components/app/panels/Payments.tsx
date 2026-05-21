"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import {
  useEmployees,
  useMonthlyPayroll,
  useAddEmployee,
  useSchedulePayroll,
  useCompany,
  fmtUsdc,
} from "@/lib/hooks";

const AVATAR_CLASSES = ["av-a", "av-b", "av-c", "av-d", "av-e"];

export function Payments() {
  const { address, isConnected } = useAccount();

  const { data: employees,  refetch: refetchEmp } = useEmployees(address);
  const { data: monthly }   = useMonthlyPayroll(address);
  const { data: company }   = useCompany(address);
  const { addEmployee, isPending: adding } = useAddEmployee();
  const { schedule, isPending: scheduling } = useSchedulePayroll();

  const [showModal, setShowModal] = useState(false);
  const [wallet,    setWallet]    = useState("");
  const [salary,    setSalary]    = useState("");
  const [empName,   setEmpName]   = useState("");
  const [payDate,   setPayDate]   = useState("");
  const [txError,   setTxError]   = useState("");

  const isRegistered = company?.owner === address;

  async function handleAdd() {
    if (!wallet || !salary || !empName) return;
    setTxError("");
    try {
      await addEmployee(wallet as `0x${string}`, salary, empName);
      setShowModal(false);
      setWallet(""); setSalary(""); setEmpName("");
      refetchEmp();
    } catch (e: unknown) {
      setTxError(e instanceof Error ? e.message : "Transaction failed");
    }
  }

  async function handleSchedule() {
    if (!payDate) return;
    setTxError("");
    try {
      const ms = BigInt(new Date(payDate).getTime());
      await schedule(ms);
    } catch (e: unknown) {
      setTxError(e instanceof Error ? e.message : "Schedule failed");
    }
  }

  const activeCount = employees?.filter((e) => e.active).length ?? 0;

  const nextPayDate = company?.nextPayrollMs
    ? new Date(Number(company.nextPayrollMs)).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "—";

  const daysUntil = company?.nextPayrollMs
    ? Math.max(0, Math.round((Number(company.nextPayrollMs) - Date.now()) / 86400000))
    : null;

  if (!isConnected) {
    return (
      <div>
        <div className="sec-hd"><div><div className="sec-ht">Payments</div><div className="sec-hs">Connect wallet to view</div></div></div>
        <div className="f-card" style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ color: "var(--text2)" }}>Connect your wallet to see and manage employees.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="sec-hd">
        <div>
          <div className="sec-ht">Payments</div>
          <div className="sec-hs">
            {activeCount} employee{activeCount !== 1 ? "s" : ""} · Next run {nextPayDate} · Agent-executed
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {isRegistered && (
            <button className="tb-btn" onClick={() => setShowModal(true)}>+ Add employee</button>
          )}
          {isRegistered && (
            <button className="tb-btn green" onClick={handleSchedule} disabled={scheduling || !payDate}>
              {scheduling ? "Scheduling…" : "⏱ Schedule payroll"}
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="ss" style={{ marginBottom: "1.25rem" }}>
        <div className="sc">
          <div className="sc-l">Monthly total</div>
          <div className="sc-v">{fmtUsdc(monthly)}</div>
          <div className="sc-s">{activeCount} employees</div>
        </div>
        <div className="sc">
          <div className="sc-l">Next payroll</div>
          <div className="sc-v green">{daysUntil !== null ? `${daysUntil} days` : "—"}</div>
          <div className="sc-s">{nextPayDate} · auto</div>
        </div>
        <div className="sc">
          <div className="sc-l">Vault balance</div>
          <div className="sc-v accent">{fmtUsdc(company?.usdcBalance)}</div>
          <div className="sc-s">payroll reserve</div>
        </div>
        <div className="sc">
          <div className="sc-l">Gas cost</div>
          <div className="sc-v gold">$0.00</div>
          <div className="sc-s">Somnia = free</div>
        </div>
      </div>

      {/* Schedule payroll date picker */}
      {isRegistered && (
        <div className="f-card" style={{ marginBottom: "1rem" }}>
          <div className="f-head">
            <div className="f-title">Schedule next payroll</div>
            <div className="f-sub">Reactivity precompile fires automatically at this timestamp</div>
          </div>
          <div className="f-body" style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label className="f-lbl">Payroll date</label>
              <input
                className="f-inp"
                type="datetime-local"
                value={payDate}
                onChange={(e) => setPayDate(e.target.value)}
              />
            </div>
            <button
              className="tb-btn green"
              onClick={handleSchedule}
              disabled={scheduling || !payDate}
              style={{ marginBottom: "0" }}
            >
              {scheduling ? "Scheduling…" : "Schedule"}
            </button>
          </div>
          {txError && (
            <div style={{ color: "#ff6b6b", fontSize: "11px", padding: "0 1.1rem 0.75rem", wordBreak: "break-all" }}>
              {txError.slice(0, 180)}
            </div>
          )}
        </div>
      )}

      {/* Employee table */}
      <div className="t-table">
        <div className="t-head">
          <div className="th">Employee</div>
          <div className="th">Monthly salary</div>
          <div className="th">Token</div>
          <div className="th">Next pay</div>
          <div className="th">Status</div>
        </div>
        {employees && employees.length > 0 ? (
          employees.map((e, i) => (
            <div className="t-row" key={i}>
              <div className="emp-w">
                <div className={`emp-av ${AVATAR_CLASSES[i % AVATAR_CLASSES.length]}`}>
                  {e.name ? e.name.slice(0, 2).toUpperCase() : "??"}
                </div>
                <div>
                  <div className="emp-n">{e.name || "Unnamed"}</div>
                  <div className="emp-r">{e.wallet.slice(0, 6)}…{e.wallet.slice(-4)}</div>
                </div>
              </div>
              <div className="td-amt">{fmtUsdc(e.salaryUsdc)}</div>
              <div className="td">USDC</div>
              <div className="td">{nextPayDate}</div>
              <div>
                <span className={`pill ${e.active ? "p-active" : "p-pending"}`}>
                  {e.active ? "● Active" : "◌ Inactive"}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text3)" }}>
            {isRegistered ? "No employees yet — add your first employee above." : "Register your company in the Vault tab first."}
          </div>
        )}
      </div>

      {/* Add employee modal */}
      {showModal && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="f-card"
            style={{ width: "min(420px, 90vw)", background: "var(--bg2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="f-head">
              <div className="f-title">Add employee</div>
              <div className="f-sub">Employee will receive USDC automatically on payday</div>
            </div>
            <div className="f-body">
              <label className="f-lbl">Name</label>
              <input className="f-inp" placeholder="Alex Kim" value={empName} onChange={(e) => setEmpName(e.target.value)} />

              <label className="f-lbl">Wallet address</label>
              <input className="f-inp" placeholder="0x…" value={wallet} onChange={(e) => setWallet(e.target.value)} />

              <label className="f-lbl">Monthly salary (USDC)</label>
              <input className="f-inp" type="number" placeholder="3500.00" value={salary} onChange={(e) => setSalary(e.target.value)} />

              {txError && (
                <div style={{ color: "#ff6b6b", fontSize: "11px", marginBottom: "0.5rem", wordBreak: "break-all" }}>
                  {txError.slice(0, 180)}
                </div>
              )}

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button className="sub-btn" style={{ flex: 1 }} onClick={handleAdd} disabled={adding}>
                  {adding ? "Adding…" : "Add employee"}
                </button>
                <button className="tb-btn" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
