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
  console.log("MockUSDC:", usdcAddr);

  // ── Deploy WSTT (Wrapped native token) ───────────────────────────────────
  console.log("Deploying WSTT...");
  const WSTT = await ethers.getContractFactory("WSTT");
  const wstt = await WSTT.deploy();
  await wstt.waitForDeployment();
  const wsttAddr = await wstt.getAddress();
  console.log("WSTT:", wsttAddr);

  // ── Deploy MockWETH (Bridged Ethereum) ───────────────────────────────────
  console.log("Deploying MockWETH...");
  const WETH = await ethers.getContractFactory("MockWETH");
  const weth = await WETH.deploy();
  await weth.waitForDeployment();
  const wethAddr = await weth.getAddress();
  console.log("MockWETH:", wethAddr);

  // ── Deploy Lymitra DEX ───────────────────────────────────────────────────
  console.log("\nDeploying SomniaFactory...");
  const Factory = await ethers.getContractFactory("SomniaFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();
  const factoryAddr = await factory.getAddress();
  console.log("SomniaFactory:", factoryAddr);

  console.log("Deploying SomniaRouter...");
  const Router = await ethers.getContractFactory("SomniaRouter");
  const router = await Router.deploy(factoryAddr);
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  console.log("SomniaRouter:", routerAddr);

  // ── Deploy LymitraVault ──────────────────────────────────────────────────
  console.log("\nDeploying LymitraVault...");
  const Vault = await ethers.getContractFactory("LymitraVault");
  const vault = await Vault.deploy(usdcAddr, wsttAddr, wethAddr, routerAddr);
  await vault.waitForDeployment();
  const vaultAddr = await vault.getAddress();
  console.log("LymitraVault:", vaultAddr);

  // ── Deploy LymitraStaking ────────────────────────────────────────────────
  console.log("Deploying LymitraStaking...");
  const Staking = await ethers.getContractFactory("LymitraStaking");
  const staking = await Staking.deploy();
  await staking.waitForDeployment();
  const stakingAddr = await staking.getAddress();
  console.log("LymitraStaking:", stakingAddr);

  // ── Wire vault ↔ staking ─────────────────────────────────────────────────
  await (await staking.setVault(vaultAddr)).wait();
  console.log("Vault ↔ Staking wired.");

  // ── Seed vault with STT for agent calls ──────────────────────────────────
  console.log("\nSeeding vault with 2 STT for agent gas...");
  await (await deployer.sendTransaction({ to: vaultAddr, value: ethers.parseEther("2") })).wait();

  // ── Seed WSTT/USDC pool (1 STT ≈ $0.031) ────────────────────────────────
  console.log("\nSeeding WSTT/USDC pool...");
  const WSTT_SEED  = ethers.parseEther("10");   // 10 STT
  const USDC_WSTT  = 310n * 1_000_000n;         // 310 USDC

  await (await wstt.deposit({ value: WSTT_SEED })).wait();
  await (await usdc.mint(deployer.address, USDC_WSTT)).wait();
  await (await wstt.approve(routerAddr, WSTT_SEED)).wait();
  await (await usdc.approve(routerAddr, USDC_WSTT)).wait();

  let deadline = Math.floor(Date.now() / 1000) + 600;
  await (await router.addLiquidity(wsttAddr, usdcAddr, WSTT_SEED, USDC_WSTT, 0n, 0n, deployer.address, deadline)).wait();
  const wsttPairAddr = await factory.getPair(wsttAddr, usdcAddr);
  console.log("WSTT/USDC pair:", wsttPairAddr, "(10 WSTT + 310 USDC, 1 STT ≈ $0.031)");

  // ── Seed WETH/USDC pool (1 ETH ≈ $2,500) ────────────────────────────────
  console.log("Seeding WETH/USDC pool...");
  const WETH_SEED  = ethers.parseEther("1");    // 1 WETH
  const USDC_WETH  = 2500n * 1_000_000n;        // 2,500 USDC

  await (await weth.mint(deployer.address, WETH_SEED)).wait();
  await (await usdc.mint(deployer.address, USDC_WETH)).wait();
  await (await weth.approve(routerAddr, WETH_SEED)).wait();
  await (await usdc.approve(routerAddr, USDC_WETH)).wait();

  deadline = Math.floor(Date.now() / 1000) + 600;
  await (await router.addLiquidity(wethAddr, usdcAddr, WETH_SEED, USDC_WETH, 0n, 0n, deployer.address, deadline)).wait();
  const wethPairAddr = await factory.getPair(wethAddr, usdcAddr);
  console.log("WETH/USDC pair:", wethPairAddr, "(1 WETH + 2,500 USDC, 1 ETH ≈ $2,500)");

  // Mint test tokens to deployer
  await (await usdc.mint(deployer.address, 100_000n * 1_000_000n)).wait();
  await (await weth.mint(deployer.address, ethers.parseEther("10"))).wait();
  console.log("Minted test USDC + WETH to deployer.");

  // ── Write addresses to .env ───────────────────────────────────────────────
  console.log("\nWriting addresses to .env...");
  const envPath = path.join(__dirname, "../.env");
  let envContent = fs.readFileSync(envPath, "utf-8");

  const setEnv = (content: string, key: string, value: string) =>
    content.includes(`${key}=`)
      ? content.replace(new RegExp(`${key}=.*`), `${key}=${value}`)
      : content + `\n${key}=${value}`;

  envContent = setEnv(envContent, "NEXT_PUBLIC_VAULT_ADDRESS",      vaultAddr);
  envContent = setEnv(envContent, "NEXT_PUBLIC_AGENT_ADDRESS",      stakingAddr);
  envContent = setEnv(envContent, "NEXT_PUBLIC_USDC_ADDRESS",       usdcAddr);
  envContent = setEnv(envContent, "NEXT_PUBLIC_WSTT_ADDRESS",       wsttAddr);
  envContent = setEnv(envContent, "NEXT_PUBLIC_WETH_ADDRESS",       wethAddr);
  envContent = setEnv(envContent, "NEXT_PUBLIC_ROUTER_ADDRESS",     routerAddr);
  envContent = setEnv(envContent, "NEXT_PUBLIC_FACTORY_ADDRESS",    factoryAddr);
  envContent = setEnv(envContent, "NEXT_PUBLIC_PAIR_ADDRESS",       wsttPairAddr);
  envContent = setEnv(envContent, "NEXT_PUBLIC_WETH_PAIR_ADDRESS",  wethPairAddr);

  fs.writeFileSync(envPath, envContent);

  console.log("\n✓ Deployment complete");
  console.log("  MockUSDC:        ", usdcAddr);
  console.log("  WSTT:            ", wsttAddr);
  console.log("  MockWETH:        ", wethAddr);
  console.log("  SomniaFactory:   ", factoryAddr);
  console.log("  SomniaRouter:    ", routerAddr);
  console.log("  WSTT/USDC Pair:  ", wsttPairAddr);
  console.log("  WETH/USDC Pair:  ", wethPairAddr);
  console.log("  LymitraVault:    ", vaultAddr);
  console.log("  LymitraStaking:  ", stakingAddr);
}

main().catch((err) => { console.error(err); process.exitCode = 1; });
