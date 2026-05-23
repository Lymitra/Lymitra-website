import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

// Reuses all existing token + DEX contracts — only deploys the vault.
// Costs ~1–2 STT instead of the full 10+ STT redeploy.

async function main() {
  const [deployer] = await ethers.getSigners();
  const bal = await deployer.provider.getBalance(deployer.address);
  console.log("Deployer:", deployer.address);
  console.log("STT balance:", ethers.formatEther(bal), "STT");

  // ── Reuse existing addresses from .env ──────────────────────────────────────
  const usdc   = process.env.NEXT_PUBLIC_USDC_ADDRESS!;
  const usdt   = process.env.NEXT_PUBLIC_USDT_ADDRESS!;
  const wstt   = process.env.NEXT_PUBLIC_WSTT_ADDRESS!;
  const weth   = process.env.NEXT_PUBLIC_WETH_ADDRESS!;
  const wbtc   = process.env.NEXT_PUBLIC_WBTC_ADDRESS!;
  const wbnb   = process.env.NEXT_PUBLIC_WBNB_ADDRESS!;
  const router = process.env.NEXT_PUBLIC_ROUTER_ADDRESS!;

  console.log("\nReusing existing contracts:");
  console.log("  USDC:  ", usdc);
  console.log("  USDT:  ", usdt);
  console.log("  WSTT:  ", wstt);
  console.log("  WETH:  ", weth);
  console.log("  WBTC:  ", wbtc);
  console.log("  WBNB:  ", wbnb);
  console.log("  Router:", router);

  // ── Deploy only the vault ───────────────────────────────────────────────────
  console.log("\nDeploying LymitraVault (with agent support)...");
  const Vault = await ethers.getContractFactory("LymitraVault");
  const vault = await Vault.deploy(usdc, usdt, wstt, weth, wbtc, wbnb, router);
  await vault.waitForDeployment();
  const vaultAddr = await vault.getAddress();
  console.log("LymitraVault:", vaultAddr);

  // ── Seed vault with a tiny STT for LLM request deposit ─────────────────────
  const seed = ethers.parseEther("0.05");
  await (await deployer.sendTransaction({ to: vaultAddr, value: seed })).wait();
  console.log("Seeded vault with 0.05 STT");

  const remaining = await deployer.provider.getBalance(deployer.address);
  console.log("\nSTT remaining:", ethers.formatEther(remaining), "STT");
  console.log("\n=== Update .env ===");
  console.log(`NEXT_PUBLIC_VAULT_ADDRESS=${vaultAddr}`);
  console.log("\nThen run: npx ts-node scripts/setup-agent.ts");
}

main().catch(e => { console.error(e); process.exit(1); });
