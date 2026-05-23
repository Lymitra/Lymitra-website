/**
 * Lymitra Keeper — autonomous payroll agent.
 *
 * Runs continuously. Every 30 minutes it:
 *   1. Scans all registered companies via CompanyRegistered events
 *   2. Checks which companies have payroll due (nextPayrollMs <= now)
 *   3. Calls executePayrollAgent(company) for each — no user interaction needed
 *
 * The agent wallet only has permission to convert + pay.
 * It cannot withdraw, add employees, or change any settings.
 *
 * Run: npx ts-node scripts/keeper.ts
 */

import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

const RPC      = "https://api.infra.testnet.somnia.network";
const INTERVAL = 30 * 60 * 1000; // 30 minutes

const VAULT_ABI = [
  "event CompanyRegistered(address indexed company, string name)",
  "event PayrollExecuted(address indexed company, uint256 totalPaid, string decision)",
  "function getCompany(address company) view returns (tuple(address owner, uint256 usdcBalance, uint256 usdtBalance, uint256 somiBalance, uint256 wethBalance, uint256 wbtcBalance, uint256 wbnbBalance, uint256 nextPayrollMs, bool agentsEnabled, string name))",
  "function executePayrollAgent(address company) nonpayable",
  "function agentAddress() view returns (address)",
];

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const agentKey = process.env.AGENT_PRIVATE_KEY;
  const vaultAddr = process.env.NEXT_PUBLIC_VAULT_ADDRESS;

  if (!agentKey)  throw new Error("AGENT_PRIVATE_KEY not set in .env");
  if (!vaultAddr) throw new Error("NEXT_PUBLIC_VAULT_ADDRESS not set in .env");

  const wallet = new ethers.Wallet(agentKey, provider);
  const vault  = new ethers.Contract(vaultAddr, VAULT_ABI, wallet);

  console.log("Lymitra Keeper started");
  console.log("Agent wallet:", wallet.address);
  console.log("Vault:       ", vaultAddr);
  console.log("Check interval: 30 minutes\n");

  // Verify this wallet is the registered agent
  const registeredAgent = await vault.agentAddress();
  if (registeredAgent.toLowerCase() !== wallet.address.toLowerCase()) {
    throw new Error(`Agent mismatch. Vault expects ${registeredAgent}, got ${wallet.address}`);
  }
  console.log("Agent verified in vault.\n");

  async function tick() {
    console.log(`[${new Date().toISOString()}] Checking companies...`);

    try {
      const sttBal = await provider.getBalance(wallet.address);
      console.log(`  Agent STT balance: ${ethers.formatEther(sttBal)} STT`);
      if (sttBal < ethers.parseEther("0.1")) {
        console.warn("  WARNING: Agent wallet low on STT — top up to keep keeper running");
      }

      // Discover all registered companies via events
      const filter = vault.filters.CompanyRegistered();
      const events = await vault.queryFilter(filter, 0, "latest");
      const companies = [...new Set(events.map(e => (e as ethers.EventLog).args[0] as string))];
      console.log(`  Found ${companies.length} registered companies`);

      const nowMs = BigInt(Date.now());

      for (const company of companies) {
        try {
          const co = await vault.getCompany(company);

          if (!co.agentsEnabled) {
            console.log(`  [${company.slice(0, 8)}...] agents disabled — skip`);
            continue;
          }
          if (co.nextPayrollMs === 0n) {
            console.log(`  [${company.slice(0, 8)}...] no payroll scheduled — skip`);
            continue;
          }
          if (nowMs < co.nextPayrollMs) {
            const diffMin = Number((co.nextPayrollMs - nowMs) / 60000n);
            console.log(`  [${company.slice(0, 8)}...] payroll due in ${diffMin} min — skip`);
            continue;
          }

          console.log(`  [${company.slice(0, 8)}...] PAYROLL DUE — executing...`);
          const tx = await vault.executePayrollAgent(company);
          const receipt = await tx.wait();
          console.log(`  [${company.slice(0, 8)}...] Payroll executed. TX: ${receipt.hash}`);
        } catch (err: unknown) {
          console.error(`  [${company.slice(0, 8)}...] Error:`, err instanceof Error ? err.message : err);
        }
      }
    } catch (err: unknown) {
      console.error("Tick error:", err instanceof Error ? err.message : err);
    }

    console.log("  Done.\n");
  }

  // Run immediately on start, then every 30 minutes
  await tick();
  setInterval(tick, INTERVAL);
}

main().catch(e => { console.error(e); process.exit(1); });
