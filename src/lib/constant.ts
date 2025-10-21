import { TokenAsset } from "@/types/swapform";

enum REDUCER_ACTION_TYPE {
  SWAP,
  SELL_AMOUNT,
  BUY_AMOUNT,
  SELL_TOKEN,
  BUY_TOKEN,
  SWAP_TX,
  UPDATE_BUY_BALANCE,
  UPDATE_SELL_BALANCE,
  SELECT_DEX_ROUTE,
  SWAP_QUOTE,
  RESET,
  SLIPPAGE,
  BUY_USD_VALUE,
  SELL_USD_VALUE,
}

export const ZeroG_CONTRACT_ADDRESS =
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
export const ZeroG_IMAGE = "/tokens/ethereum.png";

export { REDUCER_ACTION_TYPE };

export const NATIVE_0G_TOKEN: TokenAsset = {
  address: ZeroG_CONTRACT_ADDRESS,
  symbol: "ETH",
  decimals: 18,
  logo: ZeroG_IMAGE,
};

export const DYNAMIC_POINT_LIST = [
  {
    tokens: [
      "So11111111111111111111111111111111111111112",
      "GU7NS9xCwgNPiAdJ69iusFrRfawjDDPjeMBovhV1d4kn",
    ],
    feeRate: 0,
  },
];

export const MAINNET_API_URL = "https://evm-api.deserialize.xyz/BASE";
