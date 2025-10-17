"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { ethers } from "ethers";
import { useDeserializeEVM } from "deserialize-evm-client-sdk";
import { KNOWN_TOKENS } from "@/data/tokenList";
import { useAccount, useDisconnect, useSwitchChain, useChainId } from "wagmi";
import { ogMainnet, ogGalileoTestnet } from "@/providers/chains/chains";
import { TokenAsset } from "@/types/swapform";
import { NATIVE_0G_TOKEN } from "@/lib/constant";

interface WalletInfo {
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  address?: string;
  getWalletAssets: (address: string) => Promise<TokenAsset[]>;
  provider: ethers.BrowserProvider | null;
  assets: TokenAsset[];
  walletConnectError: string | null;
  finalEthBalance?: string;
  fetchWalletAssets: (address: string) => void;
  handleDisconnect: () => void;
  switchMainnetTestnet: (chainId: number) => void;
  activeChain: number | null;
  isPending: boolean;
  currentChain: "0gMainnet" | "0gTestnet";
  tokenList: TokenAsset[];
}

declare global {
  interface Window {
    okxwallet?: any;
  }
}

const WalletContext = createContext<WalletInfo | null>(null);

const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [error, setError] = useState<string | null>(null);
  const [walletConnectError, setWalletConnectError] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [assets, setAssets] = useState<TokenAsset[]>([]);
  const [finalEthBalance, setFinalEthBalance] = useState<string>("0");
  const [activeChain, setActiveChain] = useState<number | null>(null);
  const [tokenList, setTokenList] = useState<TokenAsset[]>([]);

  const { switchChain, isPending } = useSwitchChain();
  const chainId = useChainId();

  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const currentChain: "0gMainnet" | "0gTestnet" = useMemo(() => {
    return chainId === ogMainnet.id ? "0gMainnet" : "0gTestnet";
  }, [chainId]);

  const { getBalance, fetchTokens } = useDeserializeEVM(
    "0gMainnet",
    isConnected ? address : ""
  );

  // Helper functions for localStorage
  const getStorageKey = (chain: "0gMainnet" | "0gTestnet") =>
    `tokenList_${chain}`;

  const loadTokenListFromStorage = (
    chain: "0gMainnet" | "0gTestnet"
  ): TokenAsset[] | null => {
    try {
      const stored = localStorage.getItem(getStorageKey(chain));
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn("Error loading tokenList from localStorage:", error);
      return null;
    }
  };

  const saveTokenListToStorage = (
    tokens: TokenAsset[],
    chain: "0gMainnet" | "0gTestnet"
  ) => {
    try {
      localStorage.setItem(getStorageKey(chain), JSON.stringify(tokens));
      console.log(`TokenList saved to localStorage for ${chain}`);
    } catch (error) {
      console.warn("Error saving tokenList to localStorage:", error);
    }
  };

  useEffect(() => {
    console.log("chainId:", chainId);
    console.log("currentChain:", currentChain);
    console.log("address:", address);
  }, [chainId, currentChain, address]);

  // Fetch ETH balance when provider/address changes
  useEffect(() => {
    if (chainId) {
      setActiveChain(chainId);
    }
  }, [chainId]);

  useEffect(() => {
    async function loadTokens() {
      // if (currentChain === "0gTestnet") {
      //   console.log("Using KNOWN_TOKENS for testnet");
      //   setTokenList(KNOWN_TOKENS);
      //   return;
      // }

      const cachedTokens = loadTokenListFromStorage(currentChain);

      if (
        cachedTokens &&
        cachedTokens.length > 0 &&
        currentChain === "0gMainnet"
      ) {
        console.log("Loading tokens from localStorage:", cachedTokens);
        setTokenList([NATIVE_0G_TOKEN, ...cachedTokens]);
      } else {
        console.log("No cached tokens found, fetching from API...");
        try {
          const tokens = await fetchTokens();
          setTokenList([NATIVE_0G_TOKEN, ...tokens]);
          console.log("fetched tokens:", tokens);

          if (tokens && tokens.length > 0) {
            saveTokenListToStorage(tokens, currentChain);
          }
        } catch (error) {
          console.error("Error fetching tokens:", error);
        }
      }
    }

    loadTokens();
  }, [currentChain]);

  useEffect(() => {
    console.log("tokenList updated:", tokenList);
  }, [tokenList]);

  useEffect(() => {
    const fetchEthBalance = async () => {
      if (provider && address) {
        try {
          const ethBal = await provider.getBalance(address);
          console.log("raw balance (wei):", ethBal.toString());

          if (ethBal !== undefined) {
            const formatted = ethers.formatEther(ethBal);
            setFinalEthBalance(formatted);
            console.log("formatted balance (about to set):", formatted);
          }
        } catch (err) {
          console.error("Error fetching ETH balance:", err);
        }
      }
    };

    fetchEthBalance();
  }, [provider, address, activeChain]);

  useEffect(() => {
    console.log("finalEthBalance updated:", finalEthBalance);
  }, [finalEthBalance]);

  const getWalletAssets = async (wallet: string): Promise<TokenAsset[]> => {
    const Waddress = address || wallet;

    if (!Waddress) {
      console.warn("No wallet address available. Cannot fetch assets.");
      return [];
    }

    const tassets: TokenAsset[] = [];

    for (const token of tokenList) {
      try {
        console.log("fetching:", token.symbol);

        const result = await getBalance(token.address, Waddress);
        let balance = "0";

        if (typeof result === "bigint") {
          balance = ethers.formatUnits(result, token.decimals);
          // console.log(token.symbol, "balance:", balance);
        } else {
          console.warn("Unexpected balance result:", result);
        }

        console.log(balance, token);

        tassets.push({
          symbol: token.symbol,
          balance,
          address: token.address,
          logo: token.logo,
          decimals: token.decimals,
        });
      } catch (err) {
        console.warn(`Error loading ${token.symbol} balance`, err);
      }
    }

    return tassets;
  };

  const fetchWalletAssets = async (address: string) => {
    try {
      const fetchedAssets = await getWalletAssets(address);
      console.log("fetching assets");

      setAssets(fetchedAssets);
      console.log("assets: ", assets);

      return fetchedAssets;
    } catch (err) {
      console.error("Error loading wallet assets:", err);
      setError("Failed to load wallet assets. Please try again.");
      throw err;
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setAssets([]);
    setProvider(null);
    setFinalEthBalance("0");
    setError(null);
  };

  // Auto-refresh assets
  useEffect(() => {
    const loadAssets = async () => {
      if (isConnected && address) {
        try {
          await fetchWalletAssets(address);
        } catch (error) {
          console.error("Failed to load assets:", error);
        }
      }
    };

    loadAssets();

    // const id = setInterval(() => {
    //   loadAssets();
    // }, 30000);

    // return () => clearInterval(id);
  }, [isConnected, address, currentChain, tokenList]);

  const switchMainnetTestnet = (chainId: number) => {
    setActiveChain(chainId);
    switchChain({ chainId });
  };

  return (
    <WalletContext.Provider
      value={{
        isLoading,
        error,
        isConnected,
        address,
        getWalletAssets,
        provider,
        assets,
        walletConnectError,
        finalEthBalance,
        fetchWalletAssets,
        handleDisconnect,
        activeChain,
        isPending,
        switchMainnetTestnet,
        currentChain,
        tokenList,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used within WalletProvider");
  return context;
};

export default WalletProvider;
