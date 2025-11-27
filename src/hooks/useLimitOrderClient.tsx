"use client";
import { useEffect, useState } from "react";
import { BrowserProvider, JsonRpcProvider } from "ethers";
import { MAINNET_API_URL, LIMIT_ORDER_SERVER } from "@/lib/constant";
import {
  LimitOrderMaker,
  LimitOrderClient,
  LimitOrderAbi,
  BASE_LIMIT_ORDER_CONFIG,
} from "@deserialize/evm-limit-sdk";
import { base } from "viem/chains";

export function useLimitOrderClients(provider: BrowserProvider | null) {
  const [client, setClient] = useState<LimitOrderClient | null>(null);
  const [makerClient, setMakerClient] = useState<LimitOrderMaker | null>(null);
  const [err, setError] = useState<string | null>(null);

  const {
    PERMIT2_CONTRACT,
    BASE_LIMIT_ORDER_CONTRACT_ABI,
    W_NATIVE_CONTRACT,
    LIMIT_ORDER_WITH_PERMIT2_CONTRACT,
  } = BASE_LIMIT_ORDER_CONFIG;

  useEffect(() => {
    const initClients = async () => {
      try {
        if (!provider) {
          setError("Browser provider not available");
          return;
        }

        const rpcProvider = new JsonRpcProvider(
          "https://base-mainnet.g.alchemy.com/v2/BJ3c0bm5npmsKZ6oAdHPU"
        );

        const limitOrderClient = new LimitOrderClient(
          rpcProvider,
          LIMIT_ORDER_WITH_PERMIT2_CONTRACT,
          LimitOrderAbi,
          PERMIT2_CONTRACT,
          base,
          W_NATIVE_CONTRACT
        );

        const signer = await provider.getSigner();

        const limitOrderMaker = new LimitOrderMaker(
          limitOrderClient,
          signer,
          LIMIT_ORDER_SERVER
        );

        setClient(limitOrderClient);
        setMakerClient(limitOrderMaker);
        setError(null);
      } catch (err: any) {
        console.error("Error initializing clients:", err);
        setError(err.message);
      }
    };

    initClients();
  }, [provider, base]);

  return { client, makerClient, err };
}
