/**
 * seed.ts — run this AFTER getting more STT from the faucet.
 * Uses the already-deployed contracts from 2026-05-23 to:
 *   1. Seed vault with 0.15 STT for agent gas
 *   2. Create and seed all 4 DEX liquidity pools
 *   3. Write pair addresses to .env
 *
 * Usage: TS_NODE_PROJECT=tsconfig.hardhat.json npx hardhat run scripts/seed.ts --network somnia
 */
import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

// ── Addresses from 2026-05-23 deployment ──────────────────────────────────
const VAULT_ADDR   = "0x0e7a6fff4B67810601D1a0FE22E731e300F51883";
const USDC_ADDR    = "0x30f211089dA736BdB450d1801A3C4307e48A2BA5";
const USDT_ADDR    = "0x5D4835772DC64Ba045605Fc745EaB330A7C538b9";
const WSTT_ADDR    = "0x682a3e5aBF9b66349b745ca9801b763aD7273dd4";
const WETH_ADDR    = "0x234c7a9F3A719D0D255d2B3551DBF55b274fc9fa";
const WBTC_ADDR    = "0xd50CaA6765572115F50727CFf53D3D230fF70BAF";
const WBNB_ADDR    = "0x8dbde96371a76a324445A7b2c54E9666ab03bDF3";
const ROUTER_ADDR  = "0x51262Ea5D6fBd83472224b17378E7201E21B347c";
const FACTORY_ADDR = "0xd57D12636063240418755db86EdD61cb8d721cF2";

function setEnv(content: string, key: string, value: string): string {
  const regex = new RegExp(`^${key}=.*$`, "m");
  return regex.test(content)
    ? content.replace(regex, `${key}=${value}`)
    : content + `\n${key}=${value}`;
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const bal = await deployer.provider.getBalance(deployer.address);
  console.log("Seeding with:", deployer.address);
  console.log("STT balance:", ethers.formatEther(bal), "STT");
  if (bal < ethers.parseEther("0.6")) {
    throw new Error("Need at least 0.6 STT. Get more from the Somnia faucet first.");
  }

  const wstt    = await ethers.getContractAt("WSTT",     WSTT_ADDR);
  const usdc    = await ethers.getContractAt("MockUSDC", USDC_ADDR);
  const weth    = await ethers.getContractAt("MockWETH", WETH_ADDR);
  const wbtc    = await ethers.getContractAt("MockWBTC", WBTC_ADDR);
  const wbnb    = await ethers.getContractAt("MockWBNB", WBNB_ADDR);
  const router  = await ethers.getContractAt("SomniaRouter",  ROUTER_ADDR);
  const factory = await ethers.getContractAt("SomniaFactory", FACTORY_ADDR);

  // ── Seed vault with STT for agent gas ──────────────────────────────────
  console.log("\n[1/5] Seeding vault with 0.15 STT...");
  await (await deployer.sendTransaction({ to: VAULT_ADDR, value: ethers.parseEther("0.15") })).wait();
  console.log("Done.");

  let deadline = Math.floor(Date.now() / 1000) + 600;

  // ── WSTT/USDC pool ──────────────────────────────────────────────────────
  console.log("\n[2/5] Seeding WSTT/USDC pool (0.3 WSTT + 9.3 USDC)...");
  const WSTT_AMT  = ethers.parseEther("0.3");
  const USDC_WSTT = 9_300_000n;
  await (await wstt.deposit({ value: WSTT_AMT })).wait();
  await (await usdc.mint(deployer.address, USDC_WSTT)).wait();
  await (await wstt.approve(ROUTER_ADDR, WSTT_AMT)).wait();
  await (await usdc.approve(ROUTER_ADDR, USDC_WSTT)).wait();
  deadline = Math.floor(Date.now() / 1000) + 600;
  await (await router.addLiquidity(WSTT_ADDR, USDC_ADDR, WSTT_AMT, USDC_WSTT, 0n, 0n, deployer.address, deadline)).wait();
  const wsttPairAddr = await factory.getPair(WSTT_ADDR, USDC_ADDR);
  console.log("WSTT/USDC pair:", wsttPairAddr);

  // ── WETH/USDC pool ──────────────────────────────────────────────────────
  console.log("\n[3/5] Seeding WETH/USDC pool (1 WETH + 2,500 USDC)...");
  const WETH_AMT  = ethers.parseEther("1");
  const USDC_WETH = 2500n * 1_000_000n;
  await (await weth.mint(deployer.address, WETH_AMT)).wait();
  await (await usdc.mint(deployer.address, USDC_WETH)).wait();
  await (await weth.approve(ROUTER_ADDR, WETH_AMT)).wait();
  await (await usdc.approve(ROUTER_ADDR, USDC_WETH)).wait();
  deadline = Math.floor(Date.now() / 1000) + 600;
  await (await router.addLiquidity(WETH_ADDR, USDC_ADDR, WETH_AMT, USDC_WETH, 0n, 0n, deployer.address, deadline)).wait();
  const wethPairAddr = await factory.getPair(WETH_ADDR, USDC_ADDR);
  console.log("WETH/USDC pair:", wethPairAddr);

  // ── WBTC/USDC pool ──────────────────────────────────────────────────────
  console.log("\n[4/5] Seeding WBTC/USDC pool (0.01 WBTC + 950 USDC)...");
  const WBTC_AMT  = 1_000_000n; // 0.01 WBTC in 8-dec units
  const USDC_WBTC = 950n * 1_000_000n;
  await (await wbtc.mint(deployer.address, WBTC_AMT)).wait();
  await (await usdc.mint(deployer.address, USDC_WBTC)).wait();
  await (await wbtc.approve(ROUTER_ADDR, WBTC_AMT)).wait();
  await (await usdc.approve(ROUTER_ADDR, USDC_WBTC)).wait();
  deadline = Math.floor(Date.now() / 1000) + 600;
  await (await router.addLiquidity(WBTC_ADDR, USDC_ADDR, WBTC_AMT, USDC_WBTC, 0n, 0n, deployer.address, deadline)).wait();
  const wbtcPairAddr = await factory.getPair(WBTC_ADDR, USDC_ADDR);
  console.log("WBTC/USDC pair:", wbtcPairAddr);

  // ── WBNB/USDC pool ──────────────────────────────────────────────────────
  console.log("\n[5/5] Seeding WBNB/USDC pool (5 WBNB + 3,000 USDC)...");
  const WBNB_AMT  = ethers.parseEther("5");
  const USDC_WBNB = 3000n * 1_000_000n;
  await (await wbnb.mint(deployer.address, WBNB_AMT)).wait();
  await (await usdc.mint(deployer.address, USDC_WBNB)).wait();
  await (await wbnb.approve(ROUTER_ADDR, WBNB_AMT)).wait();
  await (await usdc.approve(ROUTER_ADDR, USDC_WBNB)).wait();
  deadline = Math.floor(Date.now() / 1000) + 600;
  await (await router.addLiquidity(WBNB_ADDR, USDC_ADDR, WBNB_AMT, USDC_WBNB, 0n, 0n, deployer.address, deadline)).wait();
  const wbnbPairAddr = await factory.getPair(WBNB_ADDR, USDC_ADDR);
  console.log("WBNB/USDC pair:", wbnbPairAddr);

  // ── Write pair addresses to .env ────────────────────────────────────────
  console.log("\nUpdating .env...");
  const envPath = path.resolve(__dirname, "../.env");
  let envContent = fs.readFileSync(envPath, "utf8");
  envContent = setEnv(envContent, "NEXT_PUBLIC_PAIR_ADDRESS",      wsttPairAddr);
  envContent = setEnv(envContent, "NEXT_PUBLIC_WETH_PAIR_ADDRESS", wethPairAddr);
  envContent = setEnv(envContent, "NEXT_PUBLIC_WBTC_PAIR_ADDRESS", wbtcPairAddr);
  envContent = setEnv(envContent, "NEXT_PUBLIC_WBNB_PAIR_ADDRESS", wbnbPairAddr);
  fs.writeFileSync(envPath, envContent);
  console.log("Done!");

  console.log("\n── Summary ──────────────────────────────────");
  console.log("  WSTT/USDC pair: ", wsttPairAddr);
  console.log("  WETH/USDC pair: ", wethPairAddr);
  console.log("  WBTC/USDC pair: ", wbtcPairAddr);
  console.log("  WBNB/USDC pair: ", wbnbPairAddr);
  console.log("\nPool seeding complete! All DEX pools are live.");
}

main().catch((e) => { console.error(e); process.exit(1); });
