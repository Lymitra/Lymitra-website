"use client";

import type { ReactNode } from "react";
import { Circle, Zap, Clock } from "lucide-react";

const employees: { initials: string; av: string; name: string; role: string; amt: string; token: string; next: string; pill: string; pillLabel: ReactNode }[] = [
  { initials: "AK", av: "av-a", name: "Alex Kim",      role: "Lead Engineer",    amt: "$4,500", token: "USDC", next: "Jun 1", pill: "p-active",  pillLabel: <><Circle size={5} fill="currentColor" stroke="none" style={{display:"inline",verticalAlign:"middle",marginRight:4}} />Active</> },
  { initials: "SR", av: "av-b", name: "Sofia Reyes",   role: "Product Design",   amt: "$3,800", token: "USDC", next: "Jun 1", pill: "p-active",  pillLabel: <><Circle size={5} fill="currentColor" stroke="none" style={{display:"inline",verticalAlign:"middle",marginRight:4}} />Active</> },
  { initials: "MN", av: "av-c", name: "Marcus Ndlovu", role: "Smart Contracts",  amt: "$4,200", token: "USDC", next: "Jun 1", pill: "p-active",  pillLabel: <><Circle size={5} fill="currentColor" stroke="none" style={{display:"inline",verticalAlign:"middle",marginRight:4}} />Active</> },
  { initials: "YT", av: "av-d", name: "Yuki Tanaka",   role: "Backend Dev",      amt: "$3,500", token: "USDT", next: "Jun 1", pill: "p-active",  pillLabel: <><Circle size={5} fill="currentColor" stroke="none" style={{display:"inline",verticalAlign:"middle",marginRight:4}} />Active</> },
  { initials: "FO", av: "av-e", name: "Fatima Okafor", role: "DevRel",           amt: "$1,500", token: "SOMI", next: "Jun 1", pill: "p-agent",   pillLabel: <><Zap size={10} style={{display:"inline",verticalAlign:"middle",marginRight:4}} />Agent</> },
  { initials: "JP", av: "av-a", name: "James Park",    role: "Frontend Dev",     amt: "$1,000", token: "USDC", next: "—",     pill: "p-pending", pillLabel: <><Clock size={10} style={{display:"inline",verticalAlign:"middle",marginRight:4}} />Pending</> },
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
            <div><span className={`pill ${e.pill}`} style={{display:"inline-flex",alignItems:"center"}}>{e.pillLabel}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}
