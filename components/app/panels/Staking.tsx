"use client";

export function Staking() {
  return (
    <div>
      <div className="sec-hd">
        <div>
          <div className="sec-ht">SOMI Staking</div>
          <div className="sec-hs">Stake to access protocol · Earn yield while you wait</div>
        </div>
        <button className="tb-btn green">+ Stake more</button>
      </div>

      <div className="ss" style={{ marginBottom: "1.25rem" }}>
        <div className="sc"><div className="sc-l">Staked</div><div className="sc-v gold">42,000</div><div className="sc-s">SOMI · $12,600</div></div>
        <div className="sc"><div className="sc-l">APY</div><div className="sc-v accent">12%</div><div className="sc-s">~5,040 SOMI/yr</div></div>
        <div className="sc"><div className="sc-l">This month</div><div className="sc-v green">+420</div><div className="sc-s">SOMI earned</div></div>
        <div className="sc"><div className="sc-l">Access tier</div><div className="sc-v">Full</div><div className="sc-s">6 employees</div></div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="card-h">
            <div className="card-t">Staking position</div>
            <button className="card-a">Unstake →</button>
          </div>
          <div style={{ padding: "1.1rem" }}>
            <div className="s-bar-w"><div className="s-bar" style={{ width: "70%" }} /></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text3)", marginBottom: "1rem" }}>
              <span>42,000 staked</span><span>60,000 max</span>
            </div>
            <div className="kv"><span className="kk">SOMI staked</span><span className="kv-v gold">42,000 SOMI</span></div>
            <div className="kv"><span className="kk">Lock period</span><span className="kv-v">None (liquid)</span></div>
            <div className="kv"><span className="kk">APY</span><span className="kv-v accent">12.0%</span></div>
            <div className="kv"><span className="kk">Next yield epoch</span><span className="kv-v">~48 min</span></div>
            <div className="kv"><span className="kk">Yield split</span><span className="kv-v">70% treasury · 30% protocol</span></div>
          </div>
        </div>
        <div className="card">
          <div className="card-h"><div className="card-t">Yield history</div></div>
          <div style={{ padding: "1.1rem" }}>
            <div className="kv"><span className="kk">May 2026</span><span className="kv-v green">+420 SOMI</span></div>
            <div className="kv"><span className="kk">Apr 2026</span><span className="kv-v green">+415 SOMI</span></div>
            <div className="kv"><span className="kk">Mar 2026</span><span className="kv-v green">+408 SOMI</span></div>
            <div className="kv"><span className="kk">Feb 2026</span><span className="kv-v green">+402 SOMI</span></div>
            <div className="kv"><span className="kk">Total earned</span><span className="kv-v gold">1,645 SOMI</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
