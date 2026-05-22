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
export const USDC_ADDRESS = "0x14De95396Ae213eD539f11c1E3c1576DBaCC5b93" as const;
// MockUSDC on Somnia testnet — open mint via faucet(). Replace with bridged
// USDC address (LayerZero OFT or Circle CCTP) when deploying to mainnet.
export const WETH_ADDRESS = "0xdd8f41bf80d0E47132423339ca06bC6413da96b5" as const;
export const LAYERZERO_ENDPOINT = "0x6F475642a6e85809B1c36Fa62763669b1b48DD5B" as const;
