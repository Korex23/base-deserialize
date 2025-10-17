"use client";

import { TokenAsset } from "@/context/user-wallet-provider";
// import { SOLANA_CONTRACT_ADDRESS, SOLANA_IMAGE } from "@/lib/constant";
import { cn } from "@/lib/utils";
// import TokenImage from "@/components/general/TokenImage";
// import Image from "next/image";

// type IAProps = {
//   balance: number;
//   onModal?: boolean;
//   onClick?: (item: TokenType) => void;
// } & (IAPropsBase | IAPropsModal);

type IAPropsNew = {
  token: TokenAsset;
  balance: number;
  onModal?: boolean;
  onClick?: (item: TokenAsset) => void;
} & (IAPropsBase | IAPropsModal);

type IAPropsBase = {
  onModal?: false;
  onClick?: never;
};

type IAPropsModal = {
  onModal: true;
  onClick: (item: TokenAsset) => void;
};

const TokenBalance = ({
  balance,
  onModal = false,
  onClick,
  token,
}: IAPropsNew) => {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center mt-4 gap-2 py-2 px-2 rounded-md w-full ",
        onModal ? "cursor-pointer hover:bg-secondary/40" : "pointer-events-none"
      )}
      onClick={() => {
        if (onClick) onClick(token);
      }}
    >
      <div className="size-10 relative">
        {/* <img
          src={token.logoURI}
          alt={token.name}
          className="object-cover size-8 rounded-full"
          loading="lazy"
        /> */}
      </div>
      <span>{`${token.symbol}`}</span>
      <span className="font-mono ml-auto">{`${balance}`}</span>
    </button>
  );
};

export default TokenBalance;
