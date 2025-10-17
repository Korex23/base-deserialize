import { REDUCER_ACTION_TYPE } from "@/lib/limitorderconstants";

type Token = {
  ca: string;
  ticker: string;
  name: string;
  image: string;
};

type TokenBalanceType = {
  balanceUiAmount?: string;
  mint?: string;
};

type TokenAsset = {
  symbol: string;
  balance?: string | undefined;
  address: string;
  logo?: string;
  decimals?: number;
  usdValue?: number;
};

type FormInputState = {
  token: TokenAsset;
  amount: number | string;
  balance: number | string | undefined;
  usdValue?: number;
};

type FormState = {
  buy: FormInputState;
  sell: FormInputState;
  limitPrice: string;
  expiry: number;
  markup: string;
};

// export interface FormState {
//   sell: {
//     token: TokenAsset;
//     amount: string | number;
//     balance: string | number;
//   };
//   buy: {
//     token: TokenAsset;
//     amount: string | number;
//     balance: string | number;
//   };
//   dex: string;
//   limitPrice: string;
//   expiry: number;
//   markup: string;
// }

export type FormAction =
  | { type: typeof REDUCER_ACTION_TYPE.SELL_AMOUNT; payload: string | number }
  | { type: typeof REDUCER_ACTION_TYPE.BUY_AMOUNT; payload: string | number }
  | { type: typeof REDUCER_ACTION_TYPE.SWAP }
  | { type: typeof REDUCER_ACTION_TYPE.SELL_TOKEN; payload: TokenAsset }
  | { type: typeof REDUCER_ACTION_TYPE.BUY_TOKEN; payload: TokenAsset }
  | { type: typeof REDUCER_ACTION_TYPE.LIMIT_PRICE; payload: string }
  | { type: typeof REDUCER_ACTION_TYPE.EXPIRY; payload: number }
  | { type: typeof REDUCER_ACTION_TYPE.UPDATE_BUY_BALANCE; payload: string }
  | { type: typeof REDUCER_ACTION_TYPE.UPDATE_SELL_BALANCE; payload: string }
  | { type: typeof REDUCER_ACTION_TYPE.MARKUP; payload: string };
