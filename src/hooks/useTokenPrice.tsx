"use client";
import { useEffect, useState, useCallback } from "react";
import { parseUnits } from "ethers";
import { MAINNET_API_URL } from "@/lib/constant";
import { SwapQuoteResponse } from "@/types/swapform";

export function useTokenPrice(
  tokenA: string,
  tokenB: string,
  tokenADecimals?: number
) {
  const [err, setError] = useState<string | null>(null);
  const [tokenPrice, setTokenPrice] = useState<number | null>(null);

  const fetchQuote = useCallback(async () => {
    const inputDecimal = tokenADecimals;
    // const outputDecimal = state.buy.token.decimals;
    const amountToFormat = Number(1).toFixed(5);

    // Fix: Keep as BigInt, don't convert to string yet
    const amountInRawBigInt = parseUnits(
      amountToFormat.toString(),
      inputDecimal ?? 18
    );

    const quoteBody = {
      tokenA,
      tokenB,
      dexId: "ALL_BASE",
      amountIn: amountInRawBigInt.toString(), // Convert to string here for API
    };

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

        throw new Error(`0G Quote API failed with status ${res.status}`);
      }

      const quote: SwapQuoteResponse = await res.json();

      const amountOut = quote.amountOut;

      let amountOutString = amountOut.toString();
      if (amountOutString.includes("e") || amountOutString.includes("E")) {
        amountOutString = Number(amountOut).toLocaleString("fullwide", {
          useGrouping: false,
        });
      }

      const routePlan = quote.routePlan;

      if (!routePlan || routePlan.length === 0) {
        setError("No Route Found");

        return;
      }

      const pairRate = quote.tokenPrice;
      setTokenPrice(Number(pairRate));
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch swap quote");
    }
  }, [tokenA, tokenB]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  return { tokenPrice };
}
