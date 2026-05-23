# Lymitra

**Crypto payroll, powered by AI. Built on Somnia.**

Lymitra lets employers deposit crypto and pay their team in stablecoins on schedule — automatically. The AI monitors exchange rates around the clock and converts at the right moment, so every employee receives USDC or USDT on payday without the employer lifting a finger.

---

## What it does

- **Deposit any token** — SOMI (STT), ETH, BTC, BNB, USDC, or USDT into your company vault
- **Add your team** — set wallet addresses and salaries once
- **Schedule payroll** — pick a payday and the AI handles everything from there
- **AI rate optimization** — three autonomous on-chain agents watch prices, decide when to convert, and execute payroll
- **Stablecoin payouts** — employees always receive USDC or USDT regardless of market volatility
- **On-chain audit trail** — every payment is transparent and verifiable on Somnia

---

## How the AI works

Lymitra uses three autonomous agents built on Somnia primitives:

| Agent | Role |
|---|---|
| **Rate Watch** | Reads live oracle prices for SOMI, ETH, BTC, BNB |
| **LLM Decision** | Analyzes a 7-day rate window and decides when to convert |
| **Payroll Execution** | Converts vault holdings to USDC and pays all employees on payday |

Once you schedule payroll, all three agents activate and run without any manual input.

---

## Smart contracts

| Contract | Purpose |
|---|---|
| `LymitraVault.sol` | Company vault — holds deposits, manages employee registry, runs payroll |
| `LymitraStaking.sol` | Stake LYM tokens to earn rewards |
| `LYMToken.sol` | Native LYM governance/reward token |
| `dex/SomniaFactory.sol` | AMM factory for token pair creation |
| `dex/SomniaPair.sol` | AMM liquidity pair (WSTT/USDC, WETH/USDC, WBTC/USDC, WBNB/USDC) |
| `dex/SomniaRouter.sol` | DEX router — handles swaps used for AI conversions |

---

## Tech stack

- **Frontend** — Next.js 15, TypeScript, Tailwind CSS
- **Wallet** — wagmi v2, RainbowKit, viem
- **AI** — Anthropic Claude SDK (LLM agent for rate decisions)
- **Database** — Supabase (agent state, job queue)
- **Chain** — Somnia Shannon Testnet (Chain ID 50312)

---

## Supported tokens

| Token | Role |
|---|---|
| STT / SOMI | Native Somnia token, depositable via wrap |
| WETH | Wrapped ETH deposit |
| WBTC | Wrapped BTC deposit |
| WBNB | Wrapped BNB deposit |
| USDC | Stablecoin payout + vault reserve |
| USDT | Stablecoin payout |
| LYM | Platform token, earned by staking |

---

## Landing page features

- Animated payroll card with live month labels
- **Rate Rush** — interactive minigame that demonstrates exactly how the AI converts tokens on payday. Play it to see why timing matters.
- Mobile app preview with phone mockups (iOS + Android, built on Somnia)
- Live token price feeds via CoinGecko / Binance fallback

---

## Getting started

```bash
npm install
npm run dev
```

Create a `.env.local` file with the required environment variables (see `.env.example` if available) and connect a wallet on the Somnia Shannon Testnet.

To deploy contracts:

```bash
npx hardhat run scripts/deploy.ts
```

---

## Chain

**Somnia Shannon Testnet**
- RPC: `https://dream-rpc.somnia.network`
- Chain ID: `50312`
- Native token: STT

---

Built for the **Somnia Agentathon** hackathon.
