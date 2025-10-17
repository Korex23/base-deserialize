// components/providers/MixpanelProvider.tsx
"use client";

import { useEffect } from "react";
import { initMixpanel } from "@/lib/mixpanel";
import { useAccount } from "wagmi";
import mixpanel from "@/lib/mixpanel";

const MixpanelProvider = () => {
  const { isConnected, address } = useAccount();
  useEffect(() => {
    if (isConnected && address) {
      const walletAddress = address;
      mixpanel.identify(walletAddress);
      mixpanel.track("User", {
        userWallet: walletAddress,
      });
    }
    initMixpanel();
  }, []);

  return null;
};

export default MixpanelProvider;
