"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle, Zap } from "lucide-react";
import { useAccount, useBalance } from "wagmi";
import { activeChain } from "@/lib/chains";
import {
  useStakeOf,
  usePendingReward,
  useTotalStaked,
  useUnlockTime,
  useStake,
  useUnstake,
  useClaimReward,
  useLymBalance,
  useLymTotalSupply,
  fmtUsdc,
  fmtStt,
  fmtLym,
} from "@/lib/hooks";

export function Earn() {
  const { address, isConnected } = useAccount();
  const { data: sttBalance } = useBalance({ address, chainId: activeChain.id });

  const { data: staked,   refetch: refetchStaked }   = useStakeOf(address);
  const { data: reward,   refetch: refetchReward }   = usePendingReward(address);
  const { data: total }    = useTotalStaked();
  const { data: lockTime } = useUnlockTime(address);

  const { stake,   isPending: staking }   = useStake();
  const { unstake, isPending: unstaking } = useUnstake();
  const { claim,   isPending: claiming }  = useClaimReward();

  const { data: lymBalance }     = useLymBalance(address);
  const { data: lymTotalSupply } = useLymTotalSupply();

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
          <p style={{ color: "var(--text2)" }}>Connect your wallet to stake SOMI and earn USDC yield.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="sec-hd">
        <div>
          <div className="sec-ht">Earn</div>
          <div className="sec-hs">Run payroll → earn LYM · Stake SOMI → earn USDC yield</div>
        </div>
        {(reward ?? 0n) > 0n && (
          <button className="tb-btn green" onClick={handleClaim} disabled={claiming}>
            {claiming ? "Claiming…" : `Claim ${fmtUsdc(reward)} USDC`}
          </button>
        )}
      </div>

      {/* ── LYM Rewards card ── */}
      <div className="card" style={{ marginBottom: "1.25rem", border: "1px solid rgba(79,196,168,0.3)", boxShadow: "0 0 0 1px rgba(27,63,191,0.04), 0 4px 24px rgba(27,63,191,0.12)" }}>
        <div className="card-h">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Image src="/logos/lym.svg" width={40} height={40} alt="LYM" unoptimized style={{ borderRadius: "50%", display: "block", flexShrink: 0 }} />
            <div>
              <div className="card-t">LYM Rewards</div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}>Earned automatically by running payroll</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#4FC4A8", letterSpacing: "-0.02em", lineHeight: 1 }}>
              {fmtLym(lymBalance as bigint | undefined)}
            </div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 3 }}>LYM balance</div>
          </div>
        </div>

        <div style={{ padding: "0 1.4rem 1.1rem", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <div style={{ padding: "0.8rem", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 10 }}>
            <div style={{ fontSize: 10, color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>How to earn</div>
            <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.5 }}>1 LYM per employee paid, every payroll run</div>
          </div>
          <div style={{ padding: "0.8rem", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 10 }}>
            <div style={{ fontSize: 10, color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Total issued</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{fmtLym(lymTotalSupply as bigint | undefined)} <span style={{ fontSize: 11, color: "var(--text3)", fontWeight: 400 }}>LYM</span></div>
          </div>
          <div style={{ padding: "0.8rem", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 10 }}>
            <div style={{ fontSize: 10, color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Utility</div>
            <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.5 }}>Transfer · Trade · Future governance</div>
          </div>
        </div>

        <div style={{ margin: "0 1.4rem 1.1rem", padding: "0.65rem 1rem", background: "rgba(243,186,47,0.06)", border: "1px solid rgba(243,186,47,0.18)", borderRadius: 8, display: "flex", alignItems: "flex-start", gap: 8 }}>
          <Zap size={13} color="#F3BA2F" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.5 }}>
            LYM is minted on-chain by the vault contract the moment payroll executes — no claiming needed.
            Run payroll for a 5-person team every month and you automatically accumulate 5 LYM per run.
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="ss" style={{ marginBottom: "1.25rem" }}>
        <div className="sc">
          <div className="sc-l">Your stake</div>
          <div className="sc-v gold">{fmtStt(staked)} SOMI</div>
          <div className="sc-s">active position</div>
        </div>
        <div className="sc">
          <div className="sc-l">Pending reward</div>
          <div className="sc-v accent">{fmtUsdc(reward)}</div>
          <div className="sc-s">USDC yield</div>
        </div>
        <div className="sc">
          <div className="sc-l">Total staked</div>
          <div className="sc-v">{fmtStt(total)} SOMI</div>
          <div className="sc-s">protocol-wide</div>
        </div>
        <div className="sc">
          <div className="sc-l">Your SOMI</div>
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
            <div className="card-t">Stake SOMI</div>
          </div>
          <div style={{ padding: "1.1rem" }}>
            <div className="kv"><span className="kk">Lock period</span><span className="kv-v">7 days</span></div>
            <div className="kv"><span className="kk">Yield source</span><span className="kv-v">Payroll fees (USDC)</span></div>
            <div className="kv"><span className="kk">Your balance</span><span className="kv-v gold">{sttBalance ? Number(sttBalance.formatted).toFixed(3) : "—"} SOMI</span></div>

            <label className="f-lbl" style={{ marginTop: "1rem" }}>Amount (SOMI)</label>
            <input
              className="f-inp"
              type="number"
              placeholder="0.1"
              value={stakeAmt}
              onChange={(e) => setStakeAmt(e.target.value)}
            />
            <button className="sub-btn" onClick={handleStake} disabled={staking || !stakeAmt} style={{ marginTop: "0.75rem" }}>
              {staking ? "Staking…" : "Stake SOMI"}
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
            <div className="kv"><span className="kk">SOMI staked</span><span className="kv-v gold">{fmtStt(staked)} SOMI</span></div>
            <div className="kv"><span className="kk">Lock status</span><span className="kv-v" style={{display:"inline-flex",alignItems:"center",gap:4}}>{isLocked ? `Locked until ${unlockDate}` : staked && staked > 0n ? <><CheckCircle size={12} color="#4FC490" />Unlocked</> : "—"}</span></div>
            <div className="kv"><span className="kk">Pending USDC</span><span className="kv-v accent">{fmtUsdc(reward)}</span></div>
            <div className="kv"><span className="kk">Yield source</span><span className="kv-v">Protocol payroll fees</span></div>

            {staked && staked > 0n && !isLocked && (
              <>
                <label className="f-lbl" style={{ marginTop: "1rem" }}>Unstake amount (SOMI)</label>
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
