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

  // ── Deploy WSTT (Wrapped native token) ───────────────────────────────────
  console.log("\nDeploying WSTT...");
  const WSTT = await ethers.getContractFactory("WSTT");
  const wstt = await WSTT.deploy();
  await wstt.waitForDeployment();
  const wsttAddr = await wstt.getAddress();
  console.log("WSTT deployed:", wsttAddr);

  // ── Deploy Lymitra DEX ───────────────────────────────────────────────────
  console.log("\nDeploying SomniaFactory...");
  const Factory = await ethers.getContractFactory("SomniaFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();
  const factoryAddr = await factory.getAddress();
  console.log("SomniaFactory deployed:", factoryAddr);

  console.log("Deploying SomniaRouter...");
  const Router = await ethers.getContractFactory("SomniaRouter");
  const router = await Router.deploy(factoryAddr);
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  console.log("SomniaRouter deployed:", routerAddr);

  // ── Deploy LymitraVault ──────────────────────────────────────────────────
  console.log("\nDeploying LymitraVault...");
  const Vault = await ethers.getContractFactory("LymitraVault");
  const vault = await Vault.deploy(usdcAddr, wsttAddr, routerAddr);
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
  console.log("\nWiring vault ↔ staking...");
  await (await staking.setVault(vaultAddr)).wait();
  console.log("Done.");

  // ── Seed vault with STT for agent calls ──────────────────────────────────
  console.log("\nSeeding vault with 2 STT for agent gas...");
  await (await deployer.sendTransaction({ to: vaultAddr, value: ethers.parseEther("2") })).wait();
  console.log("Vault STT balance:", ethers.formatEther(await deployer.provider.getBalance(vaultAddr)), "STT");

  // ── Seed WSTT/USDC liquidity pool ────────────────────────────────────────
  // Seed 10 STT (wrapped) + 310 USDC → implies 1 STT ≈ $0.031
  console.log("\nSeeding WSTT/USDC liquidity pool...");

  const SEED_STT  = ethers.parseEther("10");        // 10 STT wrapped as WSTT
  const SEED_USDC = 310n * 1_000_000n;             // 310 USDC (6 decimals)

  // Wrap STT → WSTT
  await (await wstt.deposit({ value: SEED_STT })).wait();
  console.log("Wrapped 10 STT → WSTT");

  // Mint USDC for seeding
  await (await usdc.mint(deployer.address, SEED_USDC)).wait();
  console.log("Minted 310 USDC for seeding");

  // Approve router to pull both tokens
  await (await wstt.approve(routerAddr, SEED_STT)).wait();
  await (await usdc.approve(routerAddr, SEED_USDC)).wait();

  // Add liquidity — creates the WSTT/USDC pair automatically
  const deadline = Math.floor(Date.now() / 1000) + 600;
  await (await router.addLiquidity(
    wsttAddr,
    usdcAddr,
    SEED_STT,
    SEED_USDC,
    0n,
    0n,
    deployer.address,
    deadline
  )).wait();
  console.log("Liquidity pool seeded: 10 WSTT + 310 USDC (1 STT ≈ $0.031)");

  // Verify pair was created
  const pairAddr = await factory.getPair(wsttAddr, usdcAddr);
  console.log("WSTT/USDC pair address:", pairAddr);

  // Mint 100,000 USDC to deployer for testing direct deposits
  await (await usdc.mint(deployer.address, 100_000n * 1_000_000n)).wait();
  console.log("Minted 100,000 USDC to deployer for testing");

  // ── Write addresses to .env ───────────────────────────────────────────────
  console.log("\nWriting addresses to .env ...");
  const envPath = path.join(__dirname, "../.env");
  let envContent = fs.readFileSync(envPath, "utf-8");

  // Update or append each address
  const setEnv = (content: string, key: string, value: string) =>
    content.includes(`${key}=`)
      ? content.replace(new RegExp(`${key}=.*`), `${key}=${value}`)
      : content + `\n${key}=${value}`;

  envContent = setEnv(envContent, "NEXT_PUBLIC_VAULT_ADDRESS",   vaultAddr);
  envContent = setEnv(envContent, "NEXT_PUBLIC_AGENT_ADDRESS",   stakingAddr);
  envContent = setEnv(envContent, "NEXT_PUBLIC_USDC_ADDRESS",    usdcAddr);
  envContent = setEnv(envContent, "NEXT_PUBLIC_WSTT_ADDRESS",    wsttAddr);
  envContent = setEnv(envContent, "NEXT_PUBLIC_ROUTER_ADDRESS",  routerAddr);
  envContent = setEnv(envContent, "NEXT_PUBLIC_FACTORY_ADDRESS", factoryAddr);
  envContent = setEnv(envContent, "NEXT_PUBLIC_PAIR_ADDRESS",    pairAddr);

  fs.writeFileSync(envPath, envContent);

  console.log("\n✓ Deployment complete");
  console.log("  MockUSDC:       ", usdcAddr);
  console.log("  WSTT:           ", wsttAddr);
  console.log("  SomniaFactory:  ", factoryAddr);
  console.log("  SomniaRouter:   ", routerAddr);
  console.log("  WSTT/USDC Pair: ", pairAddr);
  console.log("  LymitraVault:   ", vaultAddr);
  console.log("  LymitraStaking: ", stakingAddr);
  console.log("\nIMPORTANT: Update lib/chains.ts:");
  console.log(`  USDC_ADDRESS  = "${usdcAddr}"`);
  console.log(`  WSTT_ADDRESS  = "${wsttAddr}"`);
  console.log(`  ROUTER_ADDRESS = "${routerAddr}"`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
