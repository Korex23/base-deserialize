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
  Clipboard,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Montserrat_Alternates } from "next/font/google";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { InputActionButtonType, TokenAsset } from "@/types/swapform";
import { Skeleton } from "@/components/ui/skeleton";
import { CloseSVG, SearchSVG } from "../general/Icons";
import TokenImage from "../general/TokenImage";
import { splitStringInMiddle } from "@/lib/utils";
import mixpanel from "mixpanel-browser";
import Image from "next/image";
import { formatSmallNumber } from "@/lib/utils";
import { useWallet } from "@/context/user-wallet-provider";
import TokenItem from "@/sections/TokenItem";
import { NATIVE_0G_TOKEN } from "@/lib/constant";
import { isAddress } from "ethers";

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
    const [fetchedToken, setFetchedToken] = useState<TokenAsset | null>(null);
    const [loadingToken, setLoadingToken] = useState(false);
    const [pasteSuccess, setPasteSuccess] = useState(false);

    const { isConnected, assets, address, addTokenToList } = useWallet();

    // Handle paste from clipboard
    const handlePaste = async () => {
      try {
        const text = await navigator.clipboard.readText();
        setSearchVal(text.trim());
        setPasteSuccess(true);
        setTimeout(() => setPasteSuccess(false), 2000);
      } catch (err) {
        console.error("Failed to read clipboard:", err);
        setError("Failed to read from clipboard. Please paste manually.");
        setTimeout(() => setError(""), 3000);
      }
    };

    // Fetch token info when a valid contract address is entered
    useEffect(() => {
      const fetchTokenInfo = async () => {
        if (!searchVal.trim()) {
          setFetchedToken(null);
          setError("");
          return;
        }

        const trimmedSearch = searchVal.trim();

        // Check if it's a valid address
        if (!isAddress(trimmedSearch)) {
          setFetchedToken(null);
          setError("");
          return;
        }

        // Check if token already exists in assets or tokenList
        const existsInAssets = assets?.some(
          (asset) => asset.address.toLowerCase() === trimmedSearch.toLowerCase()
        );
        const existsInTokenList = tokenList.some(
          (token) => token.address.toLowerCase() === trimmedSearch.toLowerCase()
        );

        if (existsInAssets || existsInTokenList) {
          setFetchedToken(null);
          setError("");
          return;
        }

        // Fetch token information
        setLoadingToken(true);
        setError("");

        try {
          const walletAddress =
            address || "0x0000000000000000000000000000000000000000";

          const res = await fetch("/api/token-info", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tokenAddress: trimmedSearch,
              walletAddress,
            }),
          });

          const data = await res.json();

          if (!res.ok || data.error) {
            setFetchedToken(null);
            setError(
              data.error ||
                "Unable to fetch token information. Please verify the contract address."
            );
            return;
          }

          if (data.symbol && data.decimals !== undefined) {
            const newToken: TokenAsset = {
              address: trimmedSearch,
              symbol: data.symbol,
              decimals: data.decimals,
              balance: data.balance ?? "0",
              logo: "/tokens/base.png",
            };

            setFetchedToken(newToken);
            setError("");
          } else {
            setFetchedToken(null);
            setError(
              "Unable to fetch token information. Please verify the contract address."
            );
          }
        } catch (err) {
          console.error("Error fetching token:", err);
          setFetchedToken(null);
          setError("Failed to fetch token. Please check the contract address.");
        } finally {
          setLoadingToken(false);
        }
      };

      const debounceTimer = setTimeout(fetchTokenInfo, 500);
      return () => clearTimeout(debounceTimer);
    }, [searchVal, assets, tokenList, address]);

    const modalHandler = () => {
      setOpenModal((prev) => !prev);
      if (openModal) {
        setSearchVal("");
        setFetchedToken(null);
        setError("");
        setPasteSuccess(false);
      }
    };

    const itemSelector = (item: TokenAsset) => {
      // If this is a fetched token that's not in the list, add it
      if (
        fetchedToken &&
        item.address.toLowerCase() === fetchedToken.address.toLowerCase()
      ) {
        addTokenToList(item);
        console.log("Added custom token to list:", item.symbol);
      }
      modalHandler();
      setSelectedToken(item);
    };

    // Get filtered tokens based on search
    const getFilteredTokens = (tokens: TokenAsset[]) => {
      return tokens
        .filter((asset) => asset.address !== otherSelectedToken?.address)
        .filter((asset) => {
          // Filter out 0G/W0G conflicts
          if (
            otherSelectedToken?.address === NATIVE_0G_TOKEN.address &&
            asset.address === "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c"
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
        });
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
                ></span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                onClick={modalHandler}
                disabled={disabled || disableSelectModal}
                className="py-3 px-5 sm:text-[14px] text-[12px] md:text-[18px] border rounded-[12px] border-[#000] bg-transparent text-white hover:bg-[#262626] transition-colors"
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
                      src={selectedToken?.logo || "/tokens/base.png"}
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

              {/* 0G/W0G Warning */}
              <div>
                {(selectedToken?.address === NATIVE_0G_TOKEN.address &&
                  otherSelectedToken?.address ===
                    "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c") ||
                (selectedToken?.address ===
                  "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c" &&
                  otherSelectedToken?.address === NATIVE_0G_TOKEN.address) ? (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-3">
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

              {/* Search with Paste Button */}
              <div className="modal-search relative">
                <SearchSVG />
                <input
                  type="text"
                  placeholder="Search token by name or paste contract address"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="pr-10"
                />
                <button
                  onClick={handlePaste}
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md transition-all",
                    pasteSuccess
                      ? "bg-green-100 text-green-600"
                      : "hover:bg-gray-100 text-gray-500"
                  )}
                  title="Paste from clipboard"
                  type="button"
                >
                  {pasteSuccess ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Clipboard className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="px-4 py-3.5 bg-red-50 border border-red-200/80 rounded-xl mb-3 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                      <svg
                        className="w-full h-full text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-red-800 leading-relaxed">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loadingToken && (
                <div className="flex items-center justify-center gap-3 p-6 bg-[#1a1a1a] rounded-lg mb-3">
                  <Loader2 className="w-5 h-5 animate-spin text-[#93D581]" />
                  <span className="text-sm text-gray-300 font-medium">
                    Fetching token information...
                  </span>
                </div>
              )}

              {/* Fetched Token Display */}
              {fetchedToken && !loadingToken && (
                <div className="mb-3">
                  <div className="px-4 py-2 bg-[#1a1a1a] border-b border-gray-700">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-[#93D581]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs text-[#93D581] font-semibold">
                        Contract found - Click to add
                      </span>
                    </div>
                  </div>
                  <TokenItem
                    asset={fetchedToken}
                    itemSelector={itemSelector}
                    mixpanel={mixpanel}
                  />
                </div>
              )}

              {/* Token List */}
              <div className="token-list">
                {isConnected && assets && assets.length > 0 ? (
                  <div>
                    {getFilteredTokens(assets)
                      .sort((a, b) => Number(b.balance) - Number(a.balance))
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
                    {getFilteredTokens(tokenList).map((asset) => (
                      <TokenItem
                        key={asset.address}
                        asset={{
                          ...asset,
                          balance: "0",
                          logo: asset.logo || "/tokens/base.png",
                        }}
                        itemSelector={itemSelector}
                        mixpanel={mixpanel}
                      />
                    ))}
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
