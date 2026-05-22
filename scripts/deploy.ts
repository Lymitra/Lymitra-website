import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("STT balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "STT");

  // ── Deploy MockUSDC ──────────────────────────────────────────────────────
  console.log("\nDeploying MockUSDC...");
  const USDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await USDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddr = await usdc.getAddress();
  console.log("MockUSDC deployed:", usdcAddr);

  // Mint 100,000 USDC to deployer for testing (6 decimals)
  const mintTx = await usdc.mint(deployer.address, 100_000n * 1_000_000n);
  await mintTx.wait();
  console.log("Minted 100,000 USDC to deployer");

  // ── Deploy LymitraVault ──────────────────────────────────────────────────
  console.log("\nDeploying LymitraVault...");
  const Vault = await ethers.getContractFactory("LymitraVault");
  const vault = await Vault.deploy(usdcAddr);
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

  // ── Wire vault ↔ staking ─────────────────────────────────────────────────
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

  // ── Write addresses to .env.local ────────────────────────────────────────
  console.log("\nWriting addresses to .env.local ...");
  const envPath = path.join(__dirname, "../.env");
  let envContent = fs.readFileSync(envPath, "utf-8");

  envContent = envContent
    .replace(/NEXT_PUBLIC_VAULT_ADDRESS=.*/, `NEXT_PUBLIC_VAULT_ADDRESS=${vaultAddr}`)
    .replace(/NEXT_PUBLIC_AGENT_ADDRESS=.*/, `NEXT_PUBLIC_AGENT_ADDRESS=${stakingAddr}`)
    .replace(/NEXT_PUBLIC_USDC_ADDRESS=.*/, `NEXT_PUBLIC_USDC_ADDRESS=${usdcAddr}`);

  fs.writeFileSync(envPath, envContent);

  // Also update chains.ts USDC_ADDRESS and WETH_ADDRESS placeholder comment
  console.log("\nIMPORTANT: Update lib/chains.ts manually:");
  console.log(`  USDC_ADDRESS = "${usdcAddr}"`);
  console.log(`  (WETH is not needed for core payroll — you can remove it or keep as placeholder)`);

  console.log("\n✓ Deployment complete");
  console.log("  MockUSDC:", usdcAddr);
  console.log("  Vault:   ", vaultAddr);
  console.log("  Staking: ", stakingAddr);
  console.log("\nDeployer has 100,000 USDC to test deposits.");
  console.log("Anyone can call usdc.faucet(amount) or usdc.mint(address, amount) for test tokens.");
  console.log("\nNext steps:");
  console.log("  1. Update USDC_ADDRESS in lib/chains.ts to:", usdcAddr);
  console.log("  2. Rebuild the app: npm run build");
  console.log("  3. Deposit USDC in the Vault tab to activate agents");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
