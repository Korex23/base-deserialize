"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  ReactNode,
  useMemo,
} from "react";
import { z } from "zod";

// --- API Base ---
const API_BASE = "https://api-limit.deserialize.xyz";

// --- Zod Schemas matching backend ---
const InitOrderSchema = z.object({
  publicKey: z.string(),
  tokenA: z.string(),
  tokenB: z.string(),
  amount: z.string(),
});

const CreateOrderSchema = z.object({
  order: z.object({
    publicKey: z.string(),
    tokenA: z.string(),
    tokenB: z.string(),
    price: z.string(),
    expiry: z.number(),
    amount: z.string(),
    amountOut: z.string(),
  }),
  signedDepositTransaction: z.string(),
});

const InitCancelSchema = z.object({
  publicKey: z.string(),
  orderId: z.string(),
});

const CancelOrderSchema = z.object({
  signature: z.string(),
  publicKey: z.string(),
  orderId: z.string(),
});

const initCancelAllLimitOrderOfATokenSchema = z.object({
  token: z.string(),
  publicKey: z.string(),
});

const CancelAllTokenLimitOrderSchema = z.object({
  signature: z.string(),
  publicKey: z.string(),
  token: z.string(),
});

// --- Types ---
type InitOrderBody = z.infer<typeof InitOrderSchema>;
type CreateOrderBody = z.infer<typeof CreateOrderSchema>;
type InitCancelBody = z.infer<typeof InitCancelSchema>;
type CancelOrderBody = z.infer<typeof CancelOrderSchema>;
type InitCancelTokenBody = z.infer<
  typeof initCancelAllLimitOrderOfATokenSchema
>;
type CancelTokenBody = z.infer<typeof CancelAllTokenLimitOrderSchema>;

// Response types remain unchanged
interface InitOrderResponse {
  status: "ok";
  data: { serializedTransaction: string };
}

interface CreateOrderResponse {
  status: "ok";
  data: {
    order: {
      id: string;
      status: "pending" | "open" | "filled" | "cancelled" | "expired";
      tokenA: string;
      tokenB: string;
      price: number;
      expiry: number;
      amount: number;
      updatedAt: string;
    };
    depositSignature: string;
  };
}

interface InitCancelResponse {
  data: { messageToSign: string };
}

interface CancelOrderResponse {
  data: { signature: string };
}

interface InitCancelTokenResponse {
  data: { messageToSign: string };
}

interface CancelTokenResponse {
  data: { signature: string };
}

export interface Order {
  id: string;
  tokenA: string;
  tokenB: string;
  price: number;
  amount: number;
  amountOut: number;
  status: string;
  expiry: Date;
  depositSignature: string;
  executionSignature: string;
  createdAt: string;
  updatedAt: string;
  refundTrxSignature: string | null;
}

interface GetOrdersByIdResponse {
  data: { order: Order };
}

interface GetOrdersResponse {
  data: Order[];
}

interface OrderServiceContextType {
  initOrder: (body: InitOrderBody) => Promise<InitOrderResponse>;
  createOrder: (body: CreateOrderBody) => Promise<CreateOrderResponse>;
  initCancel: (body: InitCancelBody) => Promise<InitCancelResponse>;
  cancelOrder: (body: CancelOrderBody) => Promise<CancelOrderResponse>;
  getOrdersByWallet: (publicKey: string) => Promise<GetOrdersResponse>;
  getOrdersById: (orderId: string) => Promise<GetOrdersByIdResponse>;
  initCancelAllTokenOrders: (
    body: InitCancelTokenBody
  ) => Promise<InitCancelTokenResponse>;
  cancelAllTokenOrders: (body: CancelTokenBody) => Promise<CancelTokenResponse>;
}

// --- Context ---
const OrderServiceContext = createContext<OrderServiceContextType | null>(null);

// --- Provider ---
export const OrderServiceProvider = ({ children }: { children: ReactNode }) => {
  const post = useCallback(
    async <T,>(url: string, body: unknown): Promise<T> => {
      const res = await fetch(`${API_BASE}${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message || `POST ${url} failed with status ${res.status}`
        );
      }
      return res.json();
    },
    []
  );

  const get = useCallback(
    async <T,>(url: string, params: Record<string, string>): Promise<T> => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}${url}?${query}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message || `GET ${url} failed with status ${res.status}`
        );
      }
      return res.json();
    },
    []
  );

  const initOrder = useCallback(
    async (body: InitOrderBody) => {
      const parsed = InitOrderSchema.parse(body);
      return post<InitOrderResponse>("/initOrder", {
        ...parsed,
        amount: parsed.amount.toString(), // send as string to match backend
      });
    },
    [post]
  );

  const createOrder = useCallback(
    async (body: CreateOrderBody) => {
      CreateOrderSchema.parse(body);
      return post<CreateOrderResponse>("/createOrder", body);
    },
    [post]
  );

  const initCancel = useCallback(
    async (body: InitCancelBody) => {
      InitCancelSchema.parse(body);
      return post<InitCancelResponse>("/initCancelOrder", body);
    },
    [post]
  );

  const cancelOrder = useCallback(
    async (body: CancelOrderBody) => {
      CancelOrderSchema.parse(body);
      return post<CancelOrderResponse>("/cancelOrder", body);
    },
    [post]
  );

  const getOrdersByWallet = useCallback(
    (publicKey: string) => {
      return get<GetOrdersResponse>(`/getOrdersByWallet/${publicKey}`, {});
    },
    [get]
  );

  const getOrdersById = useCallback(
    (orderId: string) => {
      return get<GetOrdersByIdResponse>(`/getOrderById/${orderId}`, {});
    },
    [get]
  );

  const initCancelAllTokenOrders = useCallback(
    (body: InitCancelTokenBody) => {
      initCancelAllLimitOrderOfATokenSchema.parse(body);
      return post<InitCancelTokenResponse>(
        "/initCancelAllLimitOrderOfAToken",
        body
      );
    },
    [post]
  );

  const cancelAllTokenOrders = useCallback(
    (body: CancelTokenBody) => {
      CancelAllTokenLimitOrderSchema.parse(body);
      return post<CancelTokenResponse>("/cancelAllTokenLimitOrder", body);
    },
    [post]
  );

  const contextValue = useMemo(
    () => ({
      initOrder,
      createOrder,
      initCancel,
      cancelOrder,
      getOrdersByWallet,
      getOrdersById,
      cancelAllTokenOrders,
      initCancelAllTokenOrders,
    }),
    [
      initOrder,
      createOrder,
      initCancel,
      cancelOrder,
      getOrdersByWallet,
      getOrdersById,
      cancelAllTokenOrders,
      initCancelAllTokenOrders,
    ]
  );

  return (
    <OrderServiceContext.Provider value={contextValue}>
      {children}
    </OrderServiceContext.Provider>
  );
};

// --- Hook to use in components ---
export const useOrderService = (): OrderServiceContextType => {
  const context = useContext(OrderServiceContext);
  if (!context) {
    throw new Error(
      "useOrderService must be used within an OrderServiceProvider"
    );
  }
  return context;
};
