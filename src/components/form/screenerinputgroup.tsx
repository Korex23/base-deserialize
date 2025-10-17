"use client";
import React, {
  DetailedHTMLProps,
  ForwardedRef,
  forwardRef,
  InputHTMLAttributes,
  useState,
  useEffect,
} from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Wallet,
  //  Wallet
} from "lucide-react";
import { Montserrat_Alternates } from "next/font/google";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { InputActionButtonType } from "@/types/swapform";
import { Skeleton } from "@/components/ui/skeleton";
// import TokenModalContent from "@/sections/TokenModalContent";
// import Modal from "@/components/general/Modal";
import { CloseSVG, SearchSVG } from "../general/Icons";
import { useWallet } from "@/context/user-wallet-provider";
import TokenImage from "../general/TokenImage";
import { splitStringInMiddle } from "@/lib/utils";
import mixpanel from "mixpanel-browser";
import Image from "next/image";
import { TokenAsset } from "@/types/swapform";

interface InputProps
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  label: string;
  selectedToken: TokenType;
  otherSelectedToken: TokenType;
  loading?: boolean;
  actionHandler?: (type: InputActionButtonType) => void;
  tokenData: TokenType[];
  setSelectedToken: (token: TokenType) => void;
  tokenBalance: number;
  tokenRate?: number;
  disabled?: boolean;
}

const montserrat_alternates = Montserrat_Alternates({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const deserialize = new SwapSDK();
const DCAInputgroup = forwardRef(
  (
    {
      className,
      label,
      selectedToken,
      loading,
      actionHandler,
      tokenData,
      setSelectedToken,
      otherSelectedToken,
      tokenBalance,
      tokenRate = 1,
      disabled,
      ...props
    }: InputProps,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    const [openModal, setOpenModal] = useState(false);

    const [searchVal, setSearchVal] = useState("");
    const [error, setError] = useState("");

    const { isConnected, assets } = useWallet();

    // HDR: Handle Modal open/close
    const modalHandler = () => {
      setOpenModal((prev) => !prev);
    };

    // HDR: Handle selection of item on the modal and closing it
    const itemSelector = (item: TokenAsset) => {
      modalHandler();
      setSelectedToken(item);
    };

    return (
      <>
        <div className="space-y-5 bg-[#191918] rounded-xl p-5 ">
          {/* SUB: Top container */}
          <div className="flex items-center justify-between ">
            <span className={cn("font-normal text-white")}>{label}</span>
            <div className="flex gap-2 items-center">
              <div>
                <Button
                  variant="ghost"
                  type="button"
                  className={cn(
                    "hover:!bg-transparent px-0",
                    "disabled:opacity-100 disabled:grayscale-0 disabled:text-white",
                    tokenBalance <= 0
                      ? "!cursor-not-allowed disabled:pointer-events-auto"
                      : ""
                  )}
                  disabled={tokenBalance <= 0}
                  onClick={() => actionHandler && actionHandler("max")}
                >
                  <Wallet width={14} height={12} color="#93D581" />
                  <span
                    className={cn(
                      montserrat_alternates.className,
                      "text-[16px] text-[#FFFFFF]"
                    )}
                  >
                    {tokenBalance.toFixed(tokenBalance > 0 ? 6 : 0)}
                  </span>
                </Button>
              </div>
            </div>
          </div>
          {/* SUB: Middle container */}
          <div className="flex justify-between items-center">
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                onClick={modalHandler}
                disabled={disabled}
                className="py-3 px-5 text-[18px] border rounded-[12px] border-[#000] bg-transparent text-white"
                type="button"
              >
                <Image
                  src={selectedToken.logoURI || "/images/eclipse.png"}
                  alt="tokens"
                  className="object-fit rounded-full size-6"
                  width={23}
                  height={23}
                />
                <span className="uppercase">{selectedToken.symbol}</span>
                <ChevronDown />
              </Button>
            </div>
          </div>
        </div>

        {/* HDR: Modal */}
        {openModal && (
          <div className="token-modal">
            <div className="token-modal-content">
              {/* Header */}
              <div className="modal-header">
                <CloseSVG onClick={modalHandler} />
                <span>Select Tokens</span>
              </div>

              {/* Search */}
              <div className="modal-search">
                <SearchSVG />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                />
              </div>

              {/* Token List */}
              <div className="token-list">
                {connected ? (
                  <div>
                    {tokenBalances
                      ?.filter(
                        (balance) => balance.mint !== otherSelectedToken.address
                      )
                      .map((balance) => {
                        const matchingToken = tokenData.find(
                          (t) => t.address === balance.mint
                        );
                        if (!matchingToken) return null;

                        const usdValue =
                          (balance.balanceUiAmount || 0) *
                          (tokenPrices[matchingToken.address] || 0);

                        return {
                          balance,
                          token: matchingToken,
                          usdValue,
                        };
                      })
                      .filter(
                        (
                          item
                        ): item is {
                          balance: TokenBalanceType;
                          token: TokenType;
                          usdValue: number;
                        } => !!item
                      )
                      .filter(({ token }) => {
                        if (!searchVal.trim()) return true;
                        const query = searchVal.toLowerCase();
                        return (
                          token.symbol.toLowerCase().includes(query) ||
                          token.name.toLowerCase().includes(query)
                        );
                      })
                      .sort((a, b) => {
                        if (a.token.symbol === "BITZ") return -1;
                        if (b.token.symbol === "BITZ") return 1;
                        return b.usdValue - a.usdValue;
                      })
                      .map(({ balance, token, usdValue }) => (
                        <div
                          key={token.address}
                          className="token-item"
                          onClick={() => {
                            mixpanel.track(`${token.symbol} selected`);
                            itemSelector(token);
                          }}
                        >
                          <div className="token-info">
                            <TokenImage
                              src={token.logoURI || "/images/eclipse.png"}
                              alt={token.symbol}
                              loading="lazy"
                            />
                            <div className="flex justify-between items-center w-full">
                              <div className="flex flex-col">
                                <span className="text-base font-semibold text-white">
                                  {token.symbol}
                                </span>
                                <span className="text-sm text-gray-400">
                                  {token.name}
                                </span>
                                <span className="text-sm text-gray-600">
                                  {splitStringInMiddle(token.address, 5)}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm text-gray-300">
                                  {balance.balanceUiAmount || "0"}{" "}
                                  {token.symbol}
                                </span>
                                <span className="text-sm text-gray-600 text-end">
                                  ${usdValue.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div>
                    {tokenData.map((token) => {
                      const usdPerToken = tokenPrices[token.address] || 0;

                      return (
                        <div
                          key={token.address}
                          className="token-item"
                          onClick={() => {
                            mixpanel.track(`${token.symbol} selected`);
                            itemSelector(token);
                          }}
                        >
                          <div className="token-info">
                            <TokenImage
                              src={token.logoURI || "/images/eclipse.png"}
                              alt={token.symbol}
                              loading="lazy"
                            />
                            <div className="flex justify-between items-center w-full">
                              <div className="flex flex-col">
                                <span className="text-base font-semibold text-white">
                                  {token.symbol}
                                </span>
                                <span className="text-sm text-gray-400">
                                  {token.name}
                                </span>
                                <span className="text-sm text-gray-600">
                                  {splitStringInMiddle(token.address, 5)}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm text-gray-300">
                                  0 {token.symbol}
                                </span>
                                <span className="text-sm text-gray-600 text-end">
                                  ${usdPerToken.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
);

DCAInputgroup.displayName = "SwapInputgroup";

export default DCAInputgroup;
