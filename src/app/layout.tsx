import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { Montserrat, Montserrat_Alternates, Inter } from "next/font/google";
import { Toaster } from "sonner";
import MixpanelProvider from "@/providers/mixpanel-provider";
import { Space_Grotesk } from "next/font/google";
import { OrderServiceProvider } from "@/context/limit-order-provider";
import { ThemeProvider } from "next-themes";
import WalletProviderWrapper from "@/providers/wallets-provider-wrapper";
import BackgroundLoader from "@/components/BgLoader";
import RainbowKitContext from "@/providers/RainbowKit-Provider";
import ClarityProvider from "@/providers/Clarity-Provide";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const montserrat_alternates = Montserrat_Alternates({
  subsets: ["latin"],
  variable: "--font-montserrat-alternates",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Deserialize",
  description: "Deserialize",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={spaceGrotesk.className} suppressHydrationWarning>
      <body
        className={`${montserrat.className} ${montserrat_alternates.variable} ${inter.variable}`}
        suppressHydrationWarning
      >
        <BackgroundLoader>
          <RainbowKitContext>
            <MixpanelProvider />
            <ThemeProvider>
              <OrderServiceProvider>
                <WalletProviderWrapper>
                  <Navbar />
                  <Toaster />
                  <ClarityProvider />
                  <main className="mt-[6rem]">{children}</main>
                </WalletProviderWrapper>
              </OrderServiceProvider>
            </ThemeProvider>
          </RainbowKitContext>
        </BackgroundLoader>
      </body>
    </html>
  );
}
