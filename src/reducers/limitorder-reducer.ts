import { REDUCER_ACTION_TYPE } from "@/lib/limitorderconstants";
import { FormAction, FormState } from "@/types/limit-order";

const reducerAction = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case REDUCER_ACTION_TYPE.SWAP:
      return {
        ...state,
        buy: {
          ...state.buy,
          token: state.sell.token,
          amount: state.sell.amount,
        },
        sell: {
          ...state.sell,
          token: state.buy.token,
          amount: state.buy.amount,
        },
      };
    case REDUCER_ACTION_TYPE.UPDATE_BUY_BALANCE:
      return {
        ...state,
        buy: { ...state.buy, balance: action.payload },
      };
    case REDUCER_ACTION_TYPE.UPDATE_SELL_BALANCE:
      return {
        ...state,
        sell: { ...state.sell, balance: action.payload },
      };
    case REDUCER_ACTION_TYPE.SELL_AMOUNT:
      return {
        ...state,
        sell: { ...state.sell, amount: action.payload },
      };

    case REDUCER_ACTION_TYPE.BUY_AMOUNT:
      return {
        ...state,
        buy: { ...state.buy, amount: action.payload },
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

    case REDUCER_ACTION_TYPE.LIMIT_PRICE:
      return {
        ...state,
        limitPrice: action.payload,
      };

    case REDUCER_ACTION_TYPE.EXPIRY:
      return {
        ...state,
        expiry: action.payload,
      };

    case REDUCER_ACTION_TYPE.MARKUP:
      return {
        ...state,
        markup: action.payload,
      };

    default:
      return state;
  }
};

export { reducerAction };
