import React, { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TokenAsset, DexIdTypes, SwapQuoteResponse } from "@/types/swapform";
import { IQuoteReturn } from "deserialize-evm-client-sdk";

interface SwapImpactProps {
  rawQuote: IQuoteReturn;
  sellToken: TokenAsset;
  buyToken: TokenAsset;
  loading: boolean;
}

const SwapImpact: React.FC<SwapImpactProps> = ({
  rawQuote,
  sellToken,
  buyToken,
  loading,
}) => {
  const [impact, setImpact] = useState<number>(0); // default 0
  const [pnl, setPnl] = useState<number>(0);

  // derive values from raw quote
  const feeRate = rawQuote.path?.[0]?.fee ? rawQuote.path[0].fee / 100 : 0;

  const pairRate = Number(rawQuote.price);

  const swapRoutes = rawQuote.path?.map((r) => ({
    tokenA: r.tokenA,
    tokenB: r.tokenB,
    dexId: r.dexId,
  }));

  const amountUSD = (Number(rawQuote.amountIn) / 1e18) * Number(rawQuote.price);

  useEffect(() => {
    // If you want to calculate arbitrage pnl/impact vs other routes, do it here
    setImpact(0);
    setPnl(0);
  }, [rawQuote]);

  const getImpactColor = () => {
    if (impact > 0) return "text-white";
    if (impact < -5) return "text-red-500";
    if (impact < -2) return "text-orange-500";
    if (impact < -1) return "text-yellow-500";
    return "text-white-500";
  };

  const formatImpact = () => {
    const formattedValue = Math.abs(impact).toFixed(2);
    if (swapRoutes) {
      return `${impact >= 0 ? "0% (Fully Optimized)" : `${formattedValue}%`}`;
    }
    return null;
  };

  const formatFeeRate = () => `${feeRate.toFixed(2)}%`;

  const formatPairRate = () =>
    pairRate.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });

  if (loading) {
    return (
      <div className="mx-auto max-w-[32rem] w-full p-6  flex items-center justify-center py-3 mt-4 rounded-lg bg-[#162B24] border border-[#2E543F]">
        <Loader2 className="animate-spin size-4 mr-2" color="white" />
        <span className="text-sm text-zinc-500">
          Calculating swap details...
        </span>
      </div>
    );
  }

  if (!impact && feeRate === 0 && !pairRate && !swapRoutes?.length) return null;

  return (
    <div
      className="mx-auto max-w-[32rem] w-full p-2  flex flex-col mt-4 rounded-lg bg-[#10170E] border border-[#2E543F] overflow-hidden"
      style={{
        boxShadow:
          "0 0 12px rgba(112, 205, 135, 0.5), 0 0 10px rgba(112, 205, 135, 0.25)",
      }}
    >
      {impact < -10 && (
        <div className="mt-3 p-2 bg-red-500/10 rounded border border-red-500/20">
          <p className=" text-red-500">
            High price impact! This swap will significantly affect your Output
          </p>
        </div>
      )}

      <div className="p-3 space-y-2 md:space-y-4 text-[9px] sm:text-xs">
        <div className="flex justify-between items-center mb-2">
          {/* <span className=" text-zinc-200 mr-1">
            Swap Profit{" "}
            <span className="text-[#737373] opacity-50">(Arbitrage)</span>
          </span>
          <span
            className={cn(
              " font-normal",
              Number(impact.toFixed(3)) > 0
                ? "text-[#A1FEA0]"
                : "text-[#CCCCCC]"
            )}
          >
            {Number(impact.toFixed(3)) > 0
              ? `$${pnl.toFixed(4)} (${impact.toFixed(3)}%)`
              : `0%`}
          </span> */}
        </div>

        <div className="flex justify-between items-center mb-2">
          <span className=" text-zinc-200 mr-1">Fee</span>
          <span className=" font-normal text-[#CCCCCC]">{formatFeeRate()}</span>
        </div>

        <div className="flex justify-between items-center mb-2">
          <span className=" text-zinc-200 mr-1">Slippage</span>
          <span className=" font-normal text-[#CCCCCC]">Auto {` ( 1% ) `}</span>
        </div>

        <div className="flex justify-between items-center mb-2">
          <span className="text-zinc-200 mr-1">Swap Route</span>
          <div className="flex items-center gap-1 font-normal">
            <div className="flex items-center gap-1 px-2 py-1 bg-zinc-800/50 rounded-full text-xs">
              <span className="text-[#A1FEA0] font-medium">
                {sellToken.symbol}
              </span>
              <span className="text-zinc-400">→</span>
              <span className="text-[#A1FEA0] font-medium">
                {buyToken.symbol}
              </span>
            </div>
            <span className="text-zinc-200 mr-1">via</span>

            <span className="text-xs text-zinc-400 bg-zinc-800/30 px-2 py-1 rounded-full">
              ZERO_G
            </span>

            {/* {swapRoutes && swapRoutes.length > 0 && (
              <span className="text-xs text-zinc-400 bg-zinc-800/30 px-2 py-1 rounded-full">
                {swapRoutes.map((r) => r.dexId).join(" → ")}
              </span>
            )} */}
          </div>
        </div>

        <div className="flex justify-between items-center mb-2">
          {/* <span className=" text-zinc-200 mr-1">Price Impact</span>
          <span className={` font-medium ${getImpactColor()}`}>
            {formatImpact()}
          </span> */}
        </div>

        <div className="text-[10px] flex items-center justify-center mb-2 gap-1">
          <span className="text-zinc-200">Rate:</span>{" "}
          <span className="font-normal" style={{ color: "#CCCCCC" }}>
            1 {sellToken.symbol} ≈ {formatPairRate()} {buyToken.symbol}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SwapImpact;
