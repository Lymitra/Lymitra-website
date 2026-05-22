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

export const USDC_ADDRESS = "0x112e52B2664e0cCC7a9290e364cFd841Ec8F6748" as const;
// MockUSDC deployed to Somnia Shannon testnet — open mint via faucet()
export const WETH_ADDRESS = "0xdd8f41bf80d0E47132423339ca06bC6413da96b5" as const;
// WETH most widely used on Somnia Shannon testnet (1M+ holders)
export const LAYERZERO_ENDPOINT = "0x6F475642a6e85809B1c36Fa62763669b1b48DD5B" as const;
