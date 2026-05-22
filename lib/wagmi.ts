import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  walletConnectWallet,
  coinbaseWallet,
  rabbyWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { somniaTestnet } from "./chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "lymitra-dev";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Browser",
      wallets: [injectedWallet, metaMaskWallet, rabbyWallet],
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
  ssr: true,
});
