import { FormState } from "@/types/swapform";
import { NATIVE_0G_TOKEN } from "@/lib/constant";
// import { TableRow } from "@/sections/ScreenerTable";

const testnetDefaults: FormState = {
  sell: {
    token: {
      symbol: "BTC",
      address: "0x36f6414FF1df609214dDAbA71c84f18bcf00F67d",
      logo: "/tokens/bitcoin.png",
      balance: undefined,
    },
    amount: "1",
    balance: "0",
  },
  buy: {
    token: {
      address: "0x3eC8A8705bE1D5ca90066b37ba62c4183B024ebf",
      symbol: "USDT",
      logo: "/tokens/Tether.png",
      balance: undefined,
    },
    amount: "",
    balance: "0",
  },
  dex: "ZERO_G",
};

const mainnetDefaults: FormState = {
  sell: {
    token: {
      symbol: NATIVE_0G_TOKEN.symbol,
      address: NATIVE_0G_TOKEN.address,
      logo: NATIVE_0G_TOKEN.logo,
      balance: undefined,
      decimals: NATIVE_0G_TOKEN.decimals,
    },
    amount: "",
    balance: "0",
  },
  buy: {
    token: {
      symbol: "MUNICIPA",
      address: "0xb7516ae464e6359cb0c709ea61e47e49ca013fae",
      logo: "data:image/svg+xml,%0A%20%20%20%20%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%20%20%20%20%20%20%3Cdefs%3E%0A%20%20%20%20%20%20%20%20%3CradialGradient%20id%3D%22radial-b7516a%22%20cx%3D%2250%25%22%20cy%3D%2250%25%22%20r%3D%2250%25%22%3E%0A%20%20%20%20%20%20%20%20%20%20%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22white%22%20stop-opacity%3D%220.2%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3Cstop%20offset%3D%2240%25%22%20stop-color%3D%22hsl(112%2C%2065%25%2C%2055%25)%22%20stop-opacity%3D%220.95%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22hsl(136%2C%2070%25%2C%2035%25)%22%20stop-opacity%3D%221%22%2F%3E%0A%20%20%20%20%20%20%20%20%3C%2FradialGradient%3E%0A%20%20%20%20%20%20%20%20%3Cpattern%20id%3D%22rings-b7516a%22%20patternUnits%3D%22userSpaceOnUse%22%20width%3D%224%22%20height%3D%224%22%3E%0A%20%20%20%20%20%20%20%20%20%20%3Ccircle%20cx%3D%222%22%20cy%3D%222%22%20r%3D%221%22%20fill%3D%22rgba(255%2C255%2C255%2C0.06)%22%2F%3E%0A%20%20%20%20%20%20%20%20%3C%2Fpattern%3E%0A%20%20%20%20%20%20%20%20%3Cfilter%20id%3D%22noise-b7516a%22%3E%0A%20%20%20%20%20%20%20%20%20%20%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.8%22%20numOctaves%3D%222%22%20result%3D%22turb%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3CfeColorMatrix%20type%3D%22saturate%22%20values%3D%220%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3CfeComponentTransfer%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CfeFuncA%20type%3D%22linear%22%20slope%3D%220.08%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3C%2FfeComponentTransfer%3E%0A%20%20%20%20%20%20%20%20%3C%2Ffilter%3E%0A%20%20%20%20%20%20%20%20%3Cfilter%20id%3D%22shadow-b7516a%22%20x%3D%22-50%25%22%20y%3D%22-50%25%22%20width%3D%22200%25%22%20height%3D%22200%25%22%3E%0A%20%20%20%20%20%20%20%20%20%20%3CfeDropShadow%20dx%3D%220%22%20dy%3D%222%22%20stdDeviation%3D%222.5%22%20flood-color%3D%22black%22%20flood-opacity%3D%220.35%22%2F%3E%0A%20%20%20%20%20%20%20%20%3C%2Ffilter%3E%0A%20%20%20%20%20%20%20%20%3Cfilter%20id%3D%22glow-b7516a%22%20x%3D%22-50%25%22%20y%3D%22-50%25%22%20width%3D%22200%25%22%20height%3D%22200%25%22%3E%0A%20%20%20%20%20%20%20%20%20%20%3CfeGaussianBlur%20in%3D%22SourceAlpha%22%20stdDeviation%3D%221.2%22%20result%3D%22blur%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3CfeMerge%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CfeMergeNode%20in%3D%22blur%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CfeMergeNode%20in%3D%22SourceGraphic%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3C%2FfeMerge%3E%0A%20%20%20%20%20%20%20%20%3C%2Ffilter%3E%0A%20%20%20%20%20%20%3C%2Fdefs%3E%0A%20%20%20%20%20%20%3Ccircle%20cx%3D%2220%22%20cy%3D%2220%22%20r%3D%2219.5%22%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20fill%3D%22url(%23radial-b7516a)%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20filter%3D%22url(%23shadow-b7516a)%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20stroke%3D%22rgba(255%2C255%2C255%2C0.25)%22%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20stroke-width%3D%220.8%22%2F%3E%0A%20%20%20%20%20%20%3Ccircle%20cx%3D%2220%22%20cy%3D%2220%22%20r%3D%2219.5%22%20fill%3D%22url(%23rings-b7516a)%22%20%2F%3E%0A%20%20%20%20%20%20%3Ccircle%20cx%3D%2220%22%20cy%3D%2220%22%20r%3D%2219.5%22%20filter%3D%22url(%23noise-b7516a)%22%20%2F%3E%0A%20%20%20%20%20%20%3Ccircle%20cx%3D%2220%22%20cy%3D%2220%22%20r%3D%2217%22%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20fill%3D%22none%22%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20stroke%3D%22rgba(255%2C255%2C255%2C0.25)%22%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20stroke-width%3D%221.2%22%2F%3E%0A%20%20%20%20%20%20%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20%0A%20%20%20%20%20%20%20%20%20%20%20%20font-family%3D%22'Orbitron'%2C%20'Oxanium'%2C%20'Share%20Tech%20Mono'%2C%20sans-serif%22%20%0A%20%20%20%20%20%20%20%20%20%20%20%20font-size%3D%2215%22%20%0A%20%20%20%20%20%20%20%20%20%20%20%20font-weight%3D%22700%22%20%0A%20%20%20%20%20%20%20%20%20%20%20%20fill%3D%22white%22%20%0A%20%20%20%20%20%20%20%20%20%20%20%20text-anchor%3D%22middle%22%20%0A%20%20%20%20%20%20%20%20%20%20%20%20dominant-baseline%3D%22central%22%0A%20%20%20%20%20%20%20%20%20%20%20%20filter%3D%22url(%23glow-b7516a)%22%0A%20%20%20%20%20%20%20%20%20%20%20%20style%3D%22letter-spacing%3A0.5px%3B%22%3E%0A%20%20%20%20%20%20%20%20MU%0A%20%20%20%20%20%20%3C%2Ftext%3E%0A%20%20%20%20%3C%2Fsvg%3E%0A%20%20",
      balance: undefined,
      decimals: 18,
    },
    amount: "",
    balance: "0",
  },
  dex: "ZERO_G",
};
// const mainnetDefaults: FormState = {
//   sell: {
//     token: {
//       symbol: "PAI",
//       address: "0x59ef6f3943bbdfe2fb19565037ac85071223e94c",
//       logo: "https://raw.githubusercontent.com/0G-X/jaine-token-lists/main/assets/mainnet/PAI.svg",
//       balance: undefined,
//       decimals: 9,
//     },
//     amount: "1",
//     balance: "0",
//   },
//   buy: {
//     token: {
//       address: "0x7bbc63d01ca42491c3e084c941c3e86e55951404",
//       symbol: "sTOG",
//       logo: "https://raw.githubusercontent.com/0G-X/jaine-token-lists/main/assets/mainnet/0x7bbc63d01ca42491c3e084c941c3e86e55951404/stOG.svg",
//       balance: undefined,
//       decimals: 18,
//     },
//     amount: "",
//     balance: "0",
//   },
//   dex: "ZERO_G",
// };

const getDefaultStateValues = (
  currentChain: "0gMainnet" | "0gTestnet"
): FormState => {
  return currentChain === "0gMainnet" ? mainnetDefaults : testnetDefaults;
};

export { testnetDefaults, mainnetDefaults, getDefaultStateValues };

// Keep the old export for backward compatibility, but use mainnet as default

export const defaultStateValues = mainnetDefaults;
