import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

/**
 * Deploys LYMToken and wires it to the existing vault.
 *
 * Steps:
 *   1. Deploy LYMToken
 *   2. Set vault as the LYM minter (only vault can mint)
 *   3. Call vault.setLymToken(lymAddress) to register it
 *
 * Run: npx hardhat run scripts/deploy-lym.ts --network somnia
 * Then add to .env: NEXT_PUBLIC_LYM_ADDRESS=<address>
 */

async function main() {
  const [deployer] = await ethers.getSigners();
  const bal = await deployer.provider.getBalance(deployer.address);
  console.log("Deployer:", deployer.address);
  console.log("STT balance:", ethers.formatEther(bal), "STT\n");

  const vaultAddr = process.env.NEXT_PUBLIC_VAULT_ADDRESS!;
  if (!vaultAddr) throw new Error("NEXT_PUBLIC_VAULT_ADDRESS not set in .env");

  // 1. Deploy LYMToken
  console.log("Deploying LYMToken...");
  const LYM = await ethers.getContractFactory("LYMToken");
  const lym = await LYM.deploy();
  await lym.waitForDeployment();
  const lymAddr = await lym.getAddress();
  console.log("LYMToken deployed:", lymAddr);

  // 2. Set vault as minter on LYMToken
  console.log("\nSetting vault as LYM minter...");
  await (await lym.setMinter(vaultAddr)).wait();
  console.log("Minter set to vault:", vaultAddr);

  // 3. Register LYMToken in vault
  console.log("\nRegistering LYMToken in vault...");
  const vault = await ethers.getContractAt("LymitraVault", vaultAddr);
  await (await vault.setLymToken(lymAddr)).wait();
  console.log("Vault lymToken confirmed:", await vault.lymToken());

  const remaining = await deployer.provider.getBalance(deployer.address);
  console.log("\nSTT remaining:", ethers.formatEther(remaining), "STT");
  console.log("\n=== Add to .env ===");
  console.log(`NEXT_PUBLIC_LYM_ADDRESS=${lymAddr}`);
}

main().catch(e => { console.error(e); process.exit(1); });
