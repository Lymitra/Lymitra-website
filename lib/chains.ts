import { defineChain } from "viem";

export const somniaTestnet = defineChain({
  id: 50312,
  name: "Somnia Shannon Testnet",
  nativeCurrency: { name: "Somnia Testnet Token", symbol: "STT", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://dream-rpc.somnia.network"],
      webSocket: ["wss://api.infra.testnet.somnia.network/ws"],
    },
  },
  blockExplorers: {
    default: {
      name: "Somnia Explorer",
      url: "https://shannon-explorer.somnia.network",
    },
  },
  testnet: true,
});

export const somniaMainnet = defineChain({
  id: 5031,
  name: "Somnia",
  nativeCurrency: { name: "Somnia", symbol: "SOMI", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://api.infra.mainnet.somnia.network"],
      webSocket: ["wss://api.infra.mainnet.somnia.network/ws"],
    },
  },
  blockExplorers: {
    default: {
      name: "Somnia Explorer",
      url: "https://explorer.somnia.network",
    },
  },
  testnet: false,
});

// Active chain — swap to somniaMainnet when deploying to production
export const activeChain = somniaTestnet;

// ─── Token addresses (testnet) ────────────────────────────────────────────────
// Updated automatically by the deploy script.
const Z = "0x0000000000000000000000000000000000000000";
export const USDC_ADDRESS      = (process.env.NEXT_PUBLIC_USDC_ADDRESS      ?? Z) as `0x${string}`;
export const USDT_ADDRESS      = (process.env.NEXT_PUBLIC_USDT_ADDRESS      ?? Z) as `0x${string}`;
export const WSTT_ADDRESS      = (process.env.NEXT_PUBLIC_WSTT_ADDRESS      ?? Z) as `0x${string}`;
export const WETH_ADDRESS      = (process.env.NEXT_PUBLIC_WETH_ADDRESS      ?? Z) as `0x${string}`;
export const WBTC_ADDRESS      = (process.env.NEXT_PUBLIC_WBTC_ADDRESS      ?? Z) as `0x${string}`;
export const WBNB_ADDRESS      = (process.env.NEXT_PUBLIC_WBNB_ADDRESS      ?? Z) as `0x${string}`;
export const ROUTER_ADDRESS    = (process.env.NEXT_PUBLIC_ROUTER_ADDRESS    ?? Z) as `0x${string}`;
export const FACTORY_ADDRESS   = (process.env.NEXT_PUBLIC_FACTORY_ADDRESS   ?? Z) as `0x${string}`;
export const PAIR_ADDRESS      = (process.env.NEXT_PUBLIC_PAIR_ADDRESS      ?? Z) as `0x${string}`;
export const WETH_PAIR_ADDRESS = (process.env.NEXT_PUBLIC_WETH_PAIR_ADDRESS ?? Z) as `0x${string}`;
export const WBTC_PAIR_ADDRESS = (process.env.NEXT_PUBLIC_WBTC_PAIR_ADDRESS ?? Z) as `0x${string}`;
export const WBNB_PAIR_ADDRESS = (process.env.NEXT_PUBLIC_WBNB_PAIR_ADDRESS ?? Z) as `0x${string}`;
