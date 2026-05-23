import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

// Generates the agent wallet keypair (if not set) and registers it in the vault.
// Run once after deploy-vault.ts.

async function main() {
  const [deployer] = await ethers.getSigners();

  const vaultAddr = process.env.NEXT_PUBLIC_VAULT_ADDRESS!;
  const vault = await ethers.getContractAt("LymitraVault", vaultAddr);

  // Use existing agent key from env, or generate a new one
  let agentWallet: ethers.Wallet;
  if (process.env.AGENT_PRIVATE_KEY) {
    agentWallet = new ethers.Wallet(process.env.AGENT_PRIVATE_KEY);
    console.log("Using existing agent wallet:", agentWallet.address);
  } else {
    agentWallet = ethers.Wallet.createRandom();
    console.log("Generated new agent wallet:");
    console.log("  Address:", agentWallet.address);
    console.log("  Private key:", agentWallet.privateKey);
    console.log("\n  *** Add this to your .env: ***");
    console.log(`  AGENT_PRIVATE_KEY=${agentWallet.privateKey}`);
    console.log(`  AGENT_ADDRESS=${agentWallet.address}`);
  }

  // Fund agent with a small amount of STT for gas
  const agentBal = await deployer.provider.getBalance(agentWallet.address);
  if (agentBal < ethers.parseEther("0.5")) {
    console.log("\nFunding agent wallet with 1 STT for gas...");
    await (await deployer.sendTransaction({
      to: agentWallet.address,
      value: ethers.parseEther("1"),
    })).wait();
    console.log("Agent funded.");
  } else {
    console.log("Agent already has", ethers.formatEther(agentBal), "STT");
  }

  // Register agent in vault
  console.log("\nRegistering agent in vault...");
  await (await vault.setAgent(agentWallet.address)).wait();
  console.log("Agent registered:", agentWallet.address);

  const current = await vault.agentAddress();
  console.log("Vault agentAddress confirmed:", current);
}

main().catch(e => { console.error(e); process.exit(1); });
