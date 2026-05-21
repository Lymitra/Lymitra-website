"use client";

const employees = [
  { initials: "AK", av: "av-a", name: "Alex Kim",      role: "Lead Engineer",    amt: "$4,500", token: "USDC", next: "Jun 1", pill: "p-active",  pillLabel: "● Active" },
  { initials: "SR", av: "av-b", name: "Sofia Reyes",   role: "Product Design",   amt: "$3,800", token: "USDC", next: "Jun 1", pill: "p-active",  pillLabel: "● Active" },
  { initials: "MN", av: "av-c", name: "Marcus Ndlovu", role: "Smart Contracts",  amt: "$4,200", token: "USDC", next: "Jun 1", pill: "p-active",  pillLabel: "● Active" },
  { initials: "YT", av: "av-d", name: "Yuki Tanaka",   role: "Backend Dev",      amt: "$3,500", token: "USDT", next: "Jun 1", pill: "p-active",  pillLabel: "● Active" },
  { initials: "FO", av: "av-e", name: "Fatima Okafor", role: "DevRel",           amt: "$1,500", token: "SOMI", next: "Jun 1", pill: "p-agent",   pillLabel: "⚡ Agent" },
  { initials: "JP", av: "av-a", name: "James Park",    role: "Frontend Dev",     amt: "$1,000", token: "USDC", next: "—",     pill: "p-pending", pillLabel: "◌ Pending" },
];

export function Team() {
  return (
    <div>
      <div className="sec-hd">
        <div>
          <div className="sec-ht">Team payroll</div>
          <div className="sec-hs">6 employees · Next run Jun 1 · Agent-executed</div>
        </div>
        <button className="tb-btn green">+ Add employee</button>
      </div>
      <div className="t-table">
        <div className="t-head">
          <div className="th">Employee</div>
          <div className="th">Monthly</div>
          <div className="th">Token</div>
          <div className="th">Next pay</div>
          <div className="th">Status</div>
        </div>
        {employees.map((e) => (
          <div className="t-row" key={e.name}>
            <div className="emp-w">
              <div className={`emp-av ${e.av}`}>{e.initials}</div>
              <div>
                <div className="emp-n">{e.name}</div>
                <div className="emp-r">{e.role}</div>
              </div>
            </div>
            <div className="td-amt">{e.amt}</div>
            <div className="td">{e.token}</div>
            <div className="td">{e.next}</div>
            <div><span className={`pill ${e.pill}`}>{e.pillLabel}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}
