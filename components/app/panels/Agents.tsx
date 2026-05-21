"use client";

const feed = [
  { ic: "⚡", cls: "",      title: "JSON_API_AGENT → ETH/USDC: $3,512.44",       sub: "CoinGecko · Binance · 17/17 validators · consensus ✓", time: "14:22:07" },
  { ic: "🧠", cls: "gold", title: "LLM_AGENT → conversion: WAIT 4h",            sub: "Trend: ETH bullish 6h window. Confidence: 81%",         time: "14:22:09" },
  { ic: "✓",  cls: "green", title: "REACTIVITY → yield epoch · block 8,442,110", sub: "420 SOMI harvested · 294 → treasury",                   time: "11:08:33" },
  { ic: "⚡", cls: "",      title: "JSON_API_AGENT → ETH/USDC: $3,489.21",       sub: "CoinGecko · Binance · 17/17 validators · consensus ✓", time: "09:14:52" },
];

export function Agents() {
  return (
    <div>
      <div className="sec-hd">
        <div>
          <div className="sec-ht">Agent Activity</div>
          <div className="sec-hs">Somnia agents · On-chain reactivity · WebSocket live</div>
        </div>
        <button className="tb-btn green">+ New rule</button>
      </div>

      <div className="ss" style={{ marginBottom: "1.25rem" }}>
        <div className="sc"><div className="sc-l">Active agents</div><div className="sc-v accent">3</div><div className="sc-s">running now</div></div>
        <div className="sc"><div className="sc-l">Executions</div><div className="sc-v">24</div><div className="sc-s">this month</div></div>
        <div className="sc"><div className="sc-l">Value managed</div><div className="sc-v gold">$84,320</div><div className="sc-s">by agents</div></div>
        <div className="sc"><div className="sc-l">Gas total</div><div className="sc-v green">$0.00</div><div className="sc-s">Somnia = free</div></div>
      </div>

      <div className="agp" style={{ height: 320 }}>
        <div className="agp-h">
          <div className="agp-hl"><div className="ag-led" /><div className="agp-ht">Live agent log</div></div>
          <div className="agp-cnt">ws:// live</div>
        </div>
        <div className="agp-feed">
          {feed.map((f, i) => (
            <div className="ag-item" key={i}>
              <div className={`ai-ic${f.cls ? " " + f.cls : ""}`}>{f.ic}</div>
              <div className="ai-body">
                <div className="ai-title">{f.title}</div>
                <div className="ai-sub">{f.sub}</div>
              </div>
              <div className="ai-time">{f.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
