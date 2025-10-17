"use client";
import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ogGalileoTestnet, ogMainnet } from "./chains/chains";
import { ReactNode } from "react";
import { base } from "viem/chains";

const config = getDefaultConfig({
  appName: "Deserialize",
  projectId: "7129d62e7592128128a11c3bd4149497",
  chains: [base],
  ssr: true,
});

const queryClient = new QueryClient();

const RainbowKitContext: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider
          modalSize="compact"
          theme={darkTheme({
            accentColor: "#0ea5e9",
            borderRadius: "large",
          })}
        >
          {children}
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
};
export default RainbowKitContext;
