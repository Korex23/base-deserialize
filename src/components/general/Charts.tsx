"use client";

import { useEffect, useRef, useState } from "react";
import {
  CandlestickSeries,
  createChart,
  CrosshairMode,
} from "lightweight-charts";

const TOKENS = [
  { name: "USD Coin", symbol: "USDC", id: "usd-coin" },
  { name: "dogwifhat", symbol: "WIF", id: "wif" },
  { name: "Solana", symbol: "SOL", id: "solana" },
  { name: "Ethereum", symbol: "ETH", id: "ethereum" },
  { name: "Turbo ETH", symbol: "tETH", id: "turbo-eth" },
  { name: "Orca", symbol: "ORCA", id: "orca" },
  { name: "Tether USD", symbol: "USDT", id: "usd-coin" },
  { name: "BITZ", symbol: "BITZ", id: "bitz-2" },
  { name: "Turbo USD", symbol: "tUSD", id: "turbo-usd" },
  { name: "Staked BITZ", symbol: "sBITZ", id: "sbitz" },
];

export default function CandleChart({
  tokenName = "Solana",
  onClose,
}: {
  tokenName?: string;
  onClose?: () => void;
}) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [candles, setCandles] = useState<any[]>([]);
  const [tokenId, setTokenId] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Handle selecting token
  useEffect(() => {
    setError(null);
    setCandles([]);
    const token = TOKENS.find(
      (t) => t.name.toLowerCase() === tokenName.toLowerCase()
    );

    if (!token) {
      setError("Invalid token selected.");
      setTokenId("");
      return;
    }

    // Check for unsupported token
    if (token.id === "sbitz") {
      setError("Staked BITZ does not currently have candlestick data support.");
      setTokenId("");
      return;
    }

    setTokenId(token.id);
  }, [tokenName]);

  // Fetch OHLC data
  useEffect(() => {
    if (!tokenId) return;

    async function fetchData() {
      setError(null);
      try {
        const res = await fetch(`/api/ohlc/${tokenId}`);
        if (!res.ok) {
          throw new Error(`Server responded with ${res.status}`);
        }
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
          setError(
            "No candlestick data available yet. Please check back later."
          );
          return;
        }

        // Make sure it's sorted by time
        data.sort((a, b) => a.time - b.time);
        setCandles(data);
      } catch (err) {
        console.error("Failed to fetch candles:", err);
        setError("Failed to fetch candlestick data. Please try again later.");
      }
    }

    fetchData();
  }, [tokenId]);

  // Render chart
  useEffect(() => {
    if (!candles.length || !chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#000000",
      },
      grid: {
        vertLines: { color: "#e0e0e0" },
        horzLines: { color: "#e0e0e0" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: "#71649C",
      },
      timeScale: {
        borderColor: "#71649C",
        timeVisible: true,
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#4FFF00",
      downColor: "#FF4976",
      borderUpColor: "#4FFF00",
      borderDownColor: "#FF4976",
      wickUpColor: "#4FFF00",
      wickDownColor: "#FF4976",
    });

    candleSeries.setData(candles);

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [candles]);

  return (
    <div className="flex items-start justify-center">
      <div className="relative max-w-[32rem] w-full rounded-xl bg-zinc-900 p-6 shadow-xl border border-zinc-700">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-red-500 text-xl"
        >
          &times;
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold text-center text-white mb-6 capitalize">
          {tokenName} Price History Chart
        </h2>

        {/* Error or Chart */}
        {error ? (
          <div className="flex items-center justify-center h-[400px] text-red-400 text-center px-4">
            <p>{error}</p>
          </div>
        ) : candles.length === 0 ? (
          <div className="flex items-center justify-center h-[400px] text-white">
            <p>Loading chart data...</p>
          </div>
        ) : (
          <div
            ref={chartContainerRef}
            className="w-full h-[400px] rounded-lg overflow-hidden"
          />
        )}

        <div>
          <p className="text-sm text-zinc-400/90 mt-4 px-3 py-2 bg-zinc-800/20 rounded-lg border border-zinc-800">
            <span className="inline-block mr-1">📊</span>
            The chart displays historical price data for{" "}
            <span className="font-medium text-zinc-300">{tokenName}</span>{" "}
            starting from
            <span className="font-medium text-zinc-300"> June 5th</span>. Prices
            are updated every 30 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
