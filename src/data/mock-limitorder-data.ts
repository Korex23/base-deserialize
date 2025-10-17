import { FormState } from "@/types/limit-order";

const defaultStateValues: FormState = {
  sell: {
    token: {
      address: "64mggk2nXg6vHC1qCdsZdEFzd5QGN4id54Vbho4PswCF",
      symbol: "BITZ",
      name: "BITZ",
      logoURI: "https://powpow.app/assets/icon.png",
      tokenProgram: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
    },
    amount: "1",
    balance: 0,
  },
  buy: {
    token: {
      address: "AKEWE7Bgh87GPp171b4cJPSSZfmZwQ3KaqYqXoKLNAEE",
      symbol: "USDC",
      name: "USD Coin",
      logoURI:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
      tokenProgram: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
    },
    amount: "",
    balance: 0,
  },
  limitPrice: "",
  expiry: 0,
  dex: "UMBRA",
  markup: "",
};

export { defaultStateValues };
