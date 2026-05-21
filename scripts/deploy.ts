import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("STT balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "STT");

  // ── Deploy LymitraVault ──────────────────────────────────────────────────
  console.log("\nDeploying LymitraVault...");
  const Vault = await ethers.getContractFactory("LymitraVault");
  const vault = await Vault.deploy();
  await vault.waitForDeployment();
  const vaultAddr = await vault.getAddress();
  console.log("LymitraVault deployed:", vaultAddr);

  // ── Deploy LymitraStaking ────────────────────────────────────────────────
  console.log("\nDeploying LymitraStaking...");
  const Staking = await ethers.getContractFactory("LymitraStaking");
  const staking = await Staking.deploy();
  await staking.waitForDeployment();
  const stakingAddr = await staking.getAddress();
  console.log("LymitraStaking deployed:", stakingAddr);

  // ── Wire vault ↔ staking ──────────────────────────────────────────────────
  console.log("\nConfiguring: set vault on staking contract...");
  const tx = await staking.setVault(vaultAddr);
  await tx.wait();
  console.log("Done.");

  // ── Seed vault with STT for agent calls ──────────────────────────────────
  console.log("\nSeeding vault with 2 STT for agent gas...");
  const seedTx = await deployer.sendTransaction({
    to: vaultAddr,
    value: ethers.parseEther("2"),
  });
  await seedTx.wait();
  console.log("Vault STT balance:", ethers.formatEther(await deployer.provider.getBalance(vaultAddr)), "STT");

  // ── Write addresses to .env (NEXT_PUBLIC_*) ──────────────────────────────
  console.log("\nWriting addresses to .env ...");
  const envPath = path.join(__dirname, "../.env");
  let envContent = fs.readFileSync(envPath, "utf-8");

  envContent = envContent
    .replace(/NEXT_PUBLIC_VAULT_ADDRESS=.*/, `NEXT_PUBLIC_VAULT_ADDRESS=${vaultAddr}`)
    .replace(/NEXT_PUBLIC_AGENT_ADDRESS=.*/, `NEXT_PUBLIC_AGENT_ADDRESS=${stakingAddr}`)
    .replace(/NEXT_PUBLIC_RULES_ADDRESS=.*/, `NEXT_PUBLIC_RULES_ADDRESS=`);

  fs.writeFileSync(envPath, envContent);

  console.log("\n✓ Deployment complete");
  console.log("  Vault:   ", vaultAddr);
  console.log("  Staking: ", stakingAddr);
  console.log("\nNext steps:");
  console.log("  1. Add employees via the UI (Payments tab)");
  console.log("  2. Deposit USDC into the vault (Vault tab)");
  console.log("  3. Schedule payroll — Reactivity + JSON API + LLM agents are live");
  console.log("\n  Agent IDs hardcoded:");
  console.log("    JSON API agent : 13174292974160097713");
  console.log("    LLM agent      : 12847293847561029384");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
