import React, { useState, useEffect, useMemo } from "react";
import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TokenAsset, SwapQuoteResponse } from "@/types/swapform";
import { Canvas, Node, NodeData, EdgeData } from "reaflow";

interface SwapImpactProps {
  rawQuote: SwapQuoteResponse;
  sellToken: TokenAsset;
  buyToken: TokenAsset;
  loading: boolean;
  slippage: number;
  usdSell: number;
  usdBuy: number;
  sellAmount: number;
  buyAmount: number;
  tokenList: TokenAsset[];
}

const SwapImpact: React.FC<SwapImpactProps> = ({
  rawQuote,
  sellToken,
  buyToken,
  loading,
  slippage,
  usdBuy,
  usdSell,
  sellAmount,
  buyAmount,
  tokenList,
}) => {
  const [impact, setImpact] = useState<number>(0); // default 0
  const [pnl, setPnl] = useState<number>(0);

  const [openModal, setOpenModal] = useState(false);
  const handleModal = () => {
    setOpenModal(true);
  };

  const feeRate = rawQuote.routePlan?.[0]?.fee
    ? rawQuote.routePlan[0].fee / 100
    : 0;

  const pairRate = Number(rawQuote.tokenPrice);

  const amountInUsd = sellAmount * usdSell;
  const amountOutUsd = buyAmount * usdBuy;

  const swapRoutes = rawQuote.routePlan?.map((r) => ({
    tokenA: r.tokenA,
    tokenB: r.tokenB,
    dexId: r.dexId,
  }));

  useEffect(() => {
    const imp = ((amountOutUsd - amountInUsd) / amountInUsd) * 100;
    console.log(imp, "imp");

    const pnL = amountOutUsd - amountInUsd;
    setImpact(imp);
    setPnl(pnL);
  }, [amountInUsd, amountOutUsd]);

  const getImpactColor = () => {
    if (impact > 0) return "text-white";
    if (impact < -5) return "text-red-500";
    if (impact < -2) return "text-orange-500";
    if (impact < -1) return "text-yellow-500";
    return "text-gray-300";
  };

  const formatImpact = () => {
    const formattedValue = impact.toFixed(2);
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

  const getTokenInfo = (identifier: string) => {
    return tokenList?.find(
      (t) => t.address === identifier || t.symbol === identifier
    );
  };

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
      {/* {impact < -10 && (
        <div className="mt-3 p-2 bg-red-500/10 rounded border border-red-500/20 text-xs">
          <p className=" text-red-500">
            High price impact! This swap will significantly affect your Output
          </p>
        </div>
      )} */}

      <div className="p-3 space-y-2 md:space-y-4 text-xs sm:text-sm">
        <div className="flex justify-between items-center mb-2">
          <span className=" text-zinc-200 mr-1">
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
          </span>
        </div>

        {/* <div className="flex justify-between items-center mb-2">
          <span className=" text-zinc-200 mr-1">Fee</span>
          <span className=" font-normal text-[#CCCCCC]">{formatFeeRate()}</span>
        </div> */}

        <div className="flex justify-between items-center mb-2">
          <span className=" text-zinc-200 mr-1">Slippage</span>
          <span className=" font-normal text-[#CCCCCC]">{slippage}%</span>
        </div>

        {/* <div className="flex justify-between items-center mb-2">
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
              JAINE
            </span>

            {swapRoutes && swapRoutes.length > 0 && (
              <span className="text-xs text-zinc-400 bg-zinc-800/30 px-2 py-1 rounded-full">
                {swapRoutes.map((r) => r.dexId).join(" → ")}
              </span>
            )}
          </div>
        </div> */}

        <div className="flex justify-between items-center mb-2">
          <span className=" text-zinc-200 mr-1">Price Impact</span>
          <span className={` font-medium `}>{formatImpact()}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[#FFF] block mb-2">Swap Route</span>

          <button
            className="px-4 py-2 rounded-md bg-zinc-700/30 text-white text-xs font-medium"
            onClick={handleModal}
          >
            {`${swapRoutes.length} Pool${swapRoutes.length > 1 ? "s" : ""} •  ${
              new Set(swapRoutes.map((routes) => routes.dexId)).size
            } DEX${
              new Set(swapRoutes.map((routes) => routes.dexId)).size > 1
                ? "es"
                : ""
            }`}
          </button>
        </div>
        <div className="flex justify-between items-center">
          <div className="w-full">
            {(() => {
              const nodesMap = new Map<string, NodeData>();
              const edges: EdgeData[] = [];

              const input = swapRoutes[0];
              const output = swapRoutes.at(-1);

              const inputToken = getTokenInfo(input?.tokenA) as
                | TokenAsset
                | undefined;
              const outputToken = getTokenInfo(output?.tokenB ?? "") as
                | TokenAsset
                | undefined;

              // Add the input token node
              const inputTokenId = `token-${input?.tokenA}`;
              nodesMap.set(inputTokenId, {
                id: inputTokenId,
                text: inputToken?.symbol || "",
              });

              let previousNodeId = inputTokenId;

              swapRoutes.forEach((routes, index) => {
                const tokenA = getTokenInfo(routes.tokenA) as
                  | TokenAsset
                  | undefined;
                const tokenB = getTokenInfo(routes.tokenB) as
                  | TokenAsset
                  | undefined;
                const hopNodeId = `hop-${index}`;

                // Add a node with descriptive text like "ETH → USDC via Orca"
                nodesMap.set(hopNodeId, {
                  id: hopNodeId,
                  text: `${tokenA?.symbol} → ${tokenB?.symbol} (${
                    routes.dexId === "ZERO_G" ? "JAINE" : routes.dexId
                  })`,
                  width: 330,
                });

                // Connect previous node to this hop node
                edges.push({
                  id: `${previousNodeId}-${hopNodeId}`,
                  from: previousNodeId,
                  to: hopNodeId,
                });

                previousNodeId = hopNodeId;
              });

              // Finally, add the output token node
              const outputTokenId = `token-${output?.tokenB}`;
              nodesMap.set(outputTokenId, {
                id: outputTokenId,
                text: outputToken?.symbol || "",
              });

              // Connect last hop to output token
              edges.push({
                id: `${previousNodeId}-${outputTokenId}`,
                from: previousNodeId,
                to: outputTokenId,
              });

              const nodes = Array.from(nodesMap.values());
              if (!openModal) return null;
              return (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
                  <div
                    className={`bg-zinc-900 rounded-lg shadow-lg p-6 max-w-sm overflow-x-hidden w-[90%] relative h-[90vh] overflow-y-hidden`}
                  >
                    <button
                      onClick={() => setOpenModal(false)}
                      className="text-red-600 z-50 text-sm absolute top-5 right-5"
                    >
                      <X />
                    </button>
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-bold text-white">
                        Swap Route
                      </h2>
                    </div>
                    <div className="scale-[0.7] absolute left-1/2 transform -translate-x-1/2">
                      <div className="flex justify-center items-start -translate-y-[210px]">
                        <Canvas
                          maxWidth={400}
                          maxHeight={800}
                          direction={"DOWN"}
                          layoutOptions={{}}
                          nodes={nodes}
                          edges={edges}
                          node={<Node />}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
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
