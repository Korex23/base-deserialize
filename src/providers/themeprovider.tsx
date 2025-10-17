"use client";

import dynamic from "next/dynamic";
import PageLoader from "@/components/general/PageLoader";

const ThemeProvider = dynamic(() => import("@/context/theme-provider"), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function ThemeProviderWrapper({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
