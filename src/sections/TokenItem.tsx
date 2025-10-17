import React, { useState } from "react";
import TokenImage from "@/components/general/TokenImage";
import { splitStringInMiddle } from "@/lib/utils";
import { TokenAsset } from "@/types/swapform";
import { formatSmallNumber } from "@/lib/utils";
import { Plus, PlusSquare } from "lucide-react";
import { useWalletClient } from "wagmi";

interface TokenItemProps {
  asset: TokenAsset;
  itemSelector: (asset: TokenAsset) => void;
  mixpanel: {
    track: (event: string) => void;
  };
  addToWallet?: (asset: TokenAsset) => void;
}

const TokenItem: React.FC<TokenItemProps> = ({
  asset,
  itemSelector,
  mixpanel,
}) => {
  const { data: walletClient } = useWalletClient();
  const addTokenToWallet = async () => {
    if (!window.ethereum) {
      alert("Wallet not detected");
      return;
    }

    try {
      const wasAdded = await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: asset.address,
            symbol: asset.symbol,
            decimals: asset.decimals ?? 18,
            image: asset.logo,
          },
        },
      });

      if (wasAdded) {
        console.log("Token added");
      } else {
        console.log("Token not added");
      }
    } catch (error) {
      console.error("Error adding token:", error);
    }
  };

  const addToken = async () => {
    if (!walletClient) return;

    try {
      await walletClient.watchAsset({
        type: "ERC20",
        options: {
          address: asset.address,
          symbol: asset.symbol,
          decimals: asset.decimals ?? 18,
          image: asset.logo,
        },
      });
      console.log("Token added successfully");
    } catch (error) {
      console.error("Error adding token:", error);
    }
  };
  return (
    <div
      key={asset.address}
      className="token-item"
      onClick={() => {
        mixpanel.track(`${asset.symbol} selected`);
        itemSelector(asset);
      }}
    >
      <div className="token-info">
        <TokenImage
          src={asset.logo || "/tokens/OG.png"}
          alt={asset.symbol}
          loading="lazy"
        />

        <div className="flex justify-between items-center w-full">
          <div className="flex flex-col">
            <span className="text-base font-semibold text-white flex gap-1">
              {asset.symbol}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  addToken();
                }}
              >
                <PlusSquare color="green" width={15} />
              </span>
            </span>
            <span className="text-sm text-gray-400">
              {splitStringInMiddle(asset.address, 5)}
            </span>
          </div>
          <div className="flex flex-col text-end">
            <span className="text-sm text-gray-300">
              <span
                className={"text-sm text-gray-300"}
                dangerouslySetInnerHTML={{
                  __html: formatSmallNumber(Number(asset.balance)),
                }}
              />{" "}
              {asset.symbol}
            </span>
            <span className="text-xs text-gray-300">
              $
              <span
                dangerouslySetInnerHTML={{
                  __html: formatSmallNumber(
                    Number(asset.balance) * Number(asset.usdValue)
                  ),
                }}
              />{" "}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenItem;
