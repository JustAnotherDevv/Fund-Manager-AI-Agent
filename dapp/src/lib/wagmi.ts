import { http } from "viem";
import { createConfig, fallback } from "wagmi";
import { mainnet, sepolia, hardhat } from "wagmi/chains";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [hardhat], //[mainnet, sepolia],
  connectors: [
    injected(),
    coinbaseWallet({ appName: "AI Fund Manager" }),
    walletConnect({
      projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
    }),
  ],
  transports: {
    // [mainnet.id]: fallback([
    //   http(import.meta.env.VITE_MAINNET_RPC_URL),
    //   http(),
    // ]),
    // [sepolia.id]: fallback([
    //   http(import.meta.env.VITE_SEPOLIA_RPC_URL),
    //   http(),
    // ]),
    [hardhat.id]: fallback([http("http://localhost:8545"), http()]),
  },
});
