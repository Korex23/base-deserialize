"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/context/user-wallet-provider";
import { ogMainnet } from "@/providers/chains/chains";
import { useSwitchChain, useAccount, useChainId } from "wagmi";
import { useEffect } from "react";
import { base } from "viem/chains";

interface ConnectedProps {
  tokenA: string;
  tokenB: string;
  isBusy: boolean;
  enteredAmount: string;
  isPerformingSwap: boolean;
  performSdkSwap: () => Promise<void>;
  label: string;
  error: boolean;
}

export default function SwapCustomConnectButton(props: ConnectedProps) {
  const { assets } = useWallet();
  const { isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();

  useEffect(() => {
    if (isConnected && chainId !== base.id) {
      switchChain({ chainId: base.id });
    }
  }, [isConnected, chainId, switchChain]);
  return (
    <ConnectButton.Custom>
      {({ account, chain, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain && assets;

        if (!connected) {
          return (
            <Button
              onClick={openConnectModal}
              variant="ghost"
              type="button"
              className="py-6 border border-green-300 text-[#cccccc] rounded-xl w-full"
            >
              Connect Wallet
            </Button>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              className="py-6 rounded-xl w-full disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={props.performSdkSwap}
              disabled={
                !props.tokenA ||
                !props.tokenB ||
                !props.enteredAmount ||
                props.isBusy ||
                props.error
              }
            >
              <span
                className={
                  props.isBusy || props.isPerformingSwap ? "animate-pulse" : ""
                }
              >
                {props.label}
              </span>
            </Button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
