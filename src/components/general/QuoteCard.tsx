import Image from "next/image";
import { useState } from "react";
import { DexIdTypes, Token } from "@deserialize/swap-sdk";
import { Canvas, Node, NodeData, EdgeData } from "reaflow";
import { X } from "lucide-react";

export interface SwapRoute {
  tokenA: string;
  tokenB: string;
  dexId: DexIdTypes;
}

interface QuoteCardType {
  dexId: string;
  impact: string;
  points?: string | number;
  route: SwapRoute[];
  isFirst: boolean;
  image: string;
  output: string;
  getTokenInfo: (identifier: string) => void;
}

export const QuoteCard = ({
  dexId,
  impact,
  points,
  route,
  output,
  isFirst,
  image,
  getTokenInfo,
}: QuoteCardType) => {
  const [openModal, setOpenModal] = useState(false);
  const handleModal = () => {
    setOpenModal(true);
  };

  return (
    <>
      <div className="quote-card text-white space-y-1 text-[10px] sm:text-xs md:text-sm">
        <div className="flex justify-between items-center mb-3">
          <div className="flex gap-2 items-center">
            <Image src={image} alt={dexId} width={30} height={30} />
            <span className="text-[10px] sm:text-[13px] md:text-[16px] capitalize">
              {dexId}
            </span>
          </div>

          {isFirst && (
            <div className="rounded-full border border-[#3FFF3D] text-[#3FFF3D] text-[5px] sm:text-[10px] md:text-xs bg-transparent px-1.5 py-1 sm:px-3 sm:py-2">
              Highest Output
            </div>
          )}
        </div>
        <div className="flex justify-between items-center">
          <span>Output</span>
          <span>{output}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Price Impact</span>
          <span>{impact}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Swap Points</span>
          <span>{Number(points).toFixed(3)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#FFF] block mb-2">Swap Route</span>

          <button
            className="px-4 py-2 rounded-md bg-zinc-700/30 text-white text-xs font-medium"
            onClick={handleModal}
          >
            {`${route.length} Pool${route.length > 1 ? "s" : ""} •  ${
              new Set(route.map((routes) => routes.dexId)).size
            } DEX${
              new Set(route.map((routes) => routes.dexId)).size > 1 ? "es" : ""
            }`}
          </button>
        </div>
        <div className="flex justify-between items-center">
          <div className="w-full">
            {(() => {
              const nodesMap = new Map<string, NodeData>();
              const edges: EdgeData[] = [];

              const input = route[0];
              const output = route.at(-1);

              const inputToken = getTokenInfo(input?.tokenA) as
                | Token
                | undefined;
              const outputToken = getTokenInfo(output?.tokenB ?? "") as
                | Token
                | undefined;

              // Add the input token node
              const inputTokenId = `token-${input?.tokenA}`;
              nodesMap.set(inputTokenId, {
                id: inputTokenId,
                text: inputToken?.symbol || "",
              });

              let previousNodeId = inputTokenId;

              route.forEach((routes, index) => {
                const tokenA = getTokenInfo(routes.tokenA) as Token | undefined;
                const tokenB = getTokenInfo(routes.tokenB) as Token | undefined;
                const hopNodeId = `hop-${index}`;

                // Add a node with descriptive text like "ETH → USDC via Orca"
                nodesMap.set(hopNodeId, {
                  id: hopNodeId,
                  text: `${tokenA?.symbol} → ${tokenB?.symbol} (${routes.dexId})`,
                  width: 200,
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
      </div>
    </>
  );
};
