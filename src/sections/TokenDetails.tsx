"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "@/context/user-wallet-provider";
import { Card } from "@/components/ui/card";
import { ArrowDownUp, TrendingUp, Activity, Droplets } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import TokenCard from "@/components/general/TokenCard";
import SwapForm from "./ScreenerSwapForm";

interface Pool {
  poolAddress: string;
  token0: string;
  token1: string;
  fee: number;
  liquidity: string;
  sqrtPriceX96: string;
  dexName: string;
  chainId: string;
  blockNumber: string;
  lastUpdated: number;
}

interface TokenData {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: string;
  dexes: string[];
  lastUpdated: number;
  price: number;
  liquidity: number;
  totalSupply: string;
  circulatingSupply: string;
  marketCap: number;
  fullyDilutedValuation: number;
  volume24h: number;
  volume6h: number;
  volume1h: number;
  volume5m: number;
  txns24h: number;
  buys24h: number;
  sells24h: number;
  chartDataAvailable: boolean;
  pools: Pool[];
  poolCount: number;
}

interface PricePoint {
  timestamp: number;
  price: number;
  volume: number;
  liquidity: number;
}

interface ChartData {
  prices: PricePoint[];
  volumes: PricePoint[];
  interval: string;
}

const TokenDetails = ({ token }: { token: string }) => {
  const { screenerData } = useWallet();
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenDetails, setTokenDetails] = useState<TokenData | null>(null);
  const [chartInfo, setChartInfo] = useState<ChartData | null>(null);
  const [swapAmount, setSwapAmount] = useState("");

  const fetchTokenInfo = async () => {
    setTokenLoading(true);
    try {
      const tokenInfo = await fetch(
        `https://screener.deserialize.xyz/tokens/${token}`
      );
      const chartInfo = await fetch(
        `https://screener.deserialize.xyz/tokens/${token}/chart`
      );

      const tokenResponse = await tokenInfo.json();
      const chartResponse = await chartInfo.json();

      setTokenDetails(tokenResponse.data);
      setChartInfo(chartResponse.data);
    } catch (error) {
      console.error("Error fetching token data:", error);
    } finally {
      setTokenLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTokenInfo();
    }
  }, [token]);

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatChartData = () => {
    if (!chartInfo) return [];
    return chartInfo.prices
      .filter((point) => point.price > 0)
      .map((point) => ({
        time: new Date(point.timestamp).toLocaleTimeString(),
        price: point.price,
        volume: point.volume,
      }));
  };

  if (tokenLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-transparent">
        <div className="text-xl text-white">Loading token data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          {/* Header */}
          <div className="mb-6">
            {tokenDetails && (
              <div>
                <h1 className="text-4xl font-bold text-white">
                  {tokenDetails.name} ({tokenDetails.symbol})
                </h1>
                <p className="text-gray-400 text-sm mt-2 font-mono break-all">
                  {tokenDetails.address}
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <span className="text-3xl font-bold text-white">
                    ${tokenDetails.price.toFixed(6)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="w-full">
            {tokenDetails && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6 p-4 w-full mx-auto sm:p-4 md:p-6 rounded-xl bg-[#0B2E0466] border-[0.2px] border-[#6D9765] relative overflow-hidden">
                <div className="absolute z-[-1] top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#00FF66] to-transparent rounded-full blur-3xl pointer-events-none" />

                <div>
                  <div className="text-sm text-gray-400 flex items-center gap-1 mb-1">
                    <TrendingUp className="w-3 h-3" />
                    Market Cap
                  </div>
                  <div className="font-semibold text-white text-lg">
                    {formatNumber(tokenDetails.marketCap)}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 flex items-center gap-1 mb-1">
                    <Droplets className="w-3 h-3" />
                    Liquidity
                  </div>
                  <div className="font-semibold text-white text-lg">
                    {formatNumber(tokenDetails.liquidity)}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 flex items-center gap-1 mb-1">
                    <Activity className="w-3 h-3" />
                    Volume 24h
                  </div>
                  <div className="font-semibold text-white text-lg">
                    {formatNumber(tokenDetails.volume24h)}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-1">Txns 24h</div>
                  <div className="font-semibold text-white text-lg">
                    {tokenDetails.txns24h.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-1">Buys 24h</div>
                  <div className="font-semibold text-green-400 text-lg">
                    {tokenDetails.buys24h.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-1">Sells 24h</div>
                  <div className="font-semibold text-red-400 text-lg">
                    {tokenDetails.sells24h.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-1">Volume 6h</div>
                  <div className="font-semibold text-white text-lg">
                    {formatNumber(tokenDetails.volume6h)}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-1">Volume 1h</div>
                  <div className="font-semibold text-white text-lg">
                    {formatNumber(tokenDetails.volume1h)}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-1">Pool Count</div>
                  <div className="font-semibold text-white text-lg">
                    {tokenDetails.poolCount}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-1">DEXes</div>
                  <div className="font-semibold text-white text-lg">
                    {tokenDetails.dexes.join(", ")}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/3">
            <SwapForm tokenAddress={token} />
          </div>

          <div className="lg:w-2/3">
            <div className="p-6 w-full mx-auto sm:p-4 md:p-6 rounded-xl bg-[#0B2E0466] border-[0.2px] border-[#6D9765] relative overflow-hidden">
              <div className="absolute z-[-1] top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#00FF66] to-transparent rounded-full blur-3xl pointer-events-none" />

              <h2 className="text-xl font-bold mb-4 text-white">Price Chart</h2>
              {chartInfo ? (
                <ResponsiveContainer width="100%" height={530}>
                  <LineChart data={formatChartData()}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#6D9765"
                      strokeOpacity={0.2}
                    />
                    <XAxis
                      dataKey="time"
                      stroke="#6D9765"
                      tick={{ fill: "#9ca3af" }}
                    />
                    <YAxis stroke="#6D9765" tick={{ fill: "#9ca3af" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(11, 46, 4, 0.9)",
                        border: "1px solid #6D9765",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke=" #6D9765"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-40 text-gray-400">
                  No chart data available
                </div>
              )}

              {/* Price Info below chart - RESTYLED */}
              <div className="mt-6 p-4 bg-[#1a2a1a] rounded-lg border border-[#6D9765]">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-400">Price</div>
                    <div className="text-xl font-bold text-white">
                      ${tokenDetails?.price.toFixed(6) || "0.00"}
                    </div>
                  </div>
                  {/* You can add back the 24h change here if you have the data */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenDetails;
