import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("STT balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "STT");

  // ── Deploy stablecoins ───────────────────────────────────────────────────
  console.log("\nDeploying MockUSDC...");
  const usdc = await (await ethers.getContractFactory("MockUSDC")).deploy();
  await usdc.waitForDeployment();
  const usdcAddr = await usdc.getAddress();
  console.log("MockUSDC:", usdcAddr);

  console.log("Deploying MockUSDT...");
  const usdt = await (await ethers.getContractFactory("MockUSDT")).deploy();
  await usdt.waitForDeployment();
  const usdtAddr = await usdt.getAddress();
  console.log("MockUSDT:", usdtAddr);

  // ── Deploy volatile token wrappers ───────────────────────────────────────
  console.log("\nDeploying WSTT (Wrapped SOMI)...");
  const wstt = await (await ethers.getContractFactory("WSTT")).deploy();
  await wstt.waitForDeployment();
  const wsttAddr = await wstt.getAddress();
  console.log("WSTT:", wsttAddr);

  console.log("Deploying MockWETH...");
  const weth = await (await ethers.getContractFactory("MockWETH")).deploy();
  await weth.waitForDeployment();
  const wethAddr = await weth.getAddress();
  console.log("MockWETH:", wethAddr);

  console.log("Deploying MockWBTC...");
  const wbtc = await (await ethers.getContractFactory("MockWBTC")).deploy();
  await wbtc.waitForDeployment();
  const wbtcAddr = await wbtc.getAddress();
  console.log("MockWBTC:", wbtcAddr);

  console.log("Deploying MockWBNB...");
  const wbnb = await (await ethers.getContractFactory("MockWBNB")).deploy();
  await wbnb.waitForDeployment();
  const wbnbAddr = await wbnb.getAddress();
  console.log("MockWBNB:", wbnbAddr);

  // ── Deploy Lymitra DEX ───────────────────────────────────────────────────
  console.log("\nDeploying SomniaFactory...");
  const factory = await (await ethers.getContractFactory("SomniaFactory")).deploy();
  await factory.waitForDeployment();
  const factoryAddr = await factory.getAddress();
  console.log("SomniaFactory:", factoryAddr);

  console.log("Deploying SomniaRouter...");
  const router = await (await ethers.getContractFactory("SomniaRouter")).deploy(factoryAddr);
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  console.log("SomniaRouter:", routerAddr);

  // ── Deploy LymitraVault ──────────────────────────────────────────────────
  console.log("\nDeploying LymitraVault...");
  const vault = await (await ethers.getContractFactory("LymitraVault")).deploy(
    usdcAddr, usdtAddr, wsttAddr, wethAddr, wbtcAddr, wbnbAddr, routerAddr
  );
  await vault.waitForDeployment();
  const vaultAddr = await vault.getAddress();
  console.log("LymitraVault:", vaultAddr);

  // ── Deploy LymitraStaking ────────────────────────────────────────────────
  console.log("Deploying LymitraStaking...");
  const staking = await (await ethers.getContractFactory("LymitraStaking")).deploy(usdcAddr);
  await staking.waitForDeployment();
  const stakingAddr = await staking.getAddress();
  console.log("LymitraStaking:", stakingAddr);

  await (await staking.setVault(vaultAddr)).wait();
  console.log("Vault ↔ Staking wired.");

  // ── Seed vault with STT for agent gas ────────────────────────────────────
  console.log("\nSeeding vault with 0.15 STT for agent gas...");
  await (await deployer.sendTransaction({ to: vaultAddr, value: ethers.parseEther("0.15") })).wait();

  // ── Seed DEX pools ───────────────────────────────────────────────────────
  let deadline = Math.floor(Date.now() / 1000) + 600;

  // WSTT/USDC — 1 STT ≈ $0.031 (use 0.3 STT to stay within deployer balance)
  console.log("\nSeeding WSTT/USDC pool (1 STT ≈ $0.031)...");
  const WSTT_AMT  = ethers.parseEther("0.3");
  const USDC_WSTT = 9_300_000n;           // 9.3 USDC (0.3 STT × $0.031)
  await (await wstt.deposit({ value: WSTT_AMT })).wait();
  await (await usdc.mint(deployer.address, USDC_WSTT)).wait();
  await (await wstt.approve(routerAddr, WSTT_AMT)).wait();
  await (await usdc.approve(routerAddr, USDC_WSTT)).wait();
  deadline = Math.floor(Date.now() / 1000) + 600;
  await (await router.addLiquidity(wsttAddr, usdcAddr, WSTT_AMT, USDC_WSTT, 0n, 0n, deployer.address, deadline)).wait();
  const wsttPairAddr = await factory.getPair(wsttAddr, usdcAddr);
  console.log("WSTT/USDC pair:", wsttPairAddr, "(0.3 WSTT + 9.3 USDC, 1 STT = $0.031)");

  // WETH/USDC — 1 ETH ≈ $2,500
  console.log("Seeding WETH/USDC pool (1 ETH ≈ $2,500)...");
  const WETH_AMT  = ethers.parseEther("1");
  const USDC_WETH = 2500n * 1_000_000n;
  await (await weth.mint(deployer.address, WETH_AMT)).wait();
  await (await usdc.mint(deployer.address, USDC_WETH)).wait();
  await (await weth.approve(routerAddr, WETH_AMT)).wait();
  await (await usdc.approve(routerAddr, USDC_WETH)).wait();
  deadline = Math.floor(Date.now() / 1000) + 600;
  await (await router.addLiquidity(wethAddr, usdcAddr, WETH_AMT, USDC_WETH, 0n, 0n, deployer.address, deadline)).wait();
  const wethPairAddr = await factory.getPair(wethAddr, usdcAddr);
  console.log("WETH/USDC pair:", wethPairAddr, "(1 WETH + 2,500 USDC, 1 ETH = $2,500)");

  // WBTC/USDC — 1 BTC ≈ $95,000 (8 dec)
  console.log("Seeding WBTC/USDC pool (1 BTC ≈ $95,000)...");
  const WBTC_AMT  = 1_000_000n;            // 0.01 WBTC (8 dec)
  const USDC_WBTC = 950n * 1_000_000n;     // 950 USDC
  await (await wbtc.mint(deployer.address, WBTC_AMT)).wait();
  await (await usdc.mint(deployer.address, USDC_WBTC)).wait();
  await (await wbtc.approve(routerAddr, WBTC_AMT)).wait();
  await (await usdc.approve(routerAddr, USDC_WBTC)).wait();
  deadline = Math.floor(Date.now() / 1000) + 600;
  await (await router.addLiquidity(wbtcAddr, usdcAddr, WBTC_AMT, USDC_WBTC, 0n, 0n, deployer.address, deadline)).wait();
  const wbtcPairAddr = await factory.getPair(wbtcAddr, usdcAddr);
  console.log("WBTC/USDC pair:", wbtcPairAddr, "(0.01 WBTC + 950 USDC, 1 BTC = $95,000)");

  // WBNB/USDC — 1 BNB ≈ $600
  console.log("Seeding WBNB/USDC pool (1 BNB ≈ $600)...");
  const WBNB_AMT  = ethers.parseEther("5");
  const USDC_WBNB = 3000n * 1_000_000n;   // 3,000 USDC for 5 BNB
  await (await wbnb.mint(deployer.address, WBNB_AMT)).wait();
  await (await usdc.mint(deployer.address, USDC_WBNB)).wait();
  await (await wbnb.approve(routerAddr, WBNB_AMT)).wait();
  await (await usdc.approve(routerAddr, USDC_WBNB)).wait();
  deadline = Math.floor(Date.now() / 1000) + 600;
  await (await router.addLiquidity(wbnbAddr, usdcAddr, WBNB_AMT, USDC_WBNB, 0n, 0n, deployer.address, deadline)).wait();
  const wbnbPairAddr = await factory.getPair(wbnbAddr, usdcAddr);
  console.log("WBNB/USDC pair:", wbnbPairAddr, "(5 WBNB + 3,000 USDC, 1 BNB = $600)");

  // Mint test tokens to deployer
  await (await usdc.mint(deployer.address, 100_000n * 1_000_000n)).wait();
  await (await usdt.mint(deployer.address, 100_000n * 1_000_000n)).wait();
  await (await weth.mint(deployer.address, ethers.parseEther("10"))).wait();
  await (await wbtc.mint(deployer.address, 100_000_000n)).wait();            // 1 WBTC
  await (await wbnb.mint(deployer.address, ethers.parseEther("100"))).wait();
  console.log("Minted test tokens to deployer.");

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
  envContent = setEnv(envContent, "NEXT_PUBLIC_USDT_ADDRESS",       usdtAddr);
  envContent = setEnv(envContent, "NEXT_PUBLIC_WSTT_ADDRESS",       wsttAddr);
  envContent = setEnv(envContent, "NEXT_PUBLIC_WETH_ADDRESS",       wethAddr);
  envContent = setEnv(envContent, "NEXT_PUBLIC_WBTC_ADDRESS",       wbtcAddr);
  envContent = setEnv(envContent, "NEXT_PUBLIC_WBNB_ADDRESS",       wbnbAddr);
  envContent = setEnv(envContent, "NEXT_PUBLIC_ROUTER_ADDRESS",     routerAddr);
  envContent = setEnv(envContent, "NEXT_PUBLIC_FACTORY_ADDRESS",    factoryAddr);
  envContent = setEnv(envContent, "NEXT_PUBLIC_PAIR_ADDRESS",       wsttPairAddr);
  envContent = setEnv(envContent, "NEXT_PUBLIC_WETH_PAIR_ADDRESS",  wethPairAddr);
  envContent = setEnv(envContent, "NEXT_PUBLIC_WBTC_PAIR_ADDRESS",  wbtcPairAddr);
  envContent = setEnv(envContent, "NEXT_PUBLIC_WBNB_PAIR_ADDRESS",  wbnbPairAddr);

  fs.writeFileSync(envPath, envContent);

  console.log("\n✓ Deployment complete");
  console.log("  MockUSDC:         ", usdcAddr);
  console.log("  MockUSDT:         ", usdtAddr);
  console.log("  WSTT:             ", wsttAddr);
  console.log("  MockWETH:         ", wethAddr);
  console.log("  MockWBTC:         ", wbtcAddr);
  console.log("  MockWBNB:         ", wbnbAddr);
  console.log("  SomniaFactory:    ", factoryAddr);
  console.log("  SomniaRouter:     ", routerAddr);
  console.log("  WSTT/USDC Pair:   ", wsttPairAddr);
  console.log("  WETH/USDC Pair:   ", wethPairAddr);
  console.log("  WBTC/USDC Pair:   ", wbtcPairAddr);
  console.log("  WBNB/USDC Pair:   ", wbnbPairAddr);
  console.log("  LymitraVault:     ", vaultAddr);
  console.log("  LymitraStaking:   ", stakingAddr);
}

main().catch((err) => { console.error(err); process.exitCode = 1; });
