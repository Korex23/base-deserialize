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
import { InputActionButtonType, TokenAsset } from "@/types/swapform";
import { Skeleton } from "@/components/ui/skeleton";
// import TokenModalContent from "@/sections/TokenModalContent";W
// import Modal from "@/components/general/Modal";
import { CloseSVG, SearchSVG } from "../general/Icons";
import TokenImage from "../general/TokenImage";
import { splitStringInMiddle } from "@/lib/utils";
import mixpanel from "mixpanel-browser";
import Image from "next/image";
import { formatSmallNumber } from "@/lib/utils";
import { useWallet } from "@/context/user-wallet-provider";
import TokenItem from "@/sections/TokenItem";
import { NATIVE_0G_TOKEN } from "@/lib/constant";
import { KNOWN_TOKENS } from "@/data/tokenList";
import { ogMainnet } from "@/providers/chains/chains";
import { useWatchAsset } from "wagmi";

interface InputProps
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  variant: "buy" | "sell";
  label: string;
  selectedToken: TokenAsset | undefined;
  otherSelectedToken: TokenAsset | undefined;
  loading?: boolean;
  actionHandler?: (type: InputActionButtonType) => void;
  tokenData: TokenAsset[];
  setSelectedToken: (token: TokenAsset) => void;
  tokenBalance: number;
  tokenRate?: number;
  disabled?: boolean;
  finalEthBalance?: string;
  tokenList: TokenAsset[];
  disableSelectModal?: boolean;
}

const montserrat_alternates = Montserrat_Alternates({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const SwapInputgroup = forwardRef(
  (
    {
      className,
      label,
      variant,
      selectedToken,
      loading,
      actionHandler,
      tokenData,
      setSelectedToken,
      otherSelectedToken,
      tokenBalance,
      tokenRate = 1,
      disabled,
      finalEthBalance,
      tokenList,
      disableSelectModal,
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
        <div className="space-y-5 bg-[#191918] rounded-xl p-5">
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
                    tokenBalance <= 0 && variant !== "buy"
                      ? "!cursor-not-allowed disabled:pointer-events-auto"
                      : ""
                  )}
                  disabled={variant === "buy" || tokenBalance <= 0}
                  onClick={() => actionHandler && actionHandler("max")}
                >
                  <Wallet width={14} height={12} color="#93D581" />
                  <span
                    className={cn(
                      montserrat_alternates.className,
                      "sm:text-[12px] text-[10px] md:text-[16px] text-[#FFFFFF]"
                    )}
                    dangerouslySetInnerHTML={{
                      __html: formatSmallNumber(tokenBalance),
                    }}
                  />
                </Button>
              </div>
              {variant === "sell" && (
                <div className="space-x-1">
                  {props.defaultValue || props.value ? (
                    <Button
                      variant="secondary"
                      className="text-[8px] md:text-xs rounded-md py-1 px-1.5 md:py-1.5 md:px-3 bg-[#10170E] border border-[#162B24] text-[#FFFFFF] h-fit"
                      type="button"
                      disabled={disabled}
                      onClick={() => actionHandler && actionHandler("clear")}
                    >
                      Clear
                    </Button>
                  ) : null}
                  <Button
                    variant="secondary"
                    className="text-[8px] md:text-xs rounded-md py-1 px-1.5 md:py-1.5 md:px-3 bg-[#10170E] border border-[#162B24] text-[#FFFFFF] h-fit"
                    type="button"
                    onClick={() => actionHandler && actionHandler("50%")}
                    disabled={tokenBalance <= 0 || disabled}
                  >
                    Half
                  </Button>
                  <Button
                    variant="secondary"
                    className="text-[8px] md:text-xs rounded-md py-1 px-1.5 md:py-1.5 md:px-3 bg-[#10170E] border border-[#162B24] text-[#FFFFFF] h-fit"
                    type="button"
                    onClick={() => actionHandler && actionHandler("max")}
                    disabled={tokenBalance <= 0 || disabled}
                  >
                    Max
                  </Button>
                </div>
              )}
            </div>
          </div>
          {/* SUB: Middle container */}
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-3">
              {variant === "sell" ? (
                <Input
                  className={cn(
                    "flex-1 border-none outline-none focus-visible:ring-0 p-0 text-sm sm:text-md md:text-xl font-extrabold text-white rounded-none caret-green-300",
                    className,
                    montserrat_alternates.className
                  )}
                  disabled={disabled}
                  inputMode="decimal"
                  type="text"
                  onKeyDown={(e) => {
                    if (e.key === "-") {
                      e.preventDefault();
                    }
                  }}
                  onWheel={(e) => {
                    e.currentTarget.blur();
                  }}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/,/g, "");

                    const value = parseFloat(rawValue);

                    // Prevent negatives
                    if (value < 0) {
                      e.target.value = "0";
                      return;
                    }

                    if (!isNaN(value)) {
                      e.target.value = new Intl.NumberFormat("en-US").format(
                        value
                      );
                    } else {
                      e.target.value = "";
                    }
                  }}
                  {...props}
                  ref={ref}
                />
              ) : loading ? (
                <Skeleton className="h-9 w-full rounded-none" />
              ) : (
                <Input
                  className={cn(
                    "flex-1 border-none outline-none focus-visible:ring-0 text-white p-0 text-sm sm:text-md md:text-xl font-extrabold rounded-none",
                    className,
                    montserrat_alternates.className
                  )}
                  inputMode="decimal"
                  type="text"
                  {...props}
                  readOnly
                />
              )}
              {/* Price display */}
              {loading ? (
                variant === "buy" ? (
                  <Skeleton className="h-5 w-14" />
                ) : (
                  <div className="h-4 w-12 bg-[#FAFAFA]/10 animate-pulse rounded relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#FAFAFA]/10"></div>
                  </div>
                )
              ) : (
                <span
                  className={cn(
                    "text-[12px] md:text-[14px] text-[#A1FEA0]",
                    montserrat_alternates.className
                  )}
                >
                  {/* {`$${
                    Number.isFinite(tokenRate)
                      ? tokenRate.toFixed(tokenRate > 0 ? 4 : 0)
                      : 0
                  }`} */}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                onClick={modalHandler}
                disabled={disabled || disableSelectModal}
                className="py-3 px-5 sm:text-[14px] text-[12px] md:text-[18px] border rounded-[12px] border-[#000] bg-transparent text-white"
                type="button"
              >
                {variant === "buy" && !selectedToken?.symbol ? (
                  <>
                    <span>Select a token</span>
                    <ChevronDown />
                  </>
                ) : (
                  <>
                    <Image
                      src={selectedToken?.logo || "/tokens/OG.png"}
                      alt="tokens"
                      className="object-fit rounded-full size-6"
                      width={23}
                      height={23}
                    />
                    <span className="uppercase">{selectedToken?.symbol}</span>
                    <ChevronDown />
                  </>
                )}
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

              <div>
                {(selectedToken?.address === NATIVE_0G_TOKEN.address &&
                  otherSelectedToken?.address ===
                    "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c") ||
                (selectedToken?.address ===
                  "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c" &&
                  otherSelectedToken?.address === NATIVE_0G_TOKEN.address) ? (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <svg
                      className="w-5 h-5 text-red-500 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-red-700 font-medium">
                      Cannot swap between 0G and W0G tokens
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Search */}
              <div className="modal-search">
                <SearchSVG />
                <input
                  type="text"
                  placeholder="Search token by name or contract address"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                />
              </div>

              {/* Token List */}
              <div className="token-list">
                {isConnected && assets && assets.length > 0 ? (
                  <div>
                    {assets
                      ?.filter(
                        (asset) => asset.address !== otherSelectedToken?.address
                      )
                      .filter((asset) => {
                        if (
                          otherSelectedToken?.address ===
                            NATIVE_0G_TOKEN.address &&
                          asset.address ===
                            "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c"
                        ) {
                          return false;
                        }
                        if (
                          otherSelectedToken?.address ===
                            "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c" &&
                          asset.address === NATIVE_0G_TOKEN.address
                        ) {
                          return false;
                        }
                        return true;
                      })
                      .filter(({ symbol, address }) => {
                        if (!searchVal.trim()) return true;
                        const query = searchVal.toLowerCase();
                        return (
                          symbol.toLowerCase().includes(query) ||
                          address.toLowerCase().includes(query)
                        );
                      })
                      .sort((a, b) => {
                        return Number(b.balance) - Number(a.balance);
                      })
                      .map((asset) => (
                        <TokenItem
                          key={asset.address}
                          asset={asset}
                          itemSelector={itemSelector}
                          mixpanel={mixpanel}
                        />
                      ))}
                  </div>
                ) : (
                  <div>
                    {tokenList
                      .filter(
                        (asset) => asset.address !== otherSelectedToken?.address
                      )
                      .filter((asset) => {
                        if (
                          otherSelectedToken?.address ===
                            NATIVE_0G_TOKEN.address &&
                          asset.address ===
                            "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c"
                        ) {
                          return false;
                        }
                        if (
                          otherSelectedToken?.address ===
                            "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c" &&
                          asset.address === NATIVE_0G_TOKEN.address
                        ) {
                          return false;
                        }
                        return true;
                      })
                      .map((asset) => {
                        return (
                          <TokenItem
                            key={asset.address}
                            asset={{
                              ...asset,
                              balance: "0",
                              logo: asset.logo || "/tokens/OG.png",
                            }}
                            itemSelector={itemSelector}
                            mixpanel={mixpanel}
                          />
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

SwapInputgroup.displayName = "SwapInputgroup";

export default SwapInputgroup;
