"use client";

import TokenCard from "@/components/general/TokenCard";
import { Button } from "@/components/ui/button";
import { formatSmallNumber, splitStringInMiddle } from "@/lib/utils";
import { TokenAsset } from "@/types/swapform";
import { Check, Copy } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { NATIVE_0G_TOKEN } from "@/lib/constant";

// Lazy-load the candlestick chart modal to reduce initial bundle size
const CandleChart = dynamic(() => import("@/components/general/Charts"), {
  ssr: false,
});

type IAProps = {
  buy: TokenAsset;
  sell: TokenAsset;
  sellDollarValue: number;
  buyDollarValue: number;
};

const SelectedTokens = ({
  buy,
  sell,
  sellDollarValue,
  buyDollarValue,
}: IAProps) => {
  const [showTooltip, setShowTooltip] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip("");
    }, 5000);
    return () => clearTimeout(timer);
  }, [showTooltip]);

  const copyLink = (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      setShowTooltip(text);
    }
  };

  const shouldShowSellAddress = sell.address !== NATIVE_0G_TOKEN.address;
  const shouldShowBuyAddress = buy.address !== NATIVE_0G_TOKEN.address;

  return (
    <div className="mt-6 space-y-2">
      {/* Sell Token */}
      <TokenCard className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={sell.logo || "/tokens/base.png"}
            alt={sell.symbol}
            className="object-cover size-10 block rounded-full"
            sizes="(max-width: 768px) 2.5rem, 2.5rem"
          />
          <div>
            <div className="flex items-center gap-2 text-[#cccccc]">
              <h5 className="uppercase font-medium">{sell.symbol}</h5>
              <p className="opacity-70 text-sm font-medium font-mono">
                $
                <span
                  dangerouslySetInnerHTML={{
                    __html: formatSmallNumber(sellDollarValue),
                  }}
                />{" "}
              </p>
            </div>
            {shouldShowSellAddress && (
              <div className="flex gap-2 items-center mt-1">
                <Button
                  variant="secondary"
                  className="py-1 px-2 h-fit rounded-md text-xs"
                  onClick={() => copyLink(sell.address)}
                >
                  <span>{splitStringInMiddle(sell.address)}</span>
                  {showTooltip === sell.address ? (
                    <Check className="!size-4 text-green-500" />
                  ) : (
                    <Copy className="!size-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </TokenCard>

      {/* Buy Token */}
      <TokenCard className="flex items-center justify-between gap-4">
        {/* Left side with logo and details */}
        <div className="flex items-center gap-4">
          <img
            src={buy.logo || "/tokens/base.png"}
            alt={buy.symbol}
            className="object-cover size-10 block rounded-full"
            sizes="(max-width: 768px) 2.5rem, 2.5rem"
          />

          <div>
            <div className="flex items-center gap-3 text-[#cccccc]">
              <h5 className="uppercase font-medium">{buy.symbol}</h5>
              <p className="opacity-80 text-sm font-medium font-mono text-green-500">
                $
                <span
                  dangerouslySetInnerHTML={{
                    __html: formatSmallNumber(buyDollarValue),
                  }}
                />{" "}
              </p>
            </div>
            {shouldShowBuyAddress && (
              <div className="flex gap-2 items-center mt-1">
                <Button
                  variant="secondary"
                  className="py-1 px-2 h-fit rounded-md text-xs"
                  onClick={() => copyLink(buy.address)}
                >
                  <span>{splitStringInMiddle(buy.address)}</span>
                  {showTooltip === buy.address ? (
                    <Check className="!size-4 text-green-500" />
                  ) : (
                    <Copy className="!size-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </TokenCard>
    </div>
  );
};

export default React.memo(SelectedTokens);
