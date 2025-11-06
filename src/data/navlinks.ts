import { Repeat, Book, CandlestickChartIcon, Coins } from "lucide-react";
import { GiBridge } from "react-icons/gi";

export const NavLinks = [
  { name: "Trade", links: ["/", "/limit-order"], tag: "Hot" },
  { name: "Perp Dex", links: ["https://og.deserialize.xyz/"], tag: "Soon" },
  { name: "Token Screener", links: ["/token-screener"], tag: "Soon" },
  {
    name: "Bridge",
    links: ["https://www.dextopus.com/"],
    tag: "",
  },
  {
    name: "Docs",
    links: ["https://docs.deserialize.xyz"],
    tag: "",
  },
];

export const MobileNavLinks = [
  {
    name: "Trade",
    links: ["/", "/limit-order"],
    tag: "Hot",
    icon: Repeat,
  },
  {
    name: "Perp Dex",
    links: ["https://og.deserialize.xyz/"],
    tag: "Soon",
    icon: CandlestickChartIcon,
  },
  {
    name: "Token Screener",
    links: ["/token-screener"],
    tag: "Soon",
    icon: Coins,
  },

  {
    name: "Bridge",
    links: ["https://www.dextopus.com/"],
    tag: "",
    icon: GiBridge,
  },
  {
    name: "Docs",
    links: ["https://docs.deserialize.xyz"],
    tag: "",
    icon: Book,
  },
];
