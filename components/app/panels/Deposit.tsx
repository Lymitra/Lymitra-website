"use client";

import { useState } from "react";

interface DepositProps {
  onSuccess: () => void;
}

const tokens = [
  { sym: "USDC", name: "USD Coin" },
  { sym: "ETH",  name: "Ethereum" },
  { sym: "SOMI", name: "Somnia" },
];

export function Deposit({ onSuccess }: DepositProps) {
  const [selected, setSelected] = useState(0);
  const [amount, setAmount] = useState("");
  const [stake, setStake] = useState("");

  return (
    <div className="fw">
      <div className="f-card">
        <div className="f-head">
          <div className="f-title">Deposit funds</div>
          <div className="f-sub">Non-custodial · Somnia Shannon Testnet</div>
        </div>
        <div className="f-body">
          <label className="f-lbl">Choose token</label>
          <div className="tp">
            {tokens.map((t, i) => (
              <div key={t.sym} className={`tpo${selected === i ? " sel" : ""}`} onClick={() => setSelected(i)}>
                <span className="tpo-s">{t.sym}</span>
                <span className="tpo-n">{t.name}</span>
              </div>
            ))}
          </div>

          <label className="f-lbl">Amount</label>
          <input
            className="f-inp"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <label className="f-lbl">SOMI to stake (min 10,000)</label>
          <input
            className="f-inp"
            type="number"
            placeholder="10,000"
            value={stake}
            onChange={(e) => setStake(e.target.value)}
          />

          <div className="ag-box">
            <div className="ab-l"><div className="ab-d" />Agents activate on deposit</div>
            <div className="ab-t">Rate Watch starts immediately</div>
            <div className="ab-b">
              JSON API Agent monitors ETH/USDC rates. LLM Agent decides optimal conversion before each payroll.
              Reactivity fires payroll automatically on payday.
            </div>
          </div>

          <button className="sub-btn" onClick={onSuccess}>Deposit &amp; activate agents</button>
          <div className="f-note">Somnia testnet · SOMI tokens · No real value</div>
        </div>
      </div>
    </div>
  );
}
