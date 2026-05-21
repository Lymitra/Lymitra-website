"use client";

import { useState } from "react";
import { useAccount, useBalance } from "wagmi";
import {
  useStakeOf,
  usePendingReward,
  useTotalStaked,
  useUnlockTime,
  useStake,
  useUnstake,
  useClaimReward,
  fmtUsdc,
  fmtStt,
} from "@/lib/hooks";

export function Earn() {
  const { address, isConnected } = useAccount();
  const { data: sttBalance } = useBalance({ address });

  const { data: staked,   refetch: refetchStaked }   = useStakeOf(address);
  const { data: reward,   refetch: refetchReward }   = usePendingReward(address);
  const { data: total }    = useTotalStaked();
  const { data: lockTime } = useUnlockTime(address);

  const { stake,   isPending: staking }   = useStake();
  const { unstake, isPending: unstaking } = useUnstake();
  const { claim,   isPending: claiming }  = useClaimReward();

  const [stakeAmt,   setStakeAmt]   = useState("");
  const [unstakeAmt, setUnstakeAmt] = useState("");
  const [txError,    setTxError]    = useState("");

  const isLocked = lockTime ? Date.now() / 1000 < Number(lockTime) : false;
  const unlockDate = lockTime
    ? new Date(Number(lockTime) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "—";

  async function handleStake() {
    if (!stakeAmt || Number(stakeAmt) <= 0) return;
    setTxError("");
    try {
      await stake(stakeAmt);
      setStakeAmt("");
      refetchStaked();
      refetchReward();
    } catch (e: unknown) {
      setTxError(e instanceof Error ? e.message : "Stake failed");
    }
  }

  async function handleUnstake() {
    if (!unstakeAmt || Number(unstakeAmt) <= 0) return;
    setTxError("");
    try {
      await unstake(unstakeAmt);
      setUnstakeAmt("");
      refetchStaked();
    } catch (e: unknown) {
      setTxError(e instanceof Error ? e.message : "Unstake failed");
    }
  }

  async function handleClaim() {
    setTxError("");
    try {
      await claim();
      refetchReward();
    } catch (e: unknown) {
      setTxError(e instanceof Error ? e.message : "Claim failed");
    }
  }

  if (!isConnected) {
    return (
      <div>
        <div className="sec-hd"><div><div className="sec-ht">Earn</div><div className="sec-hs">Connect wallet to stake</div></div></div>
        <div className="f-card" style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ color: "var(--text2)" }}>Connect your wallet to stake STT and earn USDC yield.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="sec-hd">
        <div>
          <div className="sec-ht">Earn</div>
          <div className="sec-hs">Stake STT · Earn USDC yield from payroll fees · 7-day lock</div>
        </div>
        {(reward ?? 0n) > 0n && (
          <button className="tb-btn green" onClick={handleClaim} disabled={claiming}>
            {claiming ? "Claiming…" : `Claim ${fmtUsdc(reward)} USDC`}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="ss" style={{ marginBottom: "1.25rem" }}>
        <div className="sc">
          <div className="sc-l">Your stake</div>
          <div className="sc-v gold">{fmtStt(staked)} STT</div>
          <div className="sc-s">active position</div>
        </div>
        <div className="sc">
          <div className="sc-l">Pending reward</div>
          <div className="sc-v accent">{fmtUsdc(reward)}</div>
          <div className="sc-s">USDC yield</div>
        </div>
        <div className="sc">
          <div className="sc-l">Total staked</div>
          <div className="sc-v">{fmtStt(total)} STT</div>
          <div className="sc-s">protocol-wide</div>
        </div>
        <div className="sc">
          <div className="sc-l">Your STT</div>
          <div className="sc-v">{sttBalance ? Number(sttBalance.formatted).toFixed(3) : "—"}</div>
          <div className="sc-s">wallet balance</div>
        </div>
      </div>

      {txError && (
        <div style={{ color: "#ff6b6b", fontSize: "12px", marginBottom: "1rem", wordBreak: "break-all" }}>
          {txError.slice(0, 180)}
        </div>
      )}

      <div className="g2">
        {/* Stake */}
        <div className="card">
          <div className="card-h">
            <div className="card-t">Stake STT</div>
          </div>
          <div style={{ padding: "1.1rem" }}>
            <div className="kv"><span className="kk">Lock period</span><span className="kv-v">7 days</span></div>
            <div className="kv"><span className="kk">Yield source</span><span className="kv-v">Payroll fees (USDC)</span></div>
            <div className="kv"><span className="kk">Your balance</span><span className="kv-v gold">{sttBalance ? Number(sttBalance.formatted).toFixed(3) : "—"} STT</span></div>

            <label className="f-lbl" style={{ marginTop: "1rem" }}>Amount (STT)</label>
            <input
              className="f-inp"
              type="number"
              placeholder="0.1"
              value={stakeAmt}
              onChange={(e) => setStakeAmt(e.target.value)}
            />
            <button className="sub-btn" onClick={handleStake} disabled={staking || !stakeAmt} style={{ marginTop: "0.75rem" }}>
              {staking ? "Staking…" : "Stake STT"}
            </button>
          </div>
        </div>

        {/* Position / unstake */}
        <div className="card">
          <div className="card-h">
            <div className="card-t">Your position</div>
            {staked && staked > 0n && !isLocked && (
              <button className="card-a" onClick={handleUnstake} disabled={unstaking}>
                {unstaking ? "Unstaking…" : "Unstake →"}
              </button>
            )}
          </div>
          <div style={{ padding: "1.1rem" }}>
            <div className="kv"><span className="kk">STT staked</span><span className="kv-v gold">{fmtStt(staked)} STT</span></div>
            <div className="kv"><span className="kk">Lock status</span><span className="kv-v">{isLocked ? `Locked until ${unlockDate}` : staked && staked > 0n ? "Unlocked ✓" : "—"}</span></div>
            <div className="kv"><span className="kk">Pending USDC</span><span className="kv-v accent">{fmtUsdc(reward)}</span></div>
            <div className="kv"><span className="kk">Yield source</span><span className="kv-v">Protocol payroll fees</span></div>

            {staked && staked > 0n && !isLocked && (
              <>
                <label className="f-lbl" style={{ marginTop: "1rem" }}>Unstake amount (STT)</label>
                <input
                  className="f-inp"
                  type="number"
                  placeholder={fmtStt(staked)}
                  value={unstakeAmt}
                  onChange={(e) => setUnstakeAmt(e.target.value)}
                />
              </>
            )}

            {(reward ?? 0n) > 0n && (
              <button className="sub-btn" onClick={handleClaim} disabled={claiming} style={{ marginTop: "0.75rem" }}>
                {claiming ? "Claiming…" : `Claim ${fmtUsdc(reward)} USDC`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
