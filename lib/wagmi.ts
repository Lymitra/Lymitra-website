import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  walletConnectWallet,
  coinbaseWallet,
  rabbyWallet,
  injectedWallet,
  braveWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { somniaTestnet } from "./chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "lymitra-dev";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Browser Extension",
      wallets: [metaMaskWallet, injectedWallet, rabbyWallet, braveWallet],
    },
    {
      groupName: "Mobile",
      wallets: [walletConnectWallet, coinbaseWallet],
    },
  ],
  { appName: "Lymitra", projectId }
);

export const wagmiConfig = createConfig({
  connectors,
  chains: [somniaTestnet],
  transports: {
    [somniaTestnet.id]: http("https://dream-rpc.somnia.network"),
  },
  // Prevents duplicate connectors when MetaMask is both injected and detected
  multiInjectedProviderDiscovery: false,
  ssr: true,
});
