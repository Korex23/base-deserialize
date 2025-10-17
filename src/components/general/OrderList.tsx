import { useMemo, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SkeletonCard from "@/components/general/LimitOrdersSkeleton";
import { Order } from "@/context/limit-order-provider";
import TokenCard from "./TokenCard";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { cn, splitStringInMiddle } from "@/lib/utils";
import { TokenAsset } from "@/types/swapform";

interface Props {
  title: string;
  activeTab: "created" | "completed";
  setActiveTab: (tab: "created" | "completed") => void;
  loading: {
    fetchingOrders: boolean;
    initiatingOrder: boolean;
    creatingOrder: boolean;
    initiatingCancel: boolean;
    cancellingOrder: boolean;
    cancellingAllToken: boolean;
    initCancellingAllToken: boolean;
  };
  orders: Order[];
  statusClassMap: Record<string, string>;
  getTokenInfo: (
    token: string
  ) => { symbol: string; logo?: string } | undefined;
  fetchOrders: () => void;
  handleInitCancel: (orderId: string) => void;
  handleInitCancelOrderOfASpecificToken: (token: string) => void;
  cancellingOrderId: string;
  publicKey: string;
  textClass: string;
  tokenList: TokenAsset[];
}

export const dummyOrders: Order[] = [
  {
    id: "ord_1",
    tokenA: "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c", // W0G
    tokenB: "0x1f3aa82227281ca364bfb3d253b0f1af1da6473e", // USDC.e
    price: 0.095,
    amount: 500,
    amountOut: 47.5,
    status: "created",
    expiry: new Date(Date.now() + 86400000 * 3),
    depositSignature:
      "0xabc5f79d2bff1b42cf96a9e8e1c7f18a6d927b3e4b15c1f64a7b2a1d9f6c1b73",
    executionSignature: "",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    refundTrxSignature: null,
  },
  {
    id: "ord_2",
    tokenA: "0x9cc1d782e6dfe5936204c3295cb430e641dcf300", // WETH
    tokenB: "0x1f3aa82227281ca364bfb3d253b0f1af1da6473e", // USDC.e
    price: 2385.42,
    amount: 0.8,
    amountOut: 1908.34,
    status: "pending",
    expiry: new Date(Date.now() + 86400000 * 7),
    depositSignature:
      "0x5b3f6a9e1d8c7e2b4a6d1f9e3c2b7a8d5e6f9b4a2c3d7f6e9b1c8d2e7a3f6c9b",
    executionSignature: "",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    refundTrxSignature: null,
  },
  {
    id: "ord_3",
    tokenA: "0x2c81a9883f9570266ab734a9671412e72e7a615d", // 0GPANDA
    tokenB: "0xf8b1856952c0d276c9ab774bf54940b58349e528", // 0gCat
    price: 0.0012,
    amount: 100000,
    amountOut: 120,
    status: "completed",
    expiry: new Date(Date.now() - 86400000 * 2),
    depositSignature:
      "0x7e4c3b8a9f2d6a1b4e5f7c9d3a8e2b6f9c4d7e1a5b3c8f9d2a7e6b1f9c2d3e4f",
    executionSignature:
      "0x9d2f3a7b6c1e4d5a8b9c3f7e2a5b1d9f6c8e7a3b4f2d5e9c1a7b8f3d6c9e2a4b",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    refundTrxSignature: null,
  },
  {
    id: "ord_4",
    tokenA: "0x48429b5dd3624a2d954cf9b7bb27a442f30dd8a4", // 0gDoge
    tokenB: "0x9cc1d782e6dfe5936204c3295cb430e641dcf300", // WETH
    price: 0.000000045,
    amount: 20000000,
    amountOut: 0.9,
    status: "refunded",
    expiry: new Date(Date.now() - 86400000 * 4),
    depositSignature:
      "0x1b3f5a7e8d2c9b6f4a1e3c5d7f9a2b8e4c7d9f6a3e1b5c2d7f8a9b4c3d6e7f1a",
    executionSignature: "",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    refundTrxSignature:
      "0xa2b6e7f1c4d3a9b8e5f7c2d1b4f9a6e8d3c5b2a7f1e4c9d6a8b3f7e2d9c1a4b5",
  },
  {
    id: "ord_5",
    tokenA: "0xd48f6363b9854d7e847aae3288aa422f7ef82d67", // 0DOG
    tokenB: "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c", // W0G
    price: 0.003,
    amount: 150000,
    amountOut: 450,
    status: "completed",
    expiry: new Date(Date.now() - 86400000 * 1),
    depositSignature:
      "0xc5e8d9b3a7f6c4d2e1b9a5f3c7d8e4b2f6a1c9d3e7f2b4a8c9e6d1b7a3f5e8c2",
    executionSignature:
      "0x6d1b9a3f5e8c2c5e8d9b3a7f6c4d2e1b9a5f3c7d8e4b2f6a1c9d3e7f2b4a8c9e6",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    refundTrxSignature: null,
  },
  {
    id: "ord_6",
    tokenA: "0x14e351a40b757c6255e11e7fcadb9cbb34e6e30a", // ARISTOTLE
    tokenB: "0x31f301b3478b4dfa44d106b3caf9bc065d86fd87", // BITGO
    price: 1.82,
    amount: 320,
    amountOut: 582.4,
    status: "pending",
    expiry: new Date(Date.now() + 86400000 * 10),
    depositSignature:
      "0xe4a3f5b7d9c1a6e8b2f9d3c5a7f1e4c9b6a3d2e8c5f4b1a7d9e3f2b6a4c8e9f1",
    executionSignature: "",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    refundTrxSignature: null,
  },
  {
    id: "ord_7",
    tokenA: "0x59ef6f3943bbdfe2fb19565037ac85071223e94c", // PAI
    tokenB: "0x59f4ff75ab76378b0c9ec957e0de694a8b9b877d", // PADRE
    price: 0.07,
    amount: 10000,
    amountOut: 700,
    status: "created",
    expiry: new Date(Date.now() + 86400000 * 5),
    depositSignature:
      "0x3e9b7d2f6a1c8e4b9f5a7c3d1e6b2f9a4c8d5b3e7a2f6c9e1b8d4a5c7f9e3b1d",
    executionSignature: "",
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    refundTrxSignature: null,
  },
  {
    id: "ord_8",
    tokenA: "0x401e0fbd1e7f2c5187392a594cfd483f367b3345", // TKA
    tokenB: "0xd03243aee6e7a11c0f6108b2cdf3dbe80a05c3d5", // TKB
    price: 1.12,
    amount: 240,
    amountOut: 268.8,
    status: "completed",
    expiry: new Date(Date.now() - 86400000 * 6),
    depositSignature:
      "0x4f2e7a1c9d3b5a6f8e2c4b7d1a9e3f6b2c8d5f1a7e9c4b3d2f6a5e8b9c7d1a3f",
    executionSignature:
      "0x8b1e4f9a7d3c2b5f6a9e8d7c4b1a3f5e2c6d9b8e7f1a4c3d5b2e9f6a8c7b1d3f",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    refundTrxSignature: null,
  },
  {
    id: "ord_9",
    tokenA: "0xcb57c1cb944f8de6885ba7884434807fc58dca4b", // 0JE
    tokenB: "0xbf557f06baec49c3d3012918117c3ea249882217", // 0AGI
    price: 0.025,
    amount: 25000,
    amountOut: 625,
    status: "cancelled",
    expiry: new Date(Date.now() - 86400000 * 3),
    depositSignature:
      "0xf9d3b6a2e7c4b8d1a5e6c9f3b2a4d5e8f7c1a9b3e4d6f2a7b9c8d5e1f4a3c7b2",
    executionSignature: "",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    refundTrxSignature: null,
  },
  {
    id: "ord_10",
    tokenA: "0x98cb9e5d0c7baa31a8ab7df2f1cb9ba7981c4ba0", // SCAMMER
    tokenB: "0x76d51ba285a3dbc0108c605b06d663b9b15298e1", // OFROG
    price: 0.0034,
    amount: 50000,
    amountOut: 170,
    status: "completed",
    expiry: new Date(Date.now() - 86400000 * 8),
    depositSignature:
      "0xb3c7d2a9e4f8b1d6a5f9e3c7b4a8d2f6e1c9b7a3f5d4e2b6c8a1f3d9e7b2c5a4",
    executionSignature:
      "0xd5a1f9c8b7e4a3f6b2c9d1e5f8a7c3d4b9e2f1a6c7b4d8e3a5f9b6c2e7d1a4f8",
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    refundTrxSignature: null,
  },
];

const OrderList = ({
  title,
  activeTab,
  setActiveTab,
  loading = {
    fetchingOrders: false,
    initiatingOrder: false,
    creatingOrder: false,
    initiatingCancel: false,
    cancellingOrder: false,
    cancellingAllToken: false,
    initCancellingAllToken: false,
  },

  statusClassMap,
  getTokenInfo,
  fetchOrders,
  handleInitCancel,
  handleInitCancelOrderOfASpecificToken,
  cancellingOrderId,
  textClass,
  tokenList,
}: Props) => {
  const [selectedToken, setSelectedToken] = useState<string | undefined>(
    undefined
  );

  const orders = useMemo(() => {
    return dummyOrders;
  }, []);

  const createdOrders = useMemo(
    () =>
      orders.filter((o) =>
        ["created", "pending"].includes(o.status.toLowerCase())
      ),
    [orders]
  );

  const completedOrders = useMemo(
    () =>
      orders.filter(
        (o) => !["created", "pending"].includes(o.status.toLowerCase())
      ),
    [orders]
  );

  const filteredCreatedOrders = useMemo(
    () =>
      createdOrders.filter(
        (o) => o.tokenA === selectedToken || o.tokenB === selectedToken
      ),
    [createdOrders, selectedToken]
  );

  const visibleOrders =
    activeTab === "created"
      ? selectedToken && selectedToken !== "0"
        ? filteredCreatedOrders
        : createdOrders
      : completedOrders;

  const selectedTokenSymbol = useMemo(() => {
    const token = tokenList.find((t) => t.address === selectedToken);
    return token?.symbol;
  }, [selectedToken, tokenList]);

  return (
    <TokenCard className="h-[80.2vh] lg:h-full lg:max-h-[900px] lg:w-[500px] overflow-y-auto no-scrollbar bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl shadow-lg rounded-2xl p-5 transition-all duration-300">
      <div className="flex justify-between items-center mb-5">
        <h2
          className={cn(
            "text-3xl font-semibold text-white tracking-tight",
            textClass
          )}
        >
          {title}
        </h2>
        <Button
          onClick={fetchOrders}
          size="icon"
          className="bg-gradient-to-br from-green-700 to-green-500 hover:from-green-600 hover:to-green-400 text-white rounded-xl shadow-md transition-all duration-200"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.86528 15.3961L11.2099 13.0563L8.86431 10.7165L8.25355 11.3273L9.60072 12.6745C8.84677 12.6784 8.1766 12.5897 7.5902 12.4085C7.00379 12.2267 6.53396 11.9592 6.18069 11.6059C5.81832 11.2442 5.54558 10.8334 5.36245 10.3737C5.17932 9.91389 5.08776 9.45444 5.08776 8.99532..."
              fill="white"
            />
          </svg>
        </Button>
      </div>

      <div className="flex space-x-3 mb-5">
        <Button
          onClick={() => setActiveTab("created")}
          className={cn(
            "flex-1 py-2 rounded-full font-medium transition-all",
            activeTab === "created"
              ? "bg-green-700 text-white shadow-md"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
          )}
        >
          Active
        </Button>
        <Button
          onClick={() => setActiveTab("completed")}
          className={cn(
            "flex-1 py-2 rounded-full font-medium transition-all",
            activeTab === "completed"
              ? "bg-green-700 text-white shadow-md"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
          )}
        >
          Executed
        </Button>
      </div>

      {activeTab === "created" && (
        <div className="flex items-center gap-3 mb-5">
          <Select onValueChange={(val) => setSelectedToken(val)}>
            <SelectTrigger className="w-[200px] bg-zinc-800/70 text-white border border-green-700 rounded-full px-4 py-2 focus:ring-2 focus:ring-green-700 focus:border-green-700">
              <SelectValue placeholder="Select a token" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 text-white border border-green-700 rounded-lg">
              <SelectItem key={"0"} value={"0"}>
                All Tokens
              </SelectItem>
              {tokenList.map((token) => (
                <SelectItem key={token.address} value={token.address}>
                  {token.symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={() =>
              selectedToken &&
              handleInitCancelOrderOfASpecificToken(selectedToken)
            }
            disabled={!selectedToken || loading.initCancellingAllToken}
            variant="destructive"
            className="bg-red-600 hover:bg-red-500 text-white rounded-full text-sm px-5 py-2 shadow-sm disabled:opacity-60"
          >
            {loading.initCancellingAllToken || loading.cancellingAllToken ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              "Cancel All"
            )}
          </Button>
        </div>
      )}

      {loading.fetchingOrders ? (
        <SkeletonCard />
      ) : visibleOrders.length === 0 ? (
        <div className="text-center text-zinc-500 text-sm py-6">
          No{" "}
          {activeTab === "created"
            ? `ongoing${selectedTokenSymbol ? ` ${selectedTokenSymbol}` : ""}`
            : "executed"}{" "}
          orders found.
        </div>
      ) : (
        <ul className="grid gap-3">
          {visibleOrders.map((order) => {
            const inputToken = getTokenInfo(order.tokenA);
            const outputToken = getTokenInfo(order.tokenB);

            return (
              <li
                key={order.id}
                className="relative bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 hover:shadow-lg rounded-xl p-4 space-y-3"
              >
                {/* Top Row: Token Icons + Swap Direction + Status */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-white">
                    <img
                      src={inputToken?.logo || "/placeholder.svg"}
                      alt={inputToken?.symbol}
                      className="w-5 h-5 rounded-full"
                    />
                    <span className="font-semibold">{inputToken?.symbol}</span>
                    <span className="text-zinc-400 text-xs">→</span>
                    <img
                      src={outputToken?.logo || "/placeholder.svg"}
                      alt={outputToken?.symbol}
                      className="w-5 h-5 rounded-full"
                    />
                    <span className="font-semibold">{outputToken?.symbol}</span>
                  </div>

                  <span
                    className={`text-xs px-2 py-1 rounded-md bg-zinc-800 ${
                      statusClassMap[order.status.toUpperCase()] ||
                      "text-zinc-300"
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1).toLowerCase()}
                  </span>
                </div>

                {/* Sent and Received */}
                <div className="flex justify-between text-sm text-white mt-2">
                  <div>
                    <p className="text-zinc-400">Sent</p>
                    <p className="font-semibold">
                      {order.amount} {inputToken?.symbol}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-zinc-400">Received</p>
                    <p className="font-semibold text-green-400">
                      {order.amountOut} {outputToken?.symbol}
                    </p>
                  </div>
                </div>

                {/* Transaction Links - Improved Layout */}
                <div className="space-y-2 mt-3">
                  {order.depositSignature && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-medium">
                        Deposit Tx Hash:
                      </span>
                      <a
                        href={`https://chainscan.0g.ai/tx/${order.depositSignature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 hover:text-green-300 transition-colors font-mono bg-zinc-800/50 px-2 py-1 rounded border border-zinc-700 hover:border-green-400/30"
                      >
                        {splitStringInMiddle(order.depositSignature, 6)}
                      </a>
                    </div>
                  )}

                  {order.executionSignature && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-medium">
                        Execution Tx Hash:
                      </span>
                      <a
                        href={`https://chainscan.0g.ai/tx/${order.executionSignature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors font-mono bg-zinc-800/50 px-2 py-1 rounded border border-zinc-700 hover:border-blue-400/30"
                      >
                        {splitStringInMiddle(order.executionSignature, 6)}
                      </a>
                    </div>
                  )}

                  {order.refundTrxSignature && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-medium">
                        Refund Tx Hash:
                      </span>
                      <a
                        href={`https://chainscan.0g.ai/tx/${order.refundTrxSignature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:text-amber-300 transition-colors font-mono bg-zinc-800/50 px-2 py-1 rounded border border-zinc-700 hover:border-amber-400/30"
                      >
                        {splitStringInMiddle(order.refundTrxSignature, 6)}
                      </a>
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <p className="text-[11px] text-zinc-500 mt-2">
                  {new Date(order.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </TokenCard>
  );
};

export default OrderList;
