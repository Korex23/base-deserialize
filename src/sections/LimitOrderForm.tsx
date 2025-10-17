"use client";

import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useReducer,
  useState,
  useRef,
  useMemo,
} from "react";
import { Loader2, WalletMinimal, CircleAlert } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { defaultStateValues } from "@/data/mock-limitorder-data";
import { reducerAction } from "@/reducers/limitorder-reducer";
import { REDUCER_ACTION_TYPE } from "@/lib/limitorderconstants";
import { useToast } from "@/hooks/use-toast";
import TokenCard from "@/components/general/TokenCard";
import SelectedTokens from "@/sections/SelectedTokens";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SwapInputgroup from "@/components/form/swapinputgroup";
import { InputActionButtonType } from "@/types/swapform";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { ExchangeIcon } from "@/components/general/Icons";
import { motion } from "framer-motion";
import useDebounce from "@/hooks/useDebounce";
import Link from "next/link";
import { Order, useOrderService } from "@/context/limit-order-provider";
import { Buffer } from "buffer";
import bs58 from "bs58";
import OrderList from "@/components/general/OrderList";
import { formatSmallNumber } from "@/lib/utils";
import { Aldrich, Montserrat_Alternates } from "next/font/google";
import { cn } from "@/lib/utils";
import axios from "axios";
import { mainnetDefaults } from "@/data/mock-data";
import { useAccount } from "wagmi";
import { useWallet } from "@/context/user-wallet-provider";
import { TokenAsset } from "@/types/limit-order";
import { MAINNET_API_URL } from "@/lib/constant";

const aldrich = Aldrich({
  subsets: ["latin"],
  weight: "400",
});

const montserrat_alternates = Montserrat_Alternates({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

interface LoadingStages {
  fetchingOrders: boolean;
  initiatingOrder: boolean;
  creatingOrder: boolean;
  initiatingCancel: boolean;
  cancellingOrder: boolean;
  cancellingAllToken: boolean;
  initCancellingAllToken: boolean;
}

const LimitOrderForm = () => {
  const {
    initOrder,
    createOrder,
    initCancel,
    cancelOrder,
    getOrdersByWallet,
    getOrdersById,
    cancelAllTokenOrders,
    initCancelAllTokenOrders,
  } = useOrderService();
  const {
    isConnected,
    assets,
    address,
    finalEthBalance,
    fetchWalletAssets,
    tokenList,
  } = useWallet();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tokenIn = searchParams.get("tokenIn");
  const tokenOut = searchParams.get("tokenOut");
  const amount = searchParams.get("amount");

  const sellPriceCache = useRef<number | null>(null);
  const buyPriceCache = useRef<number | null>(null);

  const [hasInitializedFromURL, setHasInitializedFromURL] = useState(false);

  const initialValue = useMemo(
    () => ({
      buy: mainnetDefaults.buy,
      sell: {
        ...mainnetDefaults.sell,
        amount: "",
      },
      limitPrice: "",
      expiry: 86400000,
      dex: "",
      markup: "",
    }),
    []
  );

  // State Management

  const [state, dispatch] = useReducer(reducerAction, initialValue);

  useEffect(() => {
    if (!hasInitializedFromURL || !mainnetDefaults) return;

    const hasParams =
      currentSearchParams.current.has("tokenIn") ||
      currentSearchParams.current.has("tokenOut") ||
      currentSearchParams.current.has("amount");

    if (!hasParams) {
      dispatch({
        type: REDUCER_ACTION_TYPE.SELL_TOKEN,
        payload: {
          ...mainnetDefaults.sell.token,
          balance: "0",
          logo: mainnetDefaults.sell.token.logo,
        },
      });

      dispatch({
        type: REDUCER_ACTION_TYPE.BUY_TOKEN,
        payload: {
          ...mainnetDefaults.buy.token,
          balance: "0",
          logo: mainnetDefaults.buy.token.logo,
        },
      });

      dispatch({ type: REDUCER_ACTION_TYPE.SELL_AMOUNT, payload: "" });
      dispatch({ type: REDUCER_ACTION_TYPE.BUY_AMOUNT, payload: "" });
    }
  }, [mainnetDefaults, hasInitializedFromURL]);

  const [buttonLoading, setButtonLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [dollarRate, setDollarRate] = useState({ buy: 0, sell: 0 });
  const [sellDollarValue, setSellDollarValue] = useState<number | null>(null);
  const [buyDollarValue, setBuyDollarValue] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<LoadingStages>({
    fetchingOrders: false,
    initiatingOrder: false,
    creatingOrder: false,
    initiatingCancel: false,
    cancellingOrder: false,
    cancellingAllToken: false,
    initCancellingAllToken: false,
  });
  const [info, setInfo] = useState<React.ReactNode>("");
  const currentSearchParams = useRef(new URLSearchParams(searchParams));
  const enteredAmount = useDebounce(state.sell.amount);
  const pollingIntervalRef = useRef<NodeJS.Timeout>();
  const [isCustomExpiry, setIsCustomExpiry] = useState(false);
  const [customDuration, setCustomDuration] = useState("60");
  const [activeTab, setActiveTab] = useState<"created" | "completed">(
    "created"
  );
  const [showOrders, setShowOrders] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

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
            logo: buyToken.logo ?? mainnetDefaults.buy.token.logo,
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
            logo: sellToken.logo ?? mainnetDefaults.sell.token.logo,
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

    if (hasUpdates) {
      setHasInitializedFromURL(true);
    }
  }, [
    tokenList.length,
    assets,
    tokenIn,
    tokenOut,
    amount,
    hasInitializedFromURL,
    state.sell.amount,
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

  const getTokenInfo = (identifier: string) => {
    return tokenList?.find(
      (t) => t.address === identifier || t.symbol === identifier
    );
  };

  const handleShowOrders = () => {
    setShowOrders((prev) => !prev);
  };

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

  const fetchOrders = useCallback(async () => {
    if (!address) return;

    try {
      setLoading((prev) => ({ ...prev, fetchingOrders: false }));

      // Usage
      const response = await getOrdersByWallet(address.toString());

      const formattedOrders: Order[] = await Promise.all(
        response.data.map(async (order: Order) => {
          try {
            const updatedOrder = await getOrdersById(order.id);

            return {
              id: order.id,
              tokenA: order.tokenA,
              tokenB: order.tokenB,
              expiry: order.expiry,
              price: order.price,
              amount: order.amount,
              amountOut: order.amountOut,
              depositSignature: order.depositSignature,
              status: updatedOrder.data.order.status.toLowerCase(),
              createdAt: order.createdAt,
              updatedAt: updatedOrder.data.order.updatedAt,
              executionSignature: order.executionSignature,
              refundTrxSignature: order.refundTrxSignature,
            };
          } catch (err) {
            console.warn(
              `Could not update order ${order.id}, fallback to original`
            );
            return {
              ...order,
              status: order.status.toLowerCase(),
            };
          }
        })
      );

      setOrders(formattedOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading((prev) => ({ ...prev, fetchingOrders: false }));
    }
  }, [getOrdersByWallet, address, toast]);

  useEffect(() => {
    if (isConnected && address) {
      fetchOrders();

      pollingIntervalRef.current = setInterval(fetchOrders, 30000);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [isConnected, address, fetchOrders]);

  const calculateEquivalentBuyAmount = useCallback(() => {
    if (!enteredAmount || !sellDollarValue || !buyDollarValue) return;

    // Check balance
    if (parseFloat(enteredAmount as string) > parseFloat(currentSellBalance)) {
      setError("Insufficient Balance to Place this Order");
      return;
    } else {
      setError("");
    }

    let equivalentBuyAmount;

    if (state.limitPrice) {
      // Using limit price: buyAmount = sellAmount * limitPrice
      equivalentBuyAmount =
        parseFloat(enteredAmount as string) * parseFloat(state.limitPrice);
    } else {
      // Using market price: buyAmount = (sellAmount * sellTokenPrice) / buyTokenPrice
      const sellAmountInUsd =
        parseFloat(enteredAmount as string) * sellDollarValue;
      equivalentBuyAmount = sellAmountInUsd / buyDollarValue;
    }

    dispatch({
      type: REDUCER_ACTION_TYPE.BUY_AMOUNT,
      payload: equivalentBuyAmount.toFixed(6),
    });
  }, [
    enteredAmount,
    sellDollarValue,
    buyDollarValue,
    state.limitPrice,
    currentSellBalance,
  ]);

  // Real-time calculation when inputs change
  useEffect(() => {
    if (enteredAmount && sellDollarValue && buyDollarValue) {
      calculateEquivalentBuyAmount();
    }
  }, [
    enteredAmount,
    sellDollarValue,
    buyDollarValue,
    state.limitPrice,
    calculateEquivalentBuyAmount,
  ]);

  // Evaluate limit price against market
  const evaluateLimitPriceAgainstMarket = useCallback(() => {
    const sellRate = sellDollarValue;
    const buyRate = buyDollarValue;
    const limitPrice = parseFloat(state.limitPrice);

    if (!sellRate || !buyRate || !limitPrice) {
      setInfo("");
      return;
    }

    // Corrected market price computation
    const marketPrice = sellRate / buyRate;
    const marketPnl = ((limitPrice - marketPrice) / marketPrice) * 100;

    if (limitPrice < marketPrice && marketPnl < -1) {
      setInfo(
        <>
          Limit Price is {Math.abs(marketPnl).toFixed(2)}% lower than the market
          value. We recommend using{" "}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Deserialize Swap
          </Link>{" "}
          instead.
        </>
      );
    } else {
      setInfo("");
    }
  }, [sellDollarValue, buyDollarValue, state.limitPrice]);

  useEffect(() => {
    evaluateLimitPriceAgainstMarket();
  }, [evaluateLimitPriceAgainstMarket]);

  // URL parameter handling
  const queryParamsHandler = useCallback(
    (query: string) => {
      router.replace(`${pathname}?${query}`, { scroll: false });
    },
    [pathname, router]
  );

  // Input change handlers
  const changeHandler = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.trim();
      if (value === "") {
        currentSearchParams.current.delete("amount");
      } else {
        currentSearchParams.current.set("amount", value);
      }
      dispatch({
        type: REDUCER_ACTION_TYPE.SELL_AMOUNT,
        payload: value ? parseFloat(value) : "",
      });
      queryParamsHandler(currentSearchParams.current.toString());
      evaluateLimitPriceAgainstMarket();
    },
    [queryParamsHandler, evaluateLimitPriceAgainstMarket]
  );

  const calculateMarketPrice = useCallback(() => {
    if (!sellDollarValue || !buyDollarValue) return 0;
    return sellDollarValue / buyDollarValue;
  }, [sellDollarValue, buyDollarValue]);

  useEffect(() => {
    if (sellDollarValue && buyDollarValue && !state.limitPrice) {
      const marketPrice = sellDollarValue / buyDollarValue;
      dispatch({
        type: REDUCER_ACTION_TYPE.LIMIT_PRICE,
        payload: marketPrice.toFixed(6),
      });

      if (enteredAmount) {
        calculateEquivalentBuyAmount();
      }
    }
  }, [
    sellDollarValue,
    buyDollarValue,
    state.sell.token.address,
    state.buy.token.address,
    enteredAmount,
    calculateEquivalentBuyAmount,
  ]);

  const applyMarkup = (percent: number) => {
    const marketPrice = calculateMarketPrice();
    if (marketPrice) {
      const newLimitPrice = marketPrice * (1 + percent / 100);
      dispatch({
        type: REDUCER_ACTION_TYPE.LIMIT_PRICE,
        payload: newLimitPrice.toFixed(6),
      });

      if (enteredAmount) {
        const equivalentBuyAmount =
          parseFloat(enteredAmount as string) * newLimitPrice;
        dispatch({
          type: REDUCER_ACTION_TYPE.BUY_AMOUNT,
          payload: equivalentBuyAmount.toFixed(6),
        });
      }
    }
  };

  const handleLimitPriceChange = (value: string) => {
    dispatch({
      type: REDUCER_ACTION_TYPE.LIMIT_PRICE,
      payload: value,
    });

    // Recalculate buy amount when limit price changes manually
    if (enteredAmount && value) {
      const equivalentBuyAmount =
        parseFloat(enteredAmount as string) * parseFloat(value);
      dispatch({
        type: REDUCER_ACTION_TYPE.BUY_AMOUNT,
        payload: equivalentBuyAmount.toFixed(6),
      });
    }
  };

  const selectedTokenHandler = useCallback(
    async (item: TokenAsset, type: "sell" | "buy") => {
      const tokenBalance =
        assets?.find(
          (a) => a.address.toLowerCase() === item.address.toLowerCase()
        )?.balance || "0";

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

      const newRate = type === "sell" ? sellDollarValue : buyDollarValue;
      const otherRate = type === "sell" ? buyDollarValue : sellDollarValue;

      if (newRate && otherRate) {
        const marketPrice =
          type === "sell" ? newRate / otherRate : otherRate / newRate;
        dispatch({
          type: REDUCER_ACTION_TYPE.LIMIT_PRICE,
          payload: marketPrice.toFixed(6),
        });
      }
    },
    [assets, queryParamsHandler, buyDollarValue, sellDollarValue]
  );
  const swapCurrency = useCallback(() => {
    dispatch({ type: REDUCER_ACTION_TYPE.SWAP });

    // Update URL params
    currentSearchParams.current.set("tokenIn", state.buy.token.address);
    currentSearchParams.current.set("tokenOut", state.sell.token.address);
    queryParamsHandler(currentSearchParams.current.toString());

    // Update market price when swapping tokens
    if (buyDollarValue && sellDollarValue) {
      const newMarketPrice = buyDollarValue / sellDollarValue;
      dispatch({
        type: REDUCER_ACTION_TYPE.LIMIT_PRICE,
        payload: newMarketPrice.toFixed(6),
      });

      // Recalculate buy amount after swap
      if (enteredAmount) {
        const equivalentBuyAmount =
          parseFloat(enteredAmount as string) * newMarketPrice;
        dispatch({
          type: REDUCER_ACTION_TYPE.BUY_AMOUNT,
          payload: equivalentBuyAmount.toFixed(6),
        });
      }
    }
  }, [
    state.buy.token.address,
    state.sell.token.address,
    sellDollarValue,
    buyDollarValue,
    queryParamsHandler,
    enteredAmount,
  ]);

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
  // Expiration options
  const expirationOptions = useMemo(
    () => [
      { value: 300000, label: "5 minutes" },
      { value: 600000, label: "10 minutes" },
      { value: 1800000, label: "30 minutes" },
      { value: 3600000, label: "1 hour" },
      { value: 86400000, label: "1 day" },
      { value: 604800000, label: "1 week" },
      { value: 2592000000, label: "1 month" },
      { value: 7776000000, label: "3 months" },
      { value: -1, label: "Custom..." },
    ],
    []
  );

  const selectedDuration = useMemo(() => {
    if (state.expiry === 0) return 0;

    const duration = state.expiry;

    const exactMatch = expirationOptions.find((opt) => opt.value === duration);
    if (exactMatch) return exactMatch.value;

    const isCustom = !expirationOptions.some((opt) => {
      return Math.abs(opt.value - duration) < 60000;
    });

    if (isCustom) {
      setIsCustomExpiry(true);
      setCustomDuration((duration / 60000).toString());
      return -1;
    }

    const closest = expirationOptions.reduce((prev, curr) =>
      Math.abs(curr.value - duration) < Math.abs(prev.value - duration)
        ? curr
        : prev
    );

    return closest.value;
  }, [state.expiry, expirationOptions]);

  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(
    null
  );

  const handleInitCancel = useCallback(
    async (orderId: string) => {
      if (!address) {
        toast({
          title: "Wallet not isConnected",
          className: "border-2 border-red-500",
        });
        return;
      }

      try {
        setCancellingOrderId(orderId);
        setLoading((prev) => ({ ...prev, initiatingCancel: true }));

        // const response = await initCancel({
        //   address: address.toString(),
        //   orderId: orderId,
        // });

        // if (!signMessage) {
        //   throw new Error("SIGN_MESSAGE_NOT_SUPPORTED");
        // }
        // const signature = await signMessage(
        //   new TextEncoder().encode(response.data.messageToSign)
        // );

        // if (!signature) {
        //   throw new Error("Message signing cancelled");
        // }

        // // Proceed with cancellation
        // await handleCancelOrder(orderId, signature);

        fetchOrders();
      } catch (error) {
        console.error("Cancellation failed:", error);
        toast({
          title: "Cancellation failed",
          description:
            error instanceof Error ? error.message : "Failed to cancel order",
          className: "border-2 border-red-500",
        });
      } finally {
        setLoading((prev) => ({ ...prev, initiatingCancel: false }));
        setCancellingOrderId(null);
      }
    },
    [address, initCancel, toast, fetchOrders]
  );

  const handleCancelOrder = useCallback(
    async (orderId: string, signature: Uint8Array) => {
      if (!address) {
        toast({
          title: "Wallet not isConnected",
          className: "border-2 border-red-500",
        });
        return;
      }

      try {
        setLoading((prev) => ({ ...prev, cancellingOrder: true }));

        // Convert signature to Base58
        const signatureBase58 = bs58.encode(signature);

        // Add retry logic
        const maxRetries = 3;
        let lastError;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
          try {
            // const response = await cancelOrder({
            //   signature: signatureBase58,
            //   address: address.toString(),
            //   orderId,
            // });

            toast({
              title: "Order cancelled successfully",
              className: "border-2 border-green-500",
            });

            return null;
          } catch (error) {
            lastError = error;
            if (attempt < maxRetries - 1) {
              await new Promise((resolve) =>
                setTimeout(resolve, 1000 * (attempt + 1))
              );
            }
          }
        }

        throw lastError;
      } catch (error) {
        console.error("Cancellation failed:", error);

        let errorMessage = "Failed to cancel order";
        if (error instanceof Error) {
          if (error.message.includes("503")) {
            errorMessage =
              "Service temporarily unavailable. Please try again later.";
          } else if (error.message.includes("withdrawal transaction")) {
            errorMessage =
              "Failed to process withdrawal. Please check your balance and try again.";
          } else {
            errorMessage = error.message;
          }
        }

        toast({
          title: "Cancellation failed",
          description: errorMessage,
          className: "border-2 border-red-500",
        });

        throw error;
      } finally {
        setLoading((prev) => ({ ...prev, cancellingOrder: false }));
      }
    },
    [address, cancelOrder, toast]
  );

  const handleInitCancelOrderOfASpecificToken = useCallback(
    async (token: string) => {
      if (!address) {
        toast({
          title: "Wallet not isConnected",
          className: "border-2 border-red-500",
        });
        return;
      }

      try {
        setLoading((prev) => ({ ...prev, initCancellingAllToken: true }));

        // const response = await initCancelAllTokenOrders({
        //   address: address.toString(),
        //   token: token,
        // });

        // if (!signMessage) {
        //   throw new Error("SIGN_MESSAGE_NOT_SUPPORTED");
        // }
        // const signature = await signMessage(
        //   new TextEncoder().encode(response.data.messageToSign)
        // );

        // if (!signature) {
        //   throw new Error("Message signing cancelled");
        // }

        // // Proceed with cancellation
        // await handleCancelAllTokenOrder(signature, token);

        fetchOrders();
      } catch (error) {
      } finally {
        setLoading((prev) => ({ ...prev, initCancellingAllToken: false }));
      }
    },
    [address, initCancelAllTokenOrders]
  );

  const handleCancelAllTokenOrder = useCallback(
    async (signature: Uint8Array, token: string) => {
      if (!address) {
        toast({
          title: "Wallet not isConnected",
          className: "border-2 border-red-500",
        });
        return;
      }

      try {
        setLoading((prev) => ({ ...prev, cancellingAllToken: true }));

        // Convert signature to Base58
        const signatureBase58 = bs58.encode(signature);

        // Add retry logic
        const maxRetries = 3;
        let lastError;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
          try {
            const response = await cancelAllTokenOrders({
              signature: signatureBase58,
              publicKey: address.toString(),
              token: token,
            });

            toast({
              title: "Order cancelled successfully",
              className: "border-2 border-green-500",
            });

            return response;
          } catch (error) {
            lastError = error;
            if (attempt < maxRetries - 1) {
              await new Promise((resolve) =>
                setTimeout(resolve, 1000 * (attempt + 1))
              );
            }
          }
        }

        throw lastError;
      } catch (error) {
        console.error("Cancellation failed:", error);

        let errorMessage = "Failed to cancel order";
        if (error instanceof Error) {
          if (error.message.includes("503")) {
            errorMessage =
              "Service temporarily unavailable. Please try again later.";
          } else if (error.message.includes("withdrawal transaction")) {
            errorMessage =
              "Failed to process withdrawal. Please check your balance and try again.";
          } else {
            errorMessage = error.message;
          }
        }

        toast({
          title: "Cancellation failed",
          description: errorMessage,
          className: "border-2 border-red-500",
        });

        throw error;
      } finally {
        setLoading((prev) => ({ ...prev, cancellingAllToken: false }));
      }
    },
    [address, cancelAllTokenOrders]
  );

  const statusClassMap: Record<string, string> = {
    CREATED: "text-yellow-500 font-semibold",
    PARTIAL: "text-blue-500 font-semibold",
    COMPLETED: "text-green-600 font-semibold",
    EXPIRED: "text-gray-500 font-semibold",
    CANCELLED: "text-red-500 font-semibold",
    REFUNDED: "text-purple-500 font-semibold",
    PENDING: "text-orange-500 font-semibold",
  };

  const getPriceDifferencePercentage = useCallback(() => {
    if (!state.limitPrice || !sellDollarValue || !buyDollarValue) return null;

    const marketPrice = sellDollarValue / buyDollarValue;
    const limitPrice = parseFloat(state.limitPrice);

    const percentageDiff = ((limitPrice - marketPrice) / marketPrice) * 100;

    return percentageDiff;
  }, [state.limitPrice, sellDollarValue, buyDollarValue]);

  const getAdjustedDollarValue = useCallback(() => {
    if (!state.limitPrice || !sellDollarValue || !buyDollarValue)
      return sellDollarValue || "0.00";

    const marketPrice = sellDollarValue / buyDollarValue;
    const limitPrice = parseFloat(state.limitPrice);

    if (Math.abs(limitPrice - marketPrice) < 0.000001) {
      return sellDollarValue;
    }

    const adjustedValue = limitPrice * buyDollarValue;
    return adjustedValue;
  }, [state.limitPrice, sellDollarValue, buyDollarValue]);

  return (
    <section
      className={`pt-1 ${
        showOrders && "mx-auto flex flex-col justify-center items-center"
      } `}
    >
      <section
        className={`pt-1 ${
          showOrders &&
          "flex flex-col-reverse lg:flex-row gap-5 justify-center mx-auto"
        }`}
      >
        <div>
          <div className="w-full mx-auto">
            <TokenCard>
              <div className="flex justify-between">
                <h1
                  className={`text-3xl bg-white bg-clip-text text-transparent w-full ${montserrat_alternates.className}`}
                >
                  Limit Order
                </h1>
                <Button
                  onClick={handleShowOrders}
                  className={cn(
                    "px-4 py-1 rounded-md text-sm font-medium mb-4 text-white",
                    montserrat_alternates.className
                  )}
                >
                  {showOrders ? "Hide Orders" : "Display Orders"}
                </Button>
              </div>

              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex flex-col gap-5"
              >
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
                    loading={loading.initiatingOrder || loading.creatingOrder}
                    tokenList={tokenList}
                  />

                  <motion.button
                    // whileHover={{ rotate: 180 }}
                    className="transition absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                    onClick={swapCurrency}
                    disabled={loading.initiatingOrder || loading.creatingOrder}
                    type="button"
                    aria-label="Swap chains"
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
                    loading={loading.initiatingOrder || loading.creatingOrder}
                    tokenData={tokenList.map((token) => ({
                      ...token,
                      balance: "0",
                      logoURI: token.logo,
                    }))}
                    setSelectedToken={(item) =>
                      selectedTokenHandler(item, "buy")
                    }
                    tokenBalance={Number(currentBuyBalance)}
                    tokenRate={
                      Number(buyDollarValue) * Number(state.buy.amount) || 0
                    }
                    finalEthBalance={finalEthBalance}
                    tokenList={tokenList}
                  />
                </div>
                <div className="flex sm:flex-row flex-col gap-4 mt-4">
                  <div className="bg-[#191918] p-4 rounded-lg sm:flex-[2]">
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-medium text-sm text-gray-400">
                        Sell {state.sell.token.symbol} at rate{" "}
                        {(() => {
                          const priceDiff = getPriceDifferencePercentage();

                          if (priceDiff !== null) {
                            return (
                              <span
                                className={`text-xs ${
                                  priceDiff >= 0
                                    ? "text-green-400"
                                    : "text-red-400"
                                }`}
                              >
                                {Number(priceDiff.toFixed(2)) !== 0
                                  ? `(${
                                      priceDiff >= 0 ? "+" : ""
                                    }${priceDiff.toFixed(2)}%)`
                                  : ""}
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </label>
                      <button
                        type="button"
                        className="text-xs text-[#85eeab] hover:underline"
                        onClick={() => {
                          const marketPrice = calculateMarketPrice();
                          if (marketPrice) {
                            dispatch({
                              type: REDUCER_ACTION_TYPE.LIMIT_PRICE,
                              payload: marketPrice.toFixed(6),
                            });
                            dispatch({
                              type: REDUCER_ACTION_TYPE.MARKUP,
                              payload: "",
                            });
                          }
                        }}
                      >
                        Use Market
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Input
                          type="number"
                          className="bg-transparent text-white border-none focus:ring-0 focus-visible:ring-0 p-0 text-xl font-bold"
                          value={state.limitPrice}
                          onChange={(e) =>
                            handleLimitPriceChange(e.target.value)
                          }
                          onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        />
                        <div className="space-x-1">
                          <Button
                            variant={"secondary"}
                            className="text-xs rounded-md p-1 h-fit border border-foreground/50"
                            type="button"
                            onClick={() => applyMarkup(1)}
                          >
                            +1%
                          </Button>
                          <Button
                            variant={"secondary"}
                            className="text-xs rounded-md p-1 h-fit border border-foreground/50"
                            type="button"
                            onClick={() => applyMarkup(10)}
                          >
                            +10%
                          </Button>
                          <Button
                            variant={"secondary"}
                            className="text-xs rounded-md p-1 h-fit border border-foreground/50"
                            type="button"
                            onClick={() => applyMarkup(25)}
                          >
                            +25%
                          </Button>
                        </div>
                      </div>
                      <div className="text-right ml-1">
                        <div className="text-white text-lg font-semibold">
                          {state.buy.token.symbol}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          ≈
                          {state.limitPrice ? (
                            <>
                              <span
                                className="text-gray-400"
                                dangerouslySetInnerHTML={{
                                  __html: formatSmallNumber(
                                    Number(getAdjustedDollarValue())
                                  ),
                                }}
                              />
                            </>
                          ) : (
                            <span className="text-gray-400">0.00</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#191918] p-4 rounded-lg sm:flex-[1]">
                    <div className="text-sm text-white font-medium mb-2">
                      Expiry
                    </div>
                    <select
                      className="bg-[#191918] text-white w-full focus:ring-0 focus-visible:ring-0 focus:outline-none"
                      value={selectedDuration}
                      onChange={(e) => {
                        const duration = Number(e.target.value);
                        if (duration === -1) {
                          setIsCustomExpiry(true);
                          // Set to current custom duration or default (1 hour)
                          const defaultDuration =
                            parseFloat(customDuration) > 0
                              ? parseFloat(customDuration) * 60000
                              : 3600000;
                          dispatch({
                            type: REDUCER_ACTION_TYPE.EXPIRY,
                            payload: defaultDuration,
                          });
                        } else {
                          setIsCustomExpiry(false);
                          dispatch({
                            type: REDUCER_ACTION_TYPE.EXPIRY,
                            payload: duration,
                          });
                        }
                      }}
                    >
                      {expirationOptions.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                          className="bg-[#1e1e2f] text-white"
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {isCustomExpiry && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Custom Expiry Duration
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        value={customDuration} // Directly use minutes value (no division needed)
                        onChange={(e) => {
                          const minutes = Math.max(1, Number(e.target.value)); // Ensure minimum 1 minute
                          setCustomDuration(minutes.toString());
                          dispatch({
                            type: REDUCER_ACTION_TYPE.EXPIRY,
                            payload: minutes * 60000, // Convert to ms for storage
                          });
                        }}
                        className="bg-[#191918] text-white px-4 py-2 rounded-lg focus:outline-none w-full sm:w-40 transition-all duration-200"
                        placeholder="Enter minutes"
                        aria-label="Custom expiry duration in minutes"
                      />
                      <span className="text-gray-300 text-sm font-medium whitespace-nowrap">
                        minutes
                      </span>
                    </div>
                    {Number(customDuration) < 1 && ( // Check against minutes now, not ms
                      <p className="mt-1 text-xs text-yellow-400">
                        Minimum duration is 1 minute
                      </p>
                    )}
                  </div>
                )}

                {info && (
                  <div className="text-xs text-yellow-500 border border-yellow-600 rounded-md p-3">
                    {info}
                  </div>
                )}

                {isConnected ? (
                  <Button
                    type="button"
                    className="w-full py-6 rounded-xl text-white"
                    variant={error ? "error" : "default"}
                    onClick={() => {
                      if (!enteredAmount || !state.limitPrice) {
                        toast({
                          title: "Fill sell amount and limit price first",
                          className: "border-2 border-red-500",
                        });
                        return;
                      } else {
                        setPreviewOpen(true);
                      }
                      if (loading.initiatingOrder || loading.creatingOrder)
                        return;
                    }}
                    disabled={
                      !enteredAmount ||
                      !state.limitPrice ||
                      loading.initiatingOrder ||
                      loading.creatingOrder ||
                      buttonLoading ||
                      !!error
                    }
                  >
                    {error ? (
                      <div className="flex items-center justify-center gap-2 text-sm text-white italic">
                        <CircleAlert className="size-4" />
                        {error}
                      </div>
                    ) : loading.creatingOrder ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin !size-7" />
                        <span>Creating Order...</span>
                      </div>
                    ) : loading.initiatingOrder ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin !size-7" />
                        <span>Preparing Transaction...</span>
                      </div>
                    ) : buttonLoading ? (
                      <span>Placing Order...</span>
                    ) : (
                      <span>Place Limit Order</span>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    type="button"
                    // onClick={handleConnect}
                    className="py-6 border border-green-300 text-[#cccccc] rounded-xl"
                  >
                    <WalletMinimal />
                    Connect Wallet
                  </Button>
                )}
              </form>
            </TokenCard>

            <SelectedTokens
              buy={state.buy.token}
              sell={state.sell.token}
              sellDollarValue={sellDollarValue ?? 0}
              buyDollarValue={buyDollarValue ?? 0}
            />
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
              <DialogContent className="rounded-2xl p-6 bg-[#191918] border border-[#1E1E2A] text-white max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-center mb-2">
                    Confirm Limit Order
                  </DialogTitle>
                  <DialogDescription className="text-center text-gray-400 text-sm">
                    Review your order details
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 my-6">
                  {/* Order Details Card */}
                  <div className="bg-[#262626] rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-[#1E1E2A]">
                      <span className="text-sm text-gray-400">You Sell</span>
                      <div className="text-right">
                        <p className="font-medium text-white">
                          {Number(state.sell.amount).toLocaleString(undefined, {
                            maximumFractionDigits: 9,
                          })}{" "}
                          {state.sell.token.symbol}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-[#1E1E2A]">
                      <span className="text-sm text-gray-400">You Buy</span>
                      <div className="text-right">
                        <p className="font-medium text-white">
                          {Number(state.buy.amount).toLocaleString(undefined, {
                            maximumFractionDigits: 9,
                          })}{" "}
                          {state.buy.token.symbol}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-[#1E1E2A]">
                      <span className="text-sm text-gray-400">Limit Price</span>
                      <div className="text-right">
                        <p className="font-medium text-white">
                          {Number(state.limitPrice).toLocaleString(undefined, {
                            maximumFractionDigits: 9,
                          })}{" "}
                          {state.buy.token.symbol} per {state.sell.token.symbol}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-400">Expiry</span>
                      <span className="font-medium text-white">
                        {state.expiry === 0
                          ? "Never"
                          : new Date(Date.now() + state.expiry).toLocaleString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                      </span>
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex flex-col gap-3 mt-2">
                  <Button
                    onClick={() => {
                      // submitLimitOrder();
                      setPreviewOpen(false);
                    }}
                    variant={"default"}
                    className="w-full py-3 rounded-xl font-semibold text-white bg-[#387533]  transition-colors"
                  >
                    <span>Place Order</span>
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() => setPreviewOpen(false)}
                    className="w-full py-3 rounded-xl font-semibold border-gray-700 bg-[#1E1E2A] text-white transition-colors"
                  >
                    Cancel
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {showOrders && (
          <>
            {/* Inline for md and above */}
            <div className="hidden lg:block lg:flex-1">
              <OrderList
                title="My Orders"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                textClass={montserrat_alternates.className}
                loading={loading}
                orders={orders}
                statusClassMap={statusClassMap}
                getTokenInfo={getTokenInfo}
                fetchOrders={fetchOrders}
                handleInitCancel={handleInitCancel}
                publicKey={address!}
                handleInitCancelOrderOfASpecificToken={
                  handleInitCancelOrderOfASpecificToken
                }
                cancellingOrderId={cancellingOrderId ?? ""}
                tokenList={tokenList}
              />
            </div>

            {/* Modal for small screens */}
            <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center lg:hidden">
              <div className="bg-[#262626] w-full max-w-md mx-auto rounded-lg h-[90vh] z-20">
                <div className="flex justify-between items-center p-4 border-b border-zinc-700">
                  <button
                    onClick={() => setShowOrders(false)}
                    className="text-white bg-zinc-700 px-3 py-1 rounded-md"
                  >
                    Close
                  </button>
                </div>

                <div>
                  <OrderList
                    title="My Orders"
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    textClass={montserrat_alternates.className}
                    loading={loading}
                    orders={orders}
                    statusClassMap={statusClassMap}
                    getTokenInfo={getTokenInfo}
                    fetchOrders={fetchOrders}
                    handleInitCancel={handleInitCancel}
                    publicKey={address!}
                    handleInitCancelOrderOfASpecificToken={
                      handleInitCancelOrderOfASpecificToken
                    }
                    cancellingOrderId={cancellingOrderId ?? ""}
                    tokenList={tokenList}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </section>
  );
};

export default LimitOrderForm;
