import { REDUCER_ACTION_TYPE } from "@/lib/constant";
import { IQuoteReturn } from "deserialize-evm-client-sdk";

type DexIdTypes = "ALL" | "ZERO_G";

type Token = {
  ca: string;
  ticker: string;
  name: string;
  image: string;
};

type TokenAsset = {
  symbol: string;
  balance?: string | undefined;
  address: string;
  logo?: string;
  decimals?: number;
  usdValue?: number;
};

type TokenBalanceType = {
  balanceUiAmount?: string;
  mint?: string;
};

// type TokenType = {
//   address: string;
//   chainId?: number;
//   decimals?: number;
//   name: string;
//   symbol: string;
//   logoURI: string;
//   tokenProgram: string;
//   price?: number;
// };

type FormInputState = {
  token: TokenAsset;
  amount: number | string;
  balance: number | string | undefined;
  usdValue?: number;
};

type FormState = {
  buy: FormInputState;
  sell: FormInputState;
  dex: DexIdTypes;
  swap_quote?: SwapQuoteResponse;
  swap_tx?: string;
  slippage?: number;
};

export interface RoutePlan {
  tokenA: string;
  tokenB: string;
  dexId: string;
  poolAddress: string;
  aToB: boolean;
  fee: number;
}

export interface SwapQuoteResponse {
  tokenA: string;
  tokenB: string;
  amountIn: string;
  amountOut: string;
  tokenPrice: string;
  routePlan: RoutePlan[];
  isNativeIn: boolean;
  dexId: string;
  dexFactory: string;
}

type FormAction =
  | { type: REDUCER_ACTION_TYPE.SWAP }
  | { type: REDUCER_ACTION_TYPE.SELL_AMOUNT; payload: number | string }
  | { type: REDUCER_ACTION_TYPE.BUY_AMOUNT; payload: number | string }
  | { type: REDUCER_ACTION_TYPE.SELL_TOKEN; payload: TokenType }
  | { type: REDUCER_ACTION_TYPE.BUY_TOKEN; payload: TokenType }
  | { type: REDUCER_ACTION_TYPE.SWAP_TX; payload: string }
  | {
      type: REDUCER_ACTION_TYPE.SWAP_QUOTE;
      payload: SwapQuoteResponse | undefined;
    }
  | { type: REDUCER_ACTION_TYPE.UPDATE_BUY_BALANCE; payload: string }
  | { type: REDUCER_ACTION_TYPE.UPDATE_SELL_BALANCE; payload: string }
  | { type: REDUCER_ACTION_TYPE.SELECT_DEX_ROUTE; payload: DexIdTypes }
  | { type: REDUCER_ACTION_TYPE.RESET; payload: FormState }
  | { type: REDUCER_ACTION_TYPE.SLIPPAGE; payload: number }
  | { type: REDUCER_ACTION_TYPE.BUY_USD_VALUE; payload: number }
  | { type: REDUCER_ACTION_TYPE.SELL_USD_VALUE; payload: number };

type InputActionButtonType = "clear" | "max" | "50%";

type TokenData = {
  ca: string;
  ticker: string;
  name: string;
  image: string;
  hasExternalId: boolean;
  isExtraIdSupported: boolean;
  isFiat: boolean;
  featured: boolean;
  isStable: boolean;
  supportsFixedRate: boolean;
  network: string;
  tokenContract: number;
  buy: boolean;
  sell: boolean;
  legacyTicker: string;
};

export interface ScreenerTokenResponse {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  chainId: number;
  dexes: string[];
  lastUpdated: number;
  price: number;
  liquidity: number;
  totalSupply: string ;
  circulatingSupply: string;
  marketCap: number;
  fullyDilutedValuation: number;
  icon?: string;
  volume24h: number;
  volume6h: number;
  volume1h: number;
  volume5m: number;
  txns24h: number;
  buys24h: number;
  sells24h: number;
}
