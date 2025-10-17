"use client";

import dynamic from "next/dynamic";

const WalletRuntime = dynamic(() => import("./wallet-runtime"), { ssr: false });

export default function WalletProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WalletRuntime>{children}</WalletRuntime>;
}
