import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  walletConnectWallet,
  coinbaseWallet,
  rabbyWallet,
  injectedWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { somniaTestnet } from "./chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "lymitra-dev";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Browser",
      // metaMaskWallet first so it shows the MetaMask icon specifically;
      // injectedWallet catches any other browser extension (Rabby, Brave, etc.)
      wallets: [metaMaskWallet, injectedWallet, rabbyWallet],
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
