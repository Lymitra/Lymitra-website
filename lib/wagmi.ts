import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { somniaTestnet } from "./chains";

export const wagmiConfig = getDefaultConfig({
  appName: "Lymitra",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "lymitra-dev",
  chains: [somniaTestnet],
  ssr: true,
});
