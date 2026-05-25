import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  const bal = await deployer.provider.getBalance(deployer.address);
  console.log("Deployer:", deployer.address);
  console.log("STT balance:", ethers.formatEther(bal), "STT");

  if (bal < ethers.parseEther("0.5")) {
    console.warn("Warning: low STT balance — need at least ~0.2 STT for deploy + first request");
  }

  const Oracle = await ethers.getContractFactory("LymitraPriceOracle");
  const oracle = await Oracle.deploy();
  await oracle.waitForDeployment();

  const address = await oracle.getAddress();
  console.log("\nLymitraPriceOracle deployed to:", address);
  console.log("\nTo request an ETH/USD price update:");
  console.log(`  oracle.requestPrice({ value: ethers.parseEther("0.12") })`);
  console.log("\nAfter ~30–60s, read the result:");
  console.log("  oracle.latestPrice()       // ETH/USD × 10^6");
  console.log("  oracle.latestTimestamp()   // unix seconds");

  console.log("\nAdd to your .env:");
  console.log(`NEXT_PUBLIC_ORACLE_ADDRESS=${address}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
