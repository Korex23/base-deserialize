"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { ethers } from "ethers";
import { useAccount, useDisconnect, useChainId } from "wagmi";
import { ScreenerTokenResponse, TokenAsset } from "@/types/swapform";
import { NATIVE_0G_TOKEN } from "@/lib/constant";
import { TOKEN_LIST } from "@/data/tokenList";

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
  activeChain: number | null;
  tokenList: TokenAsset[];
  screenerData: ScreenerTokenResponse[];
  fetchScreenerData: () => void;
  loading: boolean;
  addTokenToList: (token: TokenAsset) => void;
  updateTokenList: (tokens: TokenAsset[]) => void;
  removeTokenFromList: (address: string) => void;
}

declare global {
  interface Window {
    okxwallet?: any;
  }
}

const generateTokenColor = (address: string): string => {
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = address.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 55%)`;
};

export const generatePlaceholderIcon = (symbol: string, address: string) => {
  const color = generateTokenColor(address);
  let initials = symbol.slice(0, 2).toUpperCase();

  // Special handling for 0G tokens - use first and third character
  if (initials === "0G") {
    initials =
      symbol.length > 2
        ? symbol.charAt(0) + symbol.charAt(2).toUpperCase()
        : "0G";
  }

  // Create a slightly darker shade for gradient depth
  const darkerColor = `hsl(${
    Math.abs(address.split("").reduce((a, b) => a + b.charCodeAt(0), 0)) % 360
  }, 70%, 35%)`;

  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="radial-${address.slice(
          2,
          8
        )}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="white" stop-opacity="0.2"/>
          <stop offset="40%" stop-color="${color}" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="${darkerColor}" stop-opacity="1"/>
        </radialGradient>
        <pattern id="rings-${address.slice(
          2,
          8
        )}" patternUnits="userSpaceOnUse" width="4" height="4">
          <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.06)"/>
        </pattern>
        <filter id="noise-${address.slice(2, 8)}">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" result="turb"/>
          <feColorMatrix type="saturate" values="0"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.08"/>
          </feComponentTransfer>
        </filter>
        <filter id="shadow-${address.slice(
          2,
          8
        )}" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="black" flood-opacity="0.35"/>
        </filter>
        <filter id="glow-${address.slice(
          2,
          8
        )}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" result="blur"/>
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="20" cy="20" r="19.5" 
              fill="url(#radial-${address.slice(2, 8)})"
              filter="url(#shadow-${address.slice(2, 8)})"
              stroke="rgba(255,255,255,0.25)" 
              stroke-width="0.8"/>
      <circle cx="20" cy="20" r="19.5" fill="url(#rings-${address.slice(
        2,
        8
      )})" />
      <circle cx="20" cy="20" r="19.5" filter="url(#noise-${address.slice(
        2,
        8
      )})" />
      <circle cx="20" cy="20" r="17" 
              fill="none" 
              stroke="rgba(255,255,255,0.25)" 
              stroke-width="1.2"/>
      <text x="50%" y="50%" 
            font-family="'Orbitron', 'Oxanium', 'Share Tech Mono', sans-serif" 
            font-size="15" 
            font-weight="700" 
            fill="white" 
            text-anchor="middle" 
            dominant-baseline="central"
            filter="url(#glow-${address.slice(2, 8)})"
            style="letter-spacing:0.5px;">
        ${initials}
      </text>
    </svg>
  `)}`;
};

const WalletContext = createContext<WalletInfo | null>(null);

const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [error, setError] = useState<string | null>(null);
  const [walletConnectError, setWalletConnectError] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [screenerData, setScreenerData] = useState<ScreenerTokenResponse[]>([]);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [assets, setAssets] = useState<TokenAsset[]>([]);
  const [finalEthBalance, setFinalEthBalance] = useState<string>("0");
  const [activeChain, setActiveChain] = useState<number | null>(null);
  const [tokenList, setTokenList] = useState<TokenAsset[]>([]);
  const [tokenListLoaded, setTokenListLoaded] = useState(false);

  const chainId = useChainId();
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    console.log("chainId:", chainId);
    console.log("address:", address);
  }, [chainId, address]);

  useEffect(() => {
    if (chainId) {
      setActiveChain(chainId);
    }
  }, [chainId]);

  const getStorageKey = () => `tokenList_base`;
  const getTimestampKey = () => `tokenList_base_timestamp`;
  const getCustomTokensKey = () => `customTokens_base`;

  const loadTokenListFromStorage = (): TokenAsset[] | null => {
    try {
      const stored = localStorage.getItem(getStorageKey());
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn("Error loading tokenList from localStorage:", error);
      return null;
    }
  };

  const loadCustomTokensFromStorage = (): TokenAsset[] => {
    try {
      const stored = localStorage.getItem(getCustomTokensKey());
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn("Error loading custom tokens from localStorage:", error);
      return [];
    }
  };

  const saveCustomTokensToStorage = (tokens: TokenAsset[]) => {
    try {
      localStorage.setItem(getCustomTokensKey(), JSON.stringify(tokens));
      console.log("Custom tokens saved to localStorage");
    } catch (error) {
      console.warn("Error saving custom tokens to localStorage:", error);
    }
  };

  const saveTokenListToStorage = (tokens: TokenAsset[]) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(tokens));
      localStorage.setItem(getTimestampKey(), Date.now().toString());
      console.log("TokenList saved to localStorage for 0gMainnet");
    } catch (error) {
      console.warn("Error saving tokenList to localStorage:", error);
    }
  };

  const isTokenListStale = (): boolean => {
    try {
      const timestamp = localStorage.getItem(getTimestampKey());
      if (!timestamp) return true;

      const lastFetch = parseInt(timestamp);
      const now = Date.now();
      const thirtyMinutes = 30 * 60 * 1000;

      return now - lastFetch > thirtyMinutes;
    } catch (error) {
      console.warn("Error checking token list staleness:", error);
      return true;
    }
  };

  // Add a single token to the list
  const addTokenToList = useCallback((token: TokenAsset) => {
    setTokenList((prevList) => {
      // Check if token already exists
      const exists = prevList.some(
        (t) => t.address.toLowerCase() === token.address.toLowerCase()
      );

      if (exists) {
        console.log("Token already exists in list:", token.symbol);
        return prevList;
      }

      // Add token with placeholder logo if not provided
      const tokenWithLogo = {
        ...token,
        logo:
          token.logo || generatePlaceholderIcon(token.symbol, token.address),
      };

      const updatedList = [...prevList, tokenWithLogo];

      // Save custom tokens separately
      const customTokens = loadCustomTokensFromStorage();
      const updatedCustomTokens = [...customTokens, tokenWithLogo];
      saveCustomTokensToStorage(updatedCustomTokens);

      console.log("Token added to list:", tokenWithLogo.symbol);
      return updatedList;
    });
  }, []);

  // Update entire token list (useful for bulk operations)
  const updateTokenList = useCallback((tokens: TokenAsset[]) => {
    const tokensWithLogos = tokens.map((token) => ({
      ...token,
      logo: token.logo || generatePlaceholderIcon(token.symbol, token.address),
    }));

    setTokenList(tokensWithLogos);
    console.log("Token list updated with", tokens.length, "tokens");
  }, []);

  // Remove a token from the list
  const removeTokenFromList = useCallback((address: string) => {
    setTokenList((prevList) => {
      const filtered = prevList.filter(
        (t) => t.address.toLowerCase() !== address.toLowerCase()
      );

      // Update custom tokens storage
      const customTokens = loadCustomTokensFromStorage();
      const updatedCustomTokens = customTokens.filter(
        (t) => t.address.toLowerCase() !== address.toLowerCase()
      );
      saveCustomTokensToStorage(updatedCustomTokens);

      console.log("Token removed from list:", address);
      return filtered;
    });
  }, []);

  const fetchScreenerData = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://screener.deserialize.xyz/tokens");
      const result = await response.json();
      const tokens = result.data as ScreenerTokenResponse[];

      const caToLogo = {
        "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c":
          "https://jaine.app/images/tokens/wa0gi.png",
        "0x7bbc63d01ca42491c3e084c941c3e86e55951404":
          "https://raw.githubusercontent.com/0G-X/jaine-token-lists/main/assets/mainnet/0x7bbc63d01ca42491c3e084c941c3e86e55951404/stOG.svg",
        "0x59ef6f3943bbdfe2fb19565037ac85071223e94c":
          "https://raw.githubusercontent.com/0G-X/jaine-token-lists/main/assets/mainnet/PAI.svg",
        "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE":
          "https://jaine.app/images/tokens/wa0gi.png",
        "0x1f3aa82227281ca364bfb3d253b0f1af1da6473e":
          "http://raw.githubusercontent.com/0G-X/jaine-token-lists/main/assets/mainnet/USDCe.svg",
      };

      if (tokens && tokens.length > 0) {
        const tokensWithLogos = tokens.map((token: ScreenerTokenResponse) => ({
          ...token,
          icon:
            caToLogo[token.address.toLowerCase() as keyof typeof caToLogo] ||
            generatePlaceholderIcon(token.symbol, token.address),
        }));
        setScreenerData(tokensWithLogos);
      } else {
        setScreenerData(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching screener data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTokensFromAPI = async (): Promise<TokenAsset[]> => {
    try {
      console.log("Fetching tokens from API...");
      const tokens: TokenAsset[] = TOKEN_LIST;
      console.log("Fetched tokens:", tokens);

      const caToLogo = {
        "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913":
          "https://basescan.org/token/images/centre-usdc_28.png",
        "0x4200000000000000000000000000000000000006":
          "https://basescan.org/token/images/weth_28.png",
        "0x59ef6f3943bbdfe2fb19565037ac85071223e94c":
          "https://raw.githubusercontent.com/0G-X/jaine-token-lists/main/assets/mainnet/PAI.svg",
        "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE":
          "https://jaine.app/images/tokens/wa0gi.png",
        "0x1f3aa82227281ca364bfb3d253b0f1af1da6473e":
          "http://raw.githubusercontent.com/0G-X/jaine-token-lists/main/assets/mainnet/USDCe.svg",
      };

      if (tokens && tokens.length > 0) {
        const tokensWithLogos = tokens.map((token: TokenAsset) => ({
          ...token,
          logo:
            caToLogo[token.address.toLowerCase() as keyof typeof caToLogo] ||
            generatePlaceholderIcon(token.symbol, token.address),
        }));

        saveTokenListToStorage(tokensWithLogos);
        return tokensWithLogos;
      }
      return [];
    } catch (error) {
      console.error("Error fetching tokens from API:", error);
      throw error;
    }
  };

  useEffect(() => {
    async function loadTokens() {
      const cachedTokens = loadTokenListFromStorage();
      const customTokens = loadCustomTokensFromStorage();
      const isStale = isTokenListStale();

      if (cachedTokens && cachedTokens.length > 0 && !isStale) {
        console.log("Loading tokens from localStorage:", cachedTokens);
        // Merge cached tokens with custom tokens
        const mergedTokens = [...cachedTokens, ...customTokens];
        // Remove duplicates based on address
        const uniqueTokens = mergedTokens.filter(
          (token, index, self) =>
            index ===
            self.findIndex(
              (t) => t.address.toLowerCase() === token.address.toLowerCase()
            )
        );
        setTokenList([NATIVE_0G_TOKEN, ...uniqueTokens]);
        setTokenListLoaded(true);
      } else {
        if (isStale) {
          console.log("Cached tokens are stale, fetching fresh data...");
        } else {
          console.log("No cached tokens found, fetching from API...");
        }

        try {
          const tokens = await fetchTokensFromAPI();
          const mergedTokens = [...tokens, ...customTokens];
          const uniqueTokens = mergedTokens.filter(
            (token, index, self) =>
              index ===
              self.findIndex(
                (t) => t.address.toLowerCase() === token.address.toLowerCase()
              )
          );
          setTokenList([NATIVE_0G_TOKEN, ...uniqueTokens]);
          setTokenListLoaded(true);
        } catch (error) {
          if (cachedTokens && cachedTokens.length > 0) {
            console.log("API failed, using cached tokens as fallback");
            const mergedTokens = [...cachedTokens, ...customTokens];
            const uniqueTokens = mergedTokens.filter(
              (token, index, self) =>
                index ===
                self.findIndex(
                  (t) => t.address.toLowerCase() === token.address.toLowerCase()
                )
            );
            setTokenList([NATIVE_0G_TOKEN, ...uniqueTokens]);
            setTokenListLoaded(true);
          } else {
            console.error("No cached tokens available and API failed");
            setTokenList([NATIVE_0G_TOKEN, ...customTokens]);
            setTokenListLoaded(true);
          }
        }
      }
    }

    loadTokens();
  }, []);

  useEffect(() => {
    const thirtyMinutes = 30 * 60 * 1000;

    const intervalId = setInterval(async () => {
      console.log("30-minute timer: Refreshing token list...");
      try {
        const tokens = await fetchTokensFromAPI();
        const customTokens = loadCustomTokensFromStorage();
        const mergedTokens = [...tokens, ...customTokens];
        const uniqueTokens = mergedTokens.filter(
          (token, index, self) =>
            index ===
            self.findIndex(
              (t) => t.address.toLowerCase() === token.address.toLowerCase()
            )
        );
        setTokenList([NATIVE_0G_TOKEN, ...uniqueTokens]);
        console.log("Token list refreshed successfully");
      } catch (error) {
        console.error("Failed to refresh token list:", error);
      }
    }, thirtyMinutes);

    return () => {
      console.log("Cleaning up token list refresh timer");
      clearInterval(intervalId);
    };
  }, []);

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

  const getWalletAssets = useCallback(
    async (wallet: string): Promise<TokenAsset[]> => {
      const Waddress = address || wallet;

      if (!Waddress) {
        console.warn("No wallet address available. Cannot fetch assets.");
        return [];
      }

      console.log(tokenList);

      const results = await Promise.allSettled(
        tokenList.map(async (token) => {
          try {
            const res = await fetch("/api/token-balance", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                tokenAddress: token.address,
                walletAddress: Waddress,
              }),
            });

            const data = await res.json();
            if (!res.ok || !data.balance) {
              console.warn(`⚠️ Failed to fetch balance for ${token.symbol}`);
              return null;
            }

            const balance = ethers.formatUnits(data.balance, token.decimals);

            return {
              symbol: token.symbol,
              balance,
              address: token.address,
              logo: token.logo,
              decimals: token.decimals,
            } as TokenAsset;
          } catch (err) {
            console.warn(`Error loading ${token.symbol} balance`, err);
            return null;
          }
        })
      );

      const tassets: TokenAsset[] = results
        .map((r) => (r.status === "fulfilled" ? r.value : null))
        .filter((t): t is TokenAsset => t !== null);

      return tassets;
    },
    [tokenList]
  );

  const fetchWalletAssets = useCallback(
    async (address: string) => {
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
    },
    [getWalletAssets, address]
  );

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
      if (isConnected && address && tokenListLoaded) {
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
  }, [isConnected, address, tokenListLoaded]);

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
        tokenList,
        screenerData,
        fetchScreenerData,
        loading,
        addTokenToList,
        updateTokenList,
        removeTokenFromList,
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
