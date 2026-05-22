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
// These are updated automatically by the deploy script.
export const USDC_ADDRESS    = (process.env.NEXT_PUBLIC_USDC_ADDRESS    ?? "0x14De95396Ae213eD539f11c1E3c1576DBaCC5b93") as `0x${string}`;
export const WSTT_ADDRESS    = (process.env.NEXT_PUBLIC_WSTT_ADDRESS    ?? "0x0000000000000000000000000000000000000000") as `0x${string}`;
export const ROUTER_ADDRESS  = (process.env.NEXT_PUBLIC_ROUTER_ADDRESS  ?? "0x0000000000000000000000000000000000000000") as `0x${string}`;
export const FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_FACTORY_ADDRESS ?? "0x0000000000000000000000000000000000000000") as `0x${string}`;
export const PAIR_ADDRESS    = (process.env.NEXT_PUBLIC_PAIR_ADDRESS    ?? "0x0000000000000000000000000000000000000000") as `0x${string}`;
