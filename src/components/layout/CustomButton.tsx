"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { Check, Copy, LogOut, Wallet, WalletMinimal } from "lucide-react";
import { splitStringInMiddle, formatSmallNumber } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWallet } from "@/context/user-wallet-provider";
import { ogMainnet } from "@/providers/chains/chains";
import { base } from "viem/chains";

export default function CustomConnectButton() {
  const { connector, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { assets, handleDisconnect, finalEthBalance, activeChain } =
    useWallet();

  const [showSidebar, setShowSidebar] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const walletName = connector?.name;

  const showSidebarHandler = () => {
    setShowSidebar((prev) => !prev);
  };

  // ✅ Auto-switch chain when connected
  useEffect(() => {
    if (isConnected && chainId !== ogMainnet.id) {
      switchChain({ chainId: ogMainnet.id });
    }
  }, [isConnected, chainId, switchChain]);

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openChainModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain && assets;

        if (!connected) {
          return (
            <Button onClick={openConnectModal}>
              <WalletMinimal className="mr-2 h-4 w-4" />
              Connect
            </Button>
          );
        }

        return (
          <div>
            <Button
              className="py-1.5 h-fit px-4 md:pr-5 border border-[#262626] gap-2"
              variant="outline"
              onClick={showSidebarHandler}
            >
              <span className="size-7 rounded-full bg-[#6b6b6b] flex items-center justify-center">
                <Wallet color="black" />
              </span>

              <div className="flex flex-col items-start text-xs text-white">
                <span className="opacity-65">{walletName}</span>
                <span className="font-semibold">
                  {splitStringInMiddle(account.displayName, 5)}
                </span>
              </div>

              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  activeChain === base.id
                    ? "bg-green-600/20 text-green-400 border border-green-600/40"
                    : "bg-yellow-600/20 text-yellow-400 border border-yellow-600/40"
                }`}
              >
                {activeChain === base.id ? "Mainnet" : "Testnet"}
              </span>
            </Button>

            {/* Sidebar Sheet */}
            <Sheet open={showSidebar} onOpenChange={showSidebarHandler}>
              <SheetContent className="text-white">
                <SheetHeader className="hidden">
                  <SheetTitle>wallet</SheetTitle>
                  <SheetDescription>wallet data</SheetDescription>
                </SheetHeader>
                <div className="mt-10">
                  {/* Wallet Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="size-12 rounded-full bg-[#262626]/50 flex items-center justify-center">
                        <Wallet />
                      </span>
                      <div className="flex flex-col items-start text-sm">
                        <span className="opacity-65">{walletName}</span>
                        <span className="font-semibold">
                          {splitStringInMiddle(account.displayName || "", 5)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mr-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger
                            className="size-12 rounded-full bg-[#262626]/50 flex items-center justify-center hover:bg-[#262626] transition duration-300 ease"
                            onClick={() =>
                              navigator.clipboard.writeText(account.address)
                            }
                          >
                            {showTooltip ? (
                              <Check className="size-5 text-green-500" />
                            ) : (
                              <Copy className="size-5" />
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy Wallet Address</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger
                            className="size-12 rounded-full bg-[#262626]/50 flex items-center justify-center"
                            onClick={handleDisconnect}
                          >
                            <LogOut className="size-5" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Disconnect Wallet</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  {/* Token Balances */}
                  <div className="text-white mt-5">
                    <h2 className="text-md font-bold mb-2">
                      Your Token Balances
                    </h2>

                    {assets.length > 0 && finalEthBalance ? (
                      <div className="max-h-96 no-scrollbar overflow-y-auto pr-1">
                        <div className="grid gap-2">
                          {assets.map((asset, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-4 p-2 rounded-xl shadow-md"
                            >
                              <img
                                src={asset.logo || "/tokens/OG.png"}
                                alt={`${asset.symbol} logo`}
                                className="w-8 h-8 rounded-full object-contain"
                              />
                              <div>
                                <p className="text-md font-semibold">
                                  {asset.symbol}
                                </p>
                                <span
                                  className="text-gray-600 dark:text-gray-400 text-xs"
                                  dangerouslySetInnerHTML={{
                                    __html: formatSmallNumber(
                                      Number(asset.balance)
                                    ),
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No tokens found. Please ensure you have tokens in your
                        wallet.
                      </p>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
