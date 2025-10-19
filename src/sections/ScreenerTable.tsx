"use client";

import React, { useEffect, useState } from "react";
import {
  ScreenerTokenResponse,
  SwapQuoteResponse,
  TokenAsset,
} from "@/types/swapform";
import { formatSmallNumber, splitStringInMiddle } from "@/lib/utils";
import { generatePlaceholderIcon } from "@/context/user-wallet-provider";
import TokenImage from "@/components/general/TokenImage";
import { Check, X, Loader2, Copy } from "lucide-react";
import { ethers, parseUnits, formatUnits, TransactionResponse } from "ethers";
import { MAINNET_API_URL, NATIVE_0G_TOKEN } from "@/lib/constant";
import { useWallet } from "@/context/user-wallet-provider";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

type TimeFrame = "5m" | "1h" | "6h" | "24h";

interface SwapModalState {
  isOpen: boolean;
  stage: "fetching" | "countdown" | "processing" | "success" | "error";
  quote: SwapQuoteResponse | null;
  countdown: number;
  tokenSymbol: string;
  error?: string;
}

const CryptoListingDashboard = () => {
  const { address, isConnected, screenerData, fetchScreenerData } = useWallet();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyId, setCopyId] = useState<number | null>(null);
  const [buyAmount, setBuyAmount] = useState<number>(0.1);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>("24h");
  const [outputDec, setOutputDec] = useState<number | null>(null);

  const [swapModal, setSwapModal] = useState<SwapModalState>({
    isOpen: false,
    stage: "fetching",
    quote: null,
    countdown: 10,
    tokenSymbol: "",
  });

  const getStatsForTimeFrame = (row: ScreenerTokenResponse) => {
    switch (selectedTimeFrame) {
      case "5m":
        return row.volume5m;
      case "1h":
        return row.volume1h;
      case "6h":
        return row.volume6h;
      case "24h":
      default:
        return row.volume24h;
    }
  };

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setCopyId(id);
    setTimeout(() => {
      setCopied(false);
      setCopyId(null);
    }, 2000);
  };

  const formatNumber = (num: number) => {
    if (num > 10 ** 12 || num < 0) {
      const numStr = String(num);
      if (numStr.length > 16) {
        if (numStr.length <= 21) {
          return `${numStr.slice(0, -18)} Quintillion`;
        } else if (numStr.length <= 24) {
          return `${numStr.slice(0, -21)} Sextillion`;
        } else {
          return `${numStr.slice(0, 3)}e+${numStr.length - 1}`;
        }
      }
    }

    const formatter = new Intl.NumberFormat("en", { notation: "compact" });

    const result = formatter.format(num);
    if (typeof result === "string" && result.includes("NaN")) {
      return "0.00";
    }

    if (num < 0.01) {
      return num.toFixed(2);
    }

    return formatter.format(num);
  };

  useEffect(() => {
    fetchScreenerData();

    const interval = setInterval(() => {
      fetchScreenerData();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (
      swapModal.isOpen &&
      swapModal.stage === "countdown" &&
      swapModal.countdown > 0
    ) {
      timer = setInterval(() => {
        setSwapModal((prev) => ({
          ...prev,
          countdown: prev.countdown - 1,
        }));
      }, 1000);
    } else if (swapModal.stage === "countdown" && swapModal.countdown === 0) {
      // Auto-execute swap after countdown
      executeSwap();
    }

    return () => clearInterval(timer);
  }, [swapModal.isOpen, swapModal.stage, swapModal.countdown]);

  const closeModal = () => {
    setSwapModal({
      isOpen: false,
      stage: "fetching",
      quote: null,
      countdown: 10,
      tokenSymbol: "",
    });
  };

  const executeSwap = async () => {
    if (!swapModal.quote) return;

    setSwapModal((prev) => ({ ...prev, stage: "processing" }));

    const slippage = 0.5;
    const swapBody = {
      publicKey: address,
      slippage: slippage,
      quote: { ...swapModal.quote },
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

      const successfulTxs: TransactionResponse[] = [];

      for (let i = 0; i < transactions.length; i++) {
        const tx = transactions[i];

        try {
          console.log(`Sending transaction ${i + 1}/${transactions.length}`);

          const txResponse = await signer.sendTransaction({
            to: tx.to,
            data: tx.data,
            value: tx.value ? ethers.toBeHex(tx.value) : "0x0",
          });

          console.log(`Transaction ${i + 1} sent:`, txResponse.hash);
          successfulTxs.push(txResponse);

          const receipt = await txResponse.wait();
          console.log(`Transaction ${i + 1} confirmed:`, receipt?.hash);
        } catch (err: any) {
          console.error(`Transaction ${i + 1} failed:`, err);

          if (err?.message?.includes("denied transaction")) {
            setSwapModal((prev) => ({
              ...prev,
              stage: "error",
              error: "You rejected the transaction.",
            }));
          } else {
            setSwapModal((prev) => ({
              ...prev,
              stage: "error",
              error:
                err?.message === "Internal JSON-RPC error."
                  ? "0g network error, please try again"
                  : err.message || "An error occurred.",
            }));
          }
          return;
        }
      }

      const lastTx = successfulTxs[successfulTxs.length - 1];
      const txHash = lastTx?.hash || null;

      if (txHash) {
        setSwapModal((prev) => ({ ...prev, stage: "success" }));
        toast({
          title: "Transaction Successful",
          description: (
            <a
              className="underline"
              target="_blank"
              href={`https://chainscan.0g.ai/tx/${txHash}`}
            >
              {txHash.slice(0, 8)}...{txHash.slice(-8)}
            </a>
          ),
          className: "border-2 border-green-500 mt-4",
        });
        setBuyAmount(0.1);

        setTimeout(() => {
          closeModal();
        }, 3000);
      }
    } catch (err: any) {
      console.error("Swap error:", err);
      setSwapModal((prev) => ({
        ...prev,
        stage: "error",
        error:
          err?.message === "Internal JSON-RPC error."
            ? "0g network error, please try again"
            : err.message || "An error occurred.",
      }));
    }
  };

  const buyToken = async (address: string, symbol: string) => {
    if (!isConnected) {
      alert("Please connect your wallet");
      return;
    }
    if (screenerData.length === 0) {
      alert("No tokens available to buy");
      return;
    }

    const tokenToBuy = screenerData.find(
      (token) => token.address.toLowerCase() === address.toLowerCase()
    );
    if (!tokenToBuy) {
      alert("Token not found in your token list");
      return;
    }

    // Open modal and start fetching
    setSwapModal({
      isOpen: true,
      stage: "fetching",
      quote: null,
      countdown: 10,
      tokenSymbol: symbol,
    });

    const outputDecimals = tokenToBuy.decimals || 18;
    setOutputDec(outputDecimals);
    const amountInWei = parseUnits(buyAmount.toString(), 18);

    const quoteBody = {
      tokenA: NATIVE_0G_TOKEN.address,
      tokenB: tokenToBuy.address,
      amountIn: amountInWei.toString(),
      dexId: "ALL",
    };

    try {
      const res = await fetch(`${MAINNET_API_URL}/quote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quoteBody),
      });

      if (!res.ok) {
        throw new Error(`0G Quote API failed with status ${res.status}`);
      }

      const quote: SwapQuoteResponse = await res.json();
      const routePlan = quote.routePlan;

      if (!routePlan || routePlan.length === 0) {
        setSwapModal((prev) => ({
          ...prev,
          stage: "error",
          error: "No route plan available for this swap",
        }));
        return;
      }

      // Move to countdown stage
      setSwapModal((prev) => ({
        ...prev,
        stage: "countdown",
        quote: quote,
        countdown: 10,
      }));
    } catch (error: any) {
      console.error("Error fetching quote:", error);
      setSwapModal((prev) => ({
        ...prev,
        stage: "error",
        error: "Error fetching quote. Please try again.",
      }));
    }
  };

  return (
    <div className="min-h-screen">
      <div className="flex justify-between">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-white">0G Token Tracker</h1>
        </div>

        <div className="md:flex-row flex-col items-center justify-between px-6 mb-4">
          <div className="flex gap-2 p-2 bg-[#0b0b0b] rounded-xl w-fit">
            {(["5m", "1h", "6h", "24h"] as TimeFrame[]).map((timeFrame) => (
              <button
                key={timeFrame}
                onClick={() => setSelectedTimeFrame(timeFrame)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200
                ${
                  selectedTimeFrame === timeFrame
                    ? "bg-[#1a1a1a] text-green-600"
                    : "text-gray-400 hover:text-white hover:bg-[#111]"
                }`}
              >
                {timeFrame}
              </button>
            ))}
          </div>

          <div className="ml-2 relative">
            <input
              type="number"
              value={buyAmount}
              onChange={(e) => {
                setBuyAmount(parseFloat(e.target.value) || 0);
              }}
              className="bg-[#0b0b0b] text-gray-400 focus:outline-none text-sm rounded-lg block w-[120px] pl-14 pr-9 py-3 transition-colors"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <TokenImage
                src={"/tokens/0glogo.jpg"}
                className="object-cover size-6 block rounded-full"
                alt={"0G logo"}
                loading="lazy"
              />
            </div>
            <div className="absolute left-2 top-1/2 -translate-y-1/2">
              <span className="text-xs text-gray-400 bg-[#1a1a1a] px-2 py-2 rounded-lg">
                Buy
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Swap Processing Modal */}
      {swapModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0f0f] border border-gray-700 rounded-2xl p-6 max-w-md w-full relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            {swapModal.stage === "fetching" && (
              <div className="text-center py-8">
                <Loader2
                  className="animate-spin mx-auto mb-4 text-green-500"
                  size={48}
                />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Fetching Quote
                </h3>
                <p className="text-gray-400">
                  Please wait while we find the best rate...
                </p>
              </div>
            )}

            {swapModal.stage === "countdown" && swapModal.quote && (
              <div className="text-center py-6">
                <div className="mb-6">
                  <div className="relative inline-block">
                    <svg className="transform -rotate-90 w-28 h-28">
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-700"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={2 * Math.PI * 48}
                        strokeDashoffset={
                          2 * Math.PI * 48 * (1 - swapModal.countdown / 10)
                        }
                        className="text-green-500 transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">
                        {swapModal.countdown}
                      </span>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-white mb-3">
                  Review Your Swap
                </h3>

                <div className="bg-[#1a1a1a] rounded-lg p-3 mb-3 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">You're buying</span>
                    <span className="text-white font-semibold">
                      {swapModal.tokenSymbol}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Amount</span>
                    <span className="text-white font-semibold">
                      {buyAmount} 0G
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Estimated output</span>
                    <span className="text-white font-semibold">
                      {formatUnits(swapModal.quote.amountOut, outputDec ?? 18)}{" "}
                      {swapModal.tokenSymbol}
                    </span>
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-3">
                  Transaction will execute in {swapModal.countdown} seconds
                </p>
                <button
                  onClick={executeSwap}
                  className="w-full py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 rounded-lg font-semibold transition-all mb-3"
                >
                  Execute Now
                </button>
                <button
                  onClick={closeModal}
                  className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-lg font-semibold transition-all"
                >
                  Cancel Swap
                </button>
              </div>
            )}

            {swapModal.stage === "processing" && (
              <div className="text-center py-8">
                <Loader2
                  className="animate-spin mx-auto mb-4 text-green-500"
                  size={48}
                />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Processing Swap
                </h3>
                <p className="text-gray-400">
                  Please confirm the transaction in your wallet...
                </p>
              </div>
            )}

            {swapModal.stage === "success" && (
              <div className="text-center py-8">
                <div className="mx-auto mb-4 w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Check className="text-green-500" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Swap Successful!
                </h3>
                <p className="text-gray-400">
                  Your transaction has been completed.
                </p>
              </div>
            )}

            {swapModal.stage === "error" && (
              <div className="text-center py-8">
                <div className="mx-auto mb-4 w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                  <X className="text-red-500" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Swap Failed
                </h3>
                <p className="text-gray-400 mb-4">
                  {swapModal.error || "An error occurred"}
                </p>
                <button
                  onClick={closeModal}
                  className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="px-6 pb-6">
        <div className="bg-gray-800/10 border border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white bg-transparent">
              <thead className="text-gray-400 text-xs">
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-4 font-medium">Token</th>
                  <th className="px-4 py-4 font-medium">Price</th>
                  <th className="px-4 py-4 font-medium">MC/FDV</th>
                  <th className="px-4 py-4 font-medium">
                    {selectedTimeFrame} Volume
                  </th>
                  <th className="px-4 py-4 font-medium">Liquidity</th>
                  <th className="px-4 py-4 font-medium">Buy</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5)
                    .fill("")
                    .map((_, i) => (
                      <tr key={i} className="border-b border-gray-800">
                        {Array(6)
                          .fill("")
                          .map((_, j) => (
                            <td key={j} className="px-4 py-4">
                              <div className="h-4 w-20 rounded bg-gray-700 animate-pulse" />
                            </td>
                          ))}
                      </tr>
                    ))
                ) : screenerData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      No data available
                    </td>
                  </tr>
                ) : (
                  screenerData.map((item, i) => {
                    const stats = getStatsForTimeFrame(item);

                    return (
                      <tr
                        key={i}
                        className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors cursor-pointer"
                        onClick={() => {
                          router.push(`/token-screener/${item.address}`);
                        }}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <TokenImage
                              src={item.icon || "/tokens/base.png"}
                              className="object-cover size-10 block rounded-full"
                              alt={item.symbol}
                              loading="lazy"
                            />
                            <div>
                              <div className="font-semibold text-white">
                                {item.symbol}
                              </div>
                              <div className="text-xs text-gray-400 flex items-center gap-1">
                                <span>
                                  {splitStringInMiddle(item.address, 5)}{" "}
                                </span>
                                {copied && copyId === i ? (
                                  <Check width={10} color="green" />
                                ) : (
                                  <Copy
                                    width={10}
                                    onClick={() => handleCopy(item.address, i)}
                                    className="cursor-pointer"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-medium">
                            $
                            <span
                              dangerouslySetInnerHTML={{
                                __html: formatSmallNumber(item.price),
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-medium">
                            ${formatNumber(item.marketCap)}
                          </div>
                          <div className="text-xs text-gray-400">
                            ${formatNumber(item.fullyDilutedValuation)}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-medium">
                            ${formatNumber(stats)}
                          </div>
                        </td>
                        <td className="px-4 py-4 font-medium">
                          {formatNumber(item.liquidity)}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            className="px-2 py-1 bg-green-500/20 hover:bg-green-500/40 border border-green-500/30 rounded-2xl transition-all hover:scale-105"
                            onClick={() => buyToken(item.address, item.symbol)}
                          >
                            <span className="text-green-400 text-base">⚡</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoListingDashboard;
