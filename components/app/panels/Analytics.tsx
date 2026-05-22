"use client";

import { useVaultBalance, useTotalStaked, fmtUsdc, fmtStt } from "@/lib/hooks";

export function Analytics() {
  const { data: vaultBal }   = useVaultBalance();
  const { data: totalStaked } = useTotalStaked();

  return (
    <div>
      <div className="sec-hd">
        <div>
          <div className="sec-ht">Analytics</div>
          <div className="sec-hs">Protocol-wide stats · All companies · Live on Somnia</div>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(79,196,144,0.1)", border: "1px solid rgba(79,196,144,0.2)", borderRadius: 100, padding: "4px 10px", fontSize: 11, color: "#4FC490", fontWeight: 600 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4FC490", animation: "pulse 1.8s ease-in-out infinite", display: "inline-block" }} />
          Live
        </span>
      </div>

      {/* Protocol stats */}
      <div className="ss" style={{ marginBottom: "1.5rem" }}>
        <div className="sc">
          <div className="sc-l">Total vault TVL</div>
          <div className="sc-v accent">{fmtUsdc(vaultBal as bigint | undefined)}</div>
          <div className="sc-s">USDC locked · all companies</div>
        </div>
        <div className="sc">
          <div className="sc-l">Total staked</div>
          <div className="sc-v gold">{fmtStt(totalStaked as bigint | undefined)} SOMI</div>
          <div className="sc-s">protocol-wide</div>
        </div>
        <div className="sc">
          <div className="sc-l">Gas fees</div>
          <div className="sc-v green">~$0.00</div>
          <div className="sc-s">Somnia · near-zero</div>
        </div>
        <div className="sc">
          <div className="sc-l">Network</div>
          <div className="sc-v" style={{ fontSize: 13 }}>Somnia</div>
          <div className="sc-s">Shannon Testnet</div>
        </div>
      </div>

      {/* Protocol cards */}
      <div className="g2">
        <div className="card">
          <div className="card-h"><div className="card-t">Vault TVL</div></div>
          <div style={{ padding: "1.5rem 1.1rem", textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: "var(--accent)", letterSpacing: "-1px" }}>
              {fmtUsdc(vaultBal as bigint | undefined)}
            </div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 6 }}>
              Total USDC deposited across all registered companies
            </div>
          </div>
          <div style={{ padding: "0 1.1rem 1.1rem" }}>
            <div className="kv"><span className="kk">Token</span><span className="kv-v">USDC</span></div>
            <div className="kv"><span className="kk">Contract</span><span className="kv-v" style={{ fontFamily: "monospace", fontSize: 11 }}>LymitraVault</span></div>
            <div className="kv"><span className="kk">Chain</span><span className="kv-v">Somnia Shannon Testnet</span></div>
          </div>
        </div>

        <div className="card">
          <div className="card-h"><div className="card-t">Staking pool</div></div>
          <div style={{ padding: "1.5rem 1.1rem", textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#F5C842", letterSpacing: "-1px" }}>
              {fmtStt(totalStaked as bigint | undefined)}
            </div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 6 }}>
              SOMI staked across all holders earning USDC yield
            </div>
          </div>
          <div style={{ padding: "0 1.1rem 1.1rem" }}>
            <div className="kv"><span className="kk">Token</span><span className="kv-v">SOMI (native)</span></div>
            <div className="kv"><span className="kk">Contract</span><span className="kv-v" style={{ fontFamily: "monospace", fontSize: 11 }}>LymitraStaking</span></div>
            <div className="kv"><span className="kk">Yield source</span><span className="kv-v">Payroll fees (USDC)</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
