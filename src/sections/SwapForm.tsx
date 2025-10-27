"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useReducer,
  ChangeEvent,
} from "react";
import { Aldrich, Montserrat_Alternates } from "next/font/google";
import { motion } from "framer-motion";
import { ExchangeIcon } from "@/components/general/Icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { reducerAction } from "@/reducers/swapform-reducer";
import { useWallet } from "@/context/user-wallet-provider";
import SwapInputgroup from "@/components/form/swapinputgroup";
import TokenCard from "@/components/general/TokenCard";
import { mainnetDefaults } from "@/data/mock-data";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  InputActionButtonType,
  SwapQuoteResponse,
  TokenAsset,
} from "@/types/swapform";
import { REDUCER_ACTION_TYPE } from "@/lib/constant";
import useDebounce from "@/hooks/useDebounce";
import { DexIdTypes } from "@/types/swapform";
import { parseUnits, formatUnits, ethers, TransactionResponse } from "ethers";
import SwapImpact from "@/components/form/swapImpact";
import { useToast } from "@/hooks/use-toast";
import { MAINNET_API_URL } from "@/lib/constant";
import SwapCustomConnectButton from "@/components/general/SwapConnectButton";
import mixpanel from "@/lib/mixpanel";
import { RefreshCcw, Settings } from "lucide-react";
import SwapSettingsDialog from "@/components/general/SlippageButton";
import SelectedTokens from "./SelectedTokens";

const montserrat_alternates = Montserrat_Alternates({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const SwapForm = () => {
  const {
    isConnected,
    assets,
    address,
    finalEthBalance,
    fetchWalletAssets,
    // currentChain,
    tokenList,
  } = useWallet();

  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentSearchParams = useRef(new URLSearchParams(searchParams));

  const [loading, setLoading] = useState(false);
  const isFetchingRef = useRef(false);
  const [hasInitializedFromURL, setHasInitializedFromURL] = useState(false);

  const tokenIn = searchParams.get("tokenIn");
  const tokenOut = searchParams.get("tokenOut");
  const amount = searchParams.get("amount");
  const dexId = searchParams.get("dexId");
  const slippage = searchParams.get("slippage") || 1;

  const queryParamsHandler = useCallback(
    (query: string) => {
      router.replace(`${pathname}?${query}`, { scroll: false });
    },
    [pathname, router]
  );

  const initialValue = useMemo(
    () => ({
      buy: mainnetDefaults.buy,
      sell: {
        ...mainnetDefaults.sell,
        amount: "",
      },
      dex: "ALL" as DexIdTypes,
      slippage: 1,
    }),
    []
  );

  const [isPerformingSwap, setIsPerformingSwap] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [sellDollarValue, setSellDollarValue] = useState<number | null>(null);
  const [buyDollarValue, setBuyDollarValue] = useState<number | null>(null);
  const [txStage, setTxStage] = useState<
    | "idle"
    | "signing"
    | "broadcast"
    | "mining"
    | "confirmed"
    | "failed"
    | "done"
  >("idle");
  const [state, dispatch] = useReducer(reducerAction, initialValue);

  useEffect(() => {
    dispatch({ type: REDUCER_ACTION_TYPE.RESET, payload: initialValue });
  }, [initialValue]);

  useEffect(() => {
    if (!hasInitializedFromURL || !mainnetDefaults) return;

    const hasParams =
      currentSearchParams.current.has("tokenIn") ||
      currentSearchParams.current.has("tokenOut") ||
      currentSearchParams.current.has("amount") ||
      currentSearchParams.current.has("slippage");

    if (!hasParams) {
      // No params → fall back to defaults
      dispatch({
        type: REDUCER_ACTION_TYPE.SELL_TOKEN,
        payload: {
          ...mainnetDefaults.sell.token,
          balance: "0",
          logoURI: mainnetDefaults.sell.token.logo,
        },
      });

      dispatch({
        type: REDUCER_ACTION_TYPE.BUY_TOKEN,
        payload: {
          ...mainnetDefaults.buy.token,
          balance: "0",
          logoURI: mainnetDefaults.buy.token.logo,
        },
      });

      dispatch({ type: REDUCER_ACTION_TYPE.SELL_AMOUNT, payload: "" });
      dispatch({ type: REDUCER_ACTION_TYPE.BUY_AMOUNT, payload: "" });
    }
  }, [mainnetDefaults, hasInitializedFromURL]);

  const enteredAmount = useDebounce(state.sell.amount, 500);
  const sellPriceCache = useRef<number | null>(null);
  const buyPriceCache = useRef<number | null>(null);

  // Get current balances from assets array
  const currentSellBalance = useMemo(() => {
    if (!assets?.length || !state.sell.token.address) return "0";
    const asset = assets.find(
      (a) => a.address.toLowerCase() === state.sell.token.address.toLowerCase()
    );
    return asset?.balance || "0";
  }, [assets, state.sell.token.address]);

  const currentBuyBalance = useMemo(() => {
    if (!assets?.length || !state.buy.token.address) return "0";
    const asset = assets.find(
      (a) => a.address.toLowerCase() === state.buy.token.address.toLowerCase()
    );
    return asset?.balance || "0";
  }, [assets, state.buy.token.address]);

  const currentSellUsdValue = useMemo(() => {
    if (!assets?.length || !state.sell.token.address) return "0";
    const asset = assets.find(
      (a) => a.address.toLowerCase() === state.sell.token.address.toLowerCase()
    );
    return asset?.usdValue || "0";
  }, [assets, state.sell.token.address]);

  const currentBuyUsdValue = useMemo(() => {
    if (!assets?.length || !state.buy.token.address) return "0";
    const asset = assets.find(
      (a) => a.address.toLowerCase() === state.buy.token.address.toLowerCase()
    );
    return asset?.usdValue || "0";
  }, [assets, state.buy.token.address]);

  // Initialize from URL params once when tokenList is available
  useEffect(() => {
    if (!tokenList.length || hasInitializedFromURL) return;

    const findToken = (address?: string) =>
      address
        ? tokenList.find(
            (t) => t.address.toLowerCase() === address.toLowerCase()
          )
        : undefined;

    const findAsset = (address?: string) =>
      address
        ? assets.find((a) => a.address.toLowerCase() === address.toLowerCase())
        : undefined;

    let hasUpdates = false;

    // Set buy token from URL
    if (tokenOut) {
      const buyToken = findToken(tokenOut);
      const buyAsset = findAsset(tokenOut);

      console.log("buy Asset", buyAsset);

      if (buyToken) {
        console.log("Setting buy token:", buyToken.symbol, buyAsset?.balance);
        dispatch({
          type: REDUCER_ACTION_TYPE.BUY_TOKEN,
          payload: {
            ...buyToken,
            balance: buyAsset?.balance?.toString() ?? "0",
            usdValue: buyAsset?.usdValue,
            logoURI: buyToken.logo ?? mainnetDefaults.buy.token.logo,
          },
        });
        hasUpdates = true;
      }
    }

    // Set sell token from URL
    if (tokenIn) {
      const sellToken = findToken(tokenIn);
      const sellAsset = findAsset(tokenIn);

      if (sellToken) {
        console.log(
          "Setting sell token:",
          sellToken.symbol,
          sellAsset?.balance
        );
        dispatch({
          type: REDUCER_ACTION_TYPE.SELL_TOKEN,
          payload: {
            ...sellToken,
            balance: sellAsset?.balance?.toString() ?? "0",
            usdValue: sellAsset?.usdValue,
            logoURI: sellToken.logo ?? mainnetDefaults.sell.token.logo,
          },
        });
        hasUpdates = true;
      }
    }

    // Set amount from URL
    if (amount && amount !== state.sell.amount.toString()) {
      console.log("Setting amount:", amount);
      dispatch({
        type: REDUCER_ACTION_TYPE.SELL_AMOUNT,
        payload: parseFloat(amount),
      });
      hasUpdates = true;
    }

    // Set dex from URL
    if (dexId && dexId !== state.dex) {
      console.log("Setting dex:", dexId);
      dispatch({
        type: REDUCER_ACTION_TYPE.SELECT_DEX_ROUTE,
        payload: dexId as DexIdTypes,
      });
      hasUpdates = true;
    }

    if (slippage && Number(slippage) !== state.slippage) {
      console.log("Setting slippage: ", slippage);
      dispatch({
        type: REDUCER_ACTION_TYPE.SLIPPAGE,
        payload: Number(slippage),
      });
    }

    if (hasUpdates) {
      setHasInitializedFromURL(true);
    }
  }, [
    tokenList.length,
    assets,
    tokenIn,
    tokenOut,
    amount,
    dexId,
    hasInitializedFromURL,
    state.sell.amount,
    state.dex,
    slippage,
    state.slippage,
  ]);

  useEffect(() => {
    if (!assets?.length) return;
    if (!hasInitializedFromURL) return;

    console.log("Updating balances from assets...");

    if (state.sell.token.address) {
      const sellBalance = currentSellBalance;
      if (sellBalance !== state.sell.balance) {
        console.log("Updating sell balance:", sellBalance);
        dispatch({
          type: REDUCER_ACTION_TYPE.UPDATE_SELL_BALANCE,
          payload: sellBalance,
        });
      }
    }

    if (state.buy.token.address) {
      const buyBalance = currentBuyBalance;
      if (buyBalance !== state.buy.balance) {
        console.log("Updating buy balance:", buyBalance);
        dispatch({
          type: REDUCER_ACTION_TYPE.UPDATE_BUY_BALANCE,
          payload: buyBalance,
        });
      }
    }
  }, [
    assets,
    currentSellBalance,
    currentBuyBalance,
    hasInitializedFromURL,
    state.sell.token.address,
    state.buy.token.address,
    state.sell.balance,
    state.buy.balance,
  ]);

  const selectedTokenHandler = useCallback(
    async (item: TokenAsset, type: "sell" | "buy") => {
      // console.log(`Selecting ${type} token:`, item);

      // Get the current balance for the selected token
      const tokenBalance =
        assets?.find(
          (a) => a.address.toLowerCase() === item.address.toLowerCase()
        )?.balance || "0";

      // Create token payload with current balance
      const tokenPayload = {
        ...item,
        balance: tokenBalance,
        decimals: item.decimals,
        usdValue: item.usdValue,
        logoURI:
          item.logo ??
          (type === "sell"
            ? mainnetDefaults.sell.token.logo
            : mainnetDefaults.buy.token.logo),
      };

      // console.log(tokenPayload);

      // Update the token
      dispatch({
        type:
          type === "sell"
            ? REDUCER_ACTION_TYPE.SELL_TOKEN
            : REDUCER_ACTION_TYPE.BUY_TOKEN,
        payload: tokenPayload,
      });

      dispatch({
        type:
          type === "sell"
            ? REDUCER_ACTION_TYPE.UPDATE_SELL_BALANCE
            : REDUCER_ACTION_TYPE.UPDATE_BUY_BALANCE,
        payload: tokenBalance,
      });

      if (currentSearchParams.current) {
        currentSearchParams.current.set(
          `token${type === "sell" ? "In" : "Out"}`,
          item.address
        );
        queryParamsHandler(currentSearchParams.current.toString());
      }
    },
    [assets, queryParamsHandler]
  );

  useEffect(() => {
    if (state.sell.token.address === state.buy.token.address) {
      setError("Cannot swap the same token");
    }
  }, [state.buy.token.address, state.sell.token.address]);

  const fetchSellPrice = async () => {
    try {
      const sellTokenToUse =
        state.sell.token.address ===
        "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
          ? "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c"
          : state.sell.token.address;

      const res = await fetch(
        `${MAINNET_API_URL}/tokenPrice/${sellTokenToUse}`
      );
      const data = await res.json();

      const newValue = data.result;

      if (
        newValue === 0 &&
        sellPriceCache.current &&
        sellPriceCache.current !== 0
      ) {
        setSellDollarValue(sellPriceCache.current);
      } else {
        setSellDollarValue(newValue);
        sellPriceCache.current = newValue;
      }

      console.log("Sell price:", newValue);
    } catch (err) {
      console.error("Error fetching sell token price:", err);
    }
  };

  // Fetch Buy Price
  const fetchBuyPrice = async () => {
    try {
      const buyTokenToUse =
        state.buy.token.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
          ? "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c"
          : state.buy.token.address;

      const res = await fetch(`${MAINNET_API_URL}/tokenPrice/${buyTokenToUse}`);
      const data = await res.json();

      const newValue = data.result;

      if (
        newValue === 0 &&
        buyPriceCache.current &&
        buyPriceCache.current !== 0
      ) {
        setBuyDollarValue(buyPriceCache.current);
      } else {
        setBuyDollarValue(newValue);
        buyPriceCache.current = newValue;
      }

      console.log("Buy price:", newValue);
    } catch (err) {
      console.error("Error fetching buy token price:", err);
    }
  };

  // Sell effect
  useEffect(() => {
    fetchSellPrice();
    const intervalId = setInterval(fetchSellPrice, 5000);
    return () => clearInterval(intervalId);
  }, [state.sell.token.address]);

  // Buy effect
  useEffect(() => {
    fetchBuyPrice();
    const intervalId = setInterval(fetchBuyPrice, 5000);
    return () => clearInterval(intervalId);
  }, [state.buy.token.address]);

  const changeHandler = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.trim();

      if (value === "") {
        currentSearchParams.current.delete("amount");
        dispatch({ type: REDUCER_ACTION_TYPE.BUY_AMOUNT, payload: "" });
      } else {
        currentSearchParams.current.set("amount", value);
      }

      dispatch({
        type: REDUCER_ACTION_TYPE.SELL_AMOUNT,
        payload: value ? parseFloat(value) : "",
      });
      queryParamsHandler(currentSearchParams.current.toString());
    },
    [queryParamsHandler]
  );
  const changeSlippage = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.trim();

      if (value === "") {
        currentSearchParams.current.delete("slippage");
        dispatch({ type: REDUCER_ACTION_TYPE.SLIPPAGE, payload: 1 });
      } else {
        currentSearchParams.current.set("slippage", value);
      }

      dispatch({
        type: REDUCER_ACTION_TYPE.SLIPPAGE,
        payload: Number(value),
      });
      queryParamsHandler(currentSearchParams.current.toString());
    },
    [queryParamsHandler]
  );

  useEffect(() => {
    console.log("Slippage Change: ", state.slippage);
  }, [state.slippage]);

  const actionHandler = useCallback(
    async (type: InputActionButtonType) => {
      try {
        const updateAmount = (amt: number | string) => {
          const amountStr = typeof amt === "number" ? amt.toString() : amt;
          currentSearchParams.current.set("amount", amountStr);
          dispatch({
            type: REDUCER_ACTION_TYPE.SELL_AMOUNT,
            payload: parseFloat(amountStr),
          });
        };

        if (type === "clear") {
          currentSearchParams.current.delete("amount");
          dispatch({ type: REDUCER_ACTION_TYPE.SELL_AMOUNT, payload: "" });
          dispatch({ type: REDUCER_ACTION_TYPE.BUY_AMOUNT, payload: "" });
        } else if (type === "max") {
          updateAmount(currentSellBalance);
        } else if (type === "50%") {
          const halfBalance = parseFloat(currentSellBalance) / 2;
          updateAmount(halfBalance);
        }

        queryParamsHandler(currentSearchParams.current.toString());
      } catch (err) {
        console.error("Error in actionHandler:", err);
      }
    },
    [currentSellBalance, queryParamsHandler]
  );

  const swapCurrency = useCallback(() => {
    dispatch({ type: REDUCER_ACTION_TYPE.SWAP });
    currentSearchParams.current.set("tokenIn", `${state.buy.token.address}`);
    currentSearchParams.current.set("tokenOut", `${state.sell.token.address}`);
    currentSearchParams.current.set("amount", `${state.buy.amount}`);
    queryParamsHandler(currentSearchParams.current.toString());
  }, [
    state.buy.token.address,
    state.sell.token.address,
    queryParamsHandler,
    state.buy.amount,
  ]);

  const isBusy = loading || isPerformingSwap || txStage !== "idle";
  const lastTrackedKey = useRef<string>("");

  const fetchQuote = useCallback(async () => {
    // if (!isConnected) return;
    if (txStage !== "idle") return;
    if (isPerformingSwap) return;
    if (state.sell.token.address === state.buy.token.address) {
      setError("Cannot swap the same token");
      return;
    }

    const valid =
      state.sell.token.address &&
      state.buy.token.address &&
      enteredAmount &&
      !isNaN(Number(enteredAmount));

    if (!valid) return;

    console.log(state.buy.token.usdValue);

    const inputDecimal = state.sell.token.decimals;
    const outputDecimal = state.buy.token.decimals;
    const amountToFormat = Number(enteredAmount).toFixed(5);

    // Fix: Keep as BigInt, don't convert to string yet
    const amountInRawBigInt = parseUnits(
      amountToFormat.toString(),
      inputDecimal ?? 18
    );

    const quoteBody = {
      tokenA: state.sell.token.address,
      tokenB: state.buy.token.address,
      dexId: "ALL_BASE",
      amountIn: amountInRawBigInt.toString(), // Convert to string here for API
    };

    const idempotencyKey = `${state.sell.token.symbol}-${state.buy.token.symbol}-${enteredAmount}-${state.dex}`;

    setError("");
    setLoading(true);

    if (lastTrackedKey.current !== idempotencyKey) {
      mixpanel.track("0G Quote Request Started", {
        sell_token: state.sell.token.symbol,
        buy_token: state.buy.token.symbol,
        sell_token_address: state.sell.token.address,
        buy_token_address: state.buy.token.address,
        amount_in: enteredAmount,
        amount_in_usd: (sellDollarValue || 0) * Number(enteredAmount),
        dex_id: state.dex || "ALL",
        wallet_address: address,
      });
      lastTrackedKey.current = idempotencyKey;
    }

    try {
      console.log(quoteBody);

      const res = await fetch(`${MAINNET_API_URL}/quote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quoteBody),
      });

      if (!res.ok) {
        setError("Failed to process swap quote");
        dispatch({
          type: REDUCER_ACTION_TYPE.BUY_AMOUNT,
          payload: "",
        });

        dispatch({
          type: REDUCER_ACTION_TYPE.SWAP_QUOTE,
          payload: undefined,
        });

        mixpanel.track("0G Quote Request Failed", {
          sell_token: state.sell.token.symbol,
          buy_token: state.buy.token.symbol,
          error: `API failed with status ${res.status}`,
          status_code: res.status,
          quote_id: idempotencyKey,
        });

        throw new Error(`0G Quote API failed with status ${res.status}`);
      }

      const quote: SwapQuoteResponse = await res.json();

      const amountOut = quote.amountOut;

      // Fix: Convert scientific notation to regular string before BigInt conversion
      let amountOutString = amountOut.toString();
      if (amountOutString.includes("e") || amountOutString.includes("E")) {
        // Convert scientific notation to regular number string
        amountOutString = Number(amountOut).toLocaleString("fullwide", {
          useGrouping: false,
        });
      }

      const amountOutHuman = formatUnits(amountOutString, outputDecimal ?? 18);
      const displayAmount = Number(amountOutHuman);
      const routePlan = quote.routePlan;

      if (!routePlan || routePlan.length === 0) {
        setError("No Route Found");
        dispatch({
          type: REDUCER_ACTION_TYPE.BUY_AMOUNT,
          payload: "",
        });

        dispatch({
          type: REDUCER_ACTION_TYPE.SWAP_QUOTE,
          payload: undefined,
        });

        mixpanel.track("0G Quote No Route Found", {
          sell_token: state.sell.token.symbol,
          buy_token: state.buy.token.symbol,
          amount_in: enteredAmount,
          amount_in_usd: (sellDollarValue || 0) * Number(enteredAmount),
          quote_id: idempotencyKey,
        });

        return;
      }

      dispatch({
        type: REDUCER_ACTION_TYPE.BUY_AMOUNT,
        payload: displayAmount,
      });

      dispatch({
        type: REDUCER_ACTION_TYPE.SWAP_QUOTE,
        payload: quote,
      });

      mixpanel.track("0G Quote Request Success", {
        sell_token: state.sell.token.symbol,
        buy_token: state.buy.token.symbol,
        amount_in: enteredAmount,
        amount_out: amountOutHuman,
        amount_in_usd: (sellDollarValue || 0) * Number(enteredAmount),
        amount_out_usd: (buyDollarValue || 0) * Number(amountOutHuman),
        route_plan_length: routePlan.length,
        dex_id: state.dex || "ALL",
        quote_id: idempotencyKey,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to fetch swap quote");

      mixpanel.track("0G Quote Request Error", {
        sell_token: state.sell.token.symbol,
        buy_token: state.buy.token.symbol,
        error: err instanceof Error ? err.message : String(err),
        quote_id: idempotencyKey,
      });
    } finally {
      setLoading(false);
    }
  }, [
    state.sell.token.address,
    state.sell.token.decimals,
    state.sell.token.symbol,
    state.buy.token.address,
    state.buy.token.symbol,
    enteredAmount,
    state.dex,
    txStage,
    isPerformingSwap,
    isConnected,
    address,
    sellDollarValue,
    buyDollarValue,
  ]);
  function useQuote(fetchQuote) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      let active = true;

      const fetchWithRetry = async () => {
        try {
          await fetchQuote();
          if (active) {
            timeoutRef.current = setTimeout(fetchWithRetry, 30000);
          }
        } catch (err) {
          console.error("Quote error:", err);
          if (active) {
            timeoutRef.current = setTimeout(fetchWithRetry, 100);
          }
        }
      };

      fetchWithRetry();

      return () => {
        active = false;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }, [fetchQuote]);
  }

  useQuote(fetchQuote);

  useEffect(() => {
    const fetchWithLog = () => {
      console.log("Triggered refetch");
      fetchWalletAssets(address || "");
    };

    fetchWithLog();

    const intervalId = setInterval(fetchWithLog, 30000);

    return () => clearInterval(intervalId);
  }, [fetchWalletAssets, address]);

  const performSwap = useCallback(async () => {
    if (!isConnected) {
      console.warn("Wallet not connected. Cannot perform swap.");
      toast({
        title: `Wallet not connected`,
        description: "Please connect your wallet.",
        className: "border-2 border-red-500 mt-4",
      });
      return;
    }
    if (!state.sell.token.address || !state.buy.token.address) {
      console.warn("Token addresses not set. Cannot perform swap.");
      return;
    }
    if (!state.swap_quote) {
      console.warn("No quote available. Cannot perform swap.");
      return;
    }

    mixpanel.track("0G Swap Transaction Started", {
      sell_token: state.sell.token.symbol,
      buy_token: state.buy.token.symbol,
      sell_token_address: state.sell.token.address,
      buy_token_address: state.buy.token.address,
      amountIn: state.swap_quote?.amountIn,
      amountOut: state.swap_quote?.amountOut,
      tokenPrice: state.swap_quote?.tokenPrice,
      amount_in_usd: (sellDollarValue || 0) * Number(enteredAmount),
      amount_out_usd:
        (buyDollarValue || 0) * Number(state.swap_quote?.amountOut || 0),
      wallet_address: address,
      dex_id: state.dex || "ALL",
    });

    setIsPerformingSwap(true);
    setTxStage("signing");

    console.log(state.slippage);

    const swapBody = {
      publicKey: address,
      quote: { ...state.swap_quote },
      slippage: Number(slippage),
    };

    try {
      const res = await fetch(`${MAINNET_API_URL}/swap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(swapBody),
      });

      const result = await res.json();
      const transactions = result.transactions;
      console.log("Swap transactions:", transactions);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      setTxStage("broadcast");

      // Simulate transactions first
      let simulationFailed = false;
      for (const tx of transactions) {
        try {
          await provider.call({
            to: tx.to,
            from: tx.from,
            data: tx.data,
            value: tx.value || "0x0",
          });
          console.log("Simulation OK for:", tx.to);
        } catch (err) {
          console.log("Simulation failed for:", tx.to, err);
          simulationFailed = true;

          mixpanel.track("0G Swap Simulation Failed", {
            sell_token: state.sell.token.symbol,
            buy_token: state.buy.token.symbol,
            tx_to: tx.to,
            error: err instanceof Error ? err.message : String(err),
            wallet_address: address,
            stage: txStage,
          });
        }
      }

      // Send transactions one by one
      const successfulTxs: TransactionResponse[] = [];

      for (let i = 0; i < transactions.length; i++) {
        const tx = transactions[i];

        try {
          console.log(`Sending transaction ${i + 1}/${transactions.length}`);

          setTxStage(`broadcast`);

          const txResponse = await signer.sendTransaction({
            to: tx.to,
            data: tx.data,
            value: tx.value ? ethers.toBeHex(tx.value) : "0x0",
          });

          console.log(`Transaction ${i + 1} sent:`, txResponse.hash);
          successfulTxs.push(txResponse);

          setTxStage(`mining`);
          const receipt = await txResponse.wait();
          console.log(`Transaction ${i + 1} confirmed:`, receipt?.hash);
        } catch (err: any) {
          console.error(`Transaction ${i + 1} failed:`, err);

          if (err?.message?.includes("denied transaction")) {
            toast({
              title: `Transaction Rejected`,
              description: "You rejected the transaction.",
              className: "border-2 border-red-500 mt-4",
            });
            mixpanel.track("0G User Rejected Swap Transaction", {
              transaction_index: i,
              total_transactions: transactions.length,
            });
          } else if (err?.message?.includes("internal json-rpc error")) {
            toast({
              title: `Transaction Failed`,
              description: "0g network error, please try again",
              className: "border-2 border-red-500 mt-4",
            });
          } else {
            toast({
              title: `Transaction Failed`,
              description:
                err?.message === "Internal JSON-RPC error."
                  ? "0g network error, please try again"
                  : err.message || "An error occurred.",
              className: "border-2 border-red-500 mt-4",
            });
            mixpanel.track("0G Swap Transaction Failed", {
              transaction_index: i,
              total_transactions: transactions.length,
              error_code: err.code,
              error_message: err.message,
            });
          }

          // Stop the process if any transaction fails
          setTxStage("failed");
          setIsPerformingSwap(false);
          return;
        }
      }

      setTxStage("confirmed");
      fetchWalletAssets(address || "");

      // Get the last transaction hash for display
      const lastTx = successfulTxs[successfulTxs.length - 1];
      const txHash = lastTx?.hash || null;

      if (txHash) {
        toast({
          title: "Transaction Successful",
          description: (
            <a
              className="underline"
              target="_blank"
              href={`https://basescan.org/tx/${txHash}`}
            >
              {txHash.slice(0, 8)}...{txHash.slice(-8)}
            </a>
          ),
          className: "border-2 border-green-500 mt-4",
        });

        mixpanel.track("0G Swap Success", {
          total_transactions: transactions.length,
          tx_signature: txHash,
          tx_url: `https://basescan.org/tx/${txHash}`,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      console.error("Swap error:", err);
      setTxStage("failed");

      if (err?.message?.includes("denied transaction")) {
        toast({
          title: "Transaction Rejected",
          description: "You rejected the transaction.",
          className: "border-2 border-red-500 mt-4",
        });
        mixpanel.track("0G User Rejected Swap Transaction");
      } else {
        toast({
          title: "Transaction Failed",
          description:
            err?.message === "Internal JSON-RPC error."
              ? "0g network error, please try again"
              : err.message || "An error occurred.",
          className: "border-2 border-red-500 mt-4",
        });
        mixpanel.track("0G Swap Failed", {
          error_code: err.code,
          error_message: err.message,
          stage: txStage,
        });
      }
    } finally {
      setIsPerformingSwap(false);
      setTimeout(() => setTxStage("idle"), 1500);
    }
  }, [
    isConnected,
    state.sell.token.address,
    state.buy.token.address,
    state.swap_quote,
    state.dex,
    address,
    fetchWalletAssets,
    toast,
  ]);
  const isError = error !== "";

  const label = isError
    ? `${error}`
    : loading
    ? "Fetching swap quote…"
    : txStage === "signing"
    ? "Awaiting wallet signature…"
    : txStage === "broadcast"
    ? "Submitting transaction…"
    : txStage === "mining"
    ? "Waiting for confirmation…"
    : isPerformingSwap
    ? "Processing…"
    : "Swap";

  return (
    <section className="pt-1">
      <section className="pt-1">
        <div>
          <TokenCard>
            <div className="flex justify-between items-center mb-5">
              <h1
                className={`text-3xl bg-white bg-clip-text text-transparent w-full ${montserrat_alternates.className}`}
              >
                Swap
              </h1>
              <div className="flex items-center space-x-2">
                {/* <div className="bg-[#122A10] text-white px-2 py-0.5 rounded-lg text-sm">
                  <Dialog>
                    <DialogTrigger className="bg-[#122A10] hover:bg-[#122A10] text-white px-1 py-1.5">
                      <span className="whitespace-nowrap">
                        Dex:{" "}
                        <span className="text-[#20801F]">
                          {" "}
                          {state.dex === "ZERO_G" ? "JAINE" : state.dex}
                        </span>
                      </span>
                    </DialogTrigger>
                    <DialogContent className="w-[90%]">
                      <DialogHeader>
                        <DialogTitle>Route Dex</DialogTitle>
                        <DialogDescription>
                          Select Your Preferred Dex Pools To Use.
                        </DialogDescription>
                        <div className="flex flex-row flex-wrap pt-4 gap-2">
                          {["ALL"].map((dex) => (
                            <DialogClose key={dex}>
                              <Button
                                className="bg-slate-200 text-black mr-2"
                                onClick={() => {
                                  dispatch({
                                    type: REDUCER_ACTION_TYPE.SELECT_DEX_ROUTE,
                                    payload: dex as DexIdTypes,
                                  });
                                  currentSearchParams.current.set("dexId", dex);
                                  queryParamsHandler(
                                    currentSearchParams.current.toString()
                                  );
                                }}
                              >
                                {dex === "ZERO_G" ? "JAINE" : dex}
                              </Button>
                            </DialogClose>
                          ))}
                        </div>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </div> */}

                <div className="bg-[#122A10] text-white px-2 py-0.5 rounded-lg text-sm">
                  <SwapSettingsDialog
                    onSlippageChange={changeSlippage}
                    currentSlippage={Number(slippage)}
                  />
                </div>
                <div className="py-0.5 rounded-md text-sm">
                  <Button
                    className="relative bg-[#122A10] hover:bg-[#122A10] w-[37px] h-[37px] p-0 rounded-xl flex items-center justify-center"
                    disabled={
                      loading ||
                      isFetchingRef.current ||
                      !enteredAmount ||
                      !state.sell.token.address ||
                      !state.buy.token.address
                    }
                    aria-label="Refresh quote"
                    title="Refresh quote"
                    onClick={fetchQuote}
                  >
                    {loading ? (
                      <span className="inline-block w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    ) : (
                      <RefreshCcw />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <form>
              <div className="relative flex flex-col gap-5">
                <SwapInputgroup
                  id="Sell"
                  type="number"
                  variant="sell"
                  label="Sell"
                  placeholder="0.00"
                  disabled={false}
                  value={state.sell.amount}
                  selectedToken={state.sell.token}
                  otherSelectedToken={state.buy.token}
                  onChange={changeHandler}
                  autoFocus={true}
                  actionHandler={actionHandler}
                  tokenData={tokenList.map((token) => ({
                    ...token,
                    balance: "0",
                    logoURI: token.logo,
                  }))}
                  setSelectedToken={(item) =>
                    selectedTokenHandler(item, "sell")
                  }
                  tokenBalance={Number(currentSellBalance)}
                  tokenRate={
                    Number(sellDollarValue) * Number(enteredAmount) || 0
                  }
                  finalEthBalance={finalEthBalance}
                  loading={loading}
                  tokenList={tokenList}
                />

                <motion.button
                  className="transition absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                  type="button"
                  aria-label="Swap chains"
                  onClick={swapCurrency}
                >
                  <ExchangeIcon />
                </motion.button>

                <SwapInputgroup
                  id="Buy"
                  variant="buy"
                  label="Buy"
                  placeholder="0.00"
                  otherSelectedToken={state.sell.token}
                  selectedToken={state.buy.token}
                  value={state.buy.amount}
                  disabled={false}
                  loading={loading}
                  tokenData={tokenList.map((token) => ({
                    ...token,
                    balance: "0",
                    logoURI: token.logo,
                  }))}
                  setSelectedToken={(item) => selectedTokenHandler(item, "buy")}
                  tokenBalance={Number(currentBuyBalance)}
                  tokenRate={
                    Number(buyDollarValue) * Number(state.buy.amount) || 0
                  }
                  finalEthBalance={finalEthBalance}
                  tokenList={tokenList}
                />
              </div>

              <div className="mt-6">
                <SwapCustomConnectButton
                  performSdkSwap={performSwap}
                  tokenA={state.sell.token.address}
                  tokenB={state.buy.token.address}
                  isBusy={isBusy}
                  isPerformingSwap={isPerformingSwap}
                  label={label}
                  error={error.length > 0}
                  enteredAmount={String(enteredAmount)}
                />
              </div>
            </form>
          </TokenCard>
        </div>
        {state.swap_quote && (
          <SwapImpact
            rawQuote={state.swap_quote}
            sellToken={state.sell.token}
            buyToken={state.buy.token}
            loading={loading}
            slippage={Number(slippage)}
            sellAmount={Number(enteredAmount)}
            buyAmount={Number(state.buy.amount)}
            usdBuy={buyDollarValue ?? 0}
            usdSell={sellDollarValue ?? 0}
            tokenList={tokenList}
          />
        )}
        {/* <SelectedTokens
          sell={state.sell.token}
          buy={state.buy.token}
          sellDollarValue={sellDollarValue ?? 0}
          buyDollarValue={buyDollarValue ?? 0}
        /> */}
      </section>
    </section>
  );
};

export default SwapForm;
