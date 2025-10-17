import { REDUCER_ACTION_TYPE } from "@/lib/constant";
import { FormAction, FormState } from "@/types/swapform";

const reducerAction = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case REDUCER_ACTION_TYPE.SWAP:
      return {
        ...state,
        buy: {
          ...state.buy,
          token: state.sell.token,
          amount: state.sell.amount,
          balance: state.sell.balance,
        },
        sell: {
          ...state.sell,
          token: state.buy.token,
          amount: state.buy.amount,
          balance: state.buy.balance,
        },
      };

    case REDUCER_ACTION_TYPE.SELL_AMOUNT:
      return {
        ...state,
        sell: { ...state.sell, amount: action.payload },
      };

    case REDUCER_ACTION_TYPE.UPDATE_SELL_BALANCE:
      return {
        ...state,
        sell: { ...state.sell, balance: action.payload },
      };
    case REDUCER_ACTION_TYPE.BUY_AMOUNT:
      return {
        ...state,
        buy: { ...state.buy, amount: action.payload },
      };

    case REDUCER_ACTION_TYPE.UPDATE_BUY_BALANCE:
      return {
        ...state,
        buy: { ...state.buy, balance: action.payload },
      };
    case REDUCER_ACTION_TYPE.SELL_TOKEN:
      return {
        ...state,
        sell: { ...state.sell, token: action.payload },
      };
    case REDUCER_ACTION_TYPE.BUY_TOKEN:
      return {
        ...state,
        buy: { ...state.buy, token: action.payload },
      };
    case REDUCER_ACTION_TYPE.SWAP_TX:
      return {
        ...state,
        swap_tx: action.payload,
      };

    case REDUCER_ACTION_TYPE.SWAP_QUOTE:
      return {
        ...state,
        swap_quote: action.payload,
      };

    case REDUCER_ACTION_TYPE.SELECT_DEX_ROUTE:
      return {
        ...state,
        dex: action.payload,
      };

    case REDUCER_ACTION_TYPE.RESET:
      return action.payload;

    case REDUCER_ACTION_TYPE.SLIPPAGE:
      return {
        ...state,
        slippage: action.payload,
      };

    case REDUCER_ACTION_TYPE.BUY_USD_VALUE:
      return {
        ...state,
        buy: { ...state.buy, usdValue: action.payload },
      };

    case REDUCER_ACTION_TYPE.SELL_USD_VALUE:
      return {
        ...state,
        sell: { ...state.sell, usdValue: action.payload },
      };

    default:
      return state;
  }
};

export { reducerAction };
