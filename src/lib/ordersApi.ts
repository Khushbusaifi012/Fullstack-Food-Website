import type { PaymentMethodId } from "../components/PaymentMethods";
import type { CartLine } from "../context/CartContext";
import { apiFetch } from "./api";

export type CreateOrderBody = {
  lines: Pick<CartLine, "productId" | "name" | "unitPrice" | "quantity">[];
  deliveryMode: "delivery" | "pickup";
  fullName: string;
  phone: string;
  address: string;
  notes: string;
  paymentMethod: PaymentMethodId;
};

export type CreatedOrder = {
  id: string;
  createdAt: string;
  total: number;
  status: string;
};

async function readError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    if (data?.error) return data.error;
  } catch {
    /* ignore */
  }
  if (res.status === 502 || res.status === 503 || res.status === 504) {
    return "API server is not reachable. Run npm run dev:api or npm run dev:full.";
  }
  return `Request failed (${res.status}).`;
}

export async function createOrder(
  token: string,
  body: CreateOrderBody,
): Promise<CreatedOrder> {
  let res: Response;
  try {
    res = await apiFetch("/api/orders", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      json: body,
    });
  } catch (e: unknown) {
    if (e instanceof TypeError) {
      throw new Error(
        "Network error — start the API: npm run dev:api (from the project folder).",
      );
    }
    throw e;
  }
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as { order: CreatedOrder };
  return data.order;
}

export type OrderSummary = {
  id: string;
  createdAt: string;
  status: string;
  total: number;
  deliveryMode: string;
  lineCount: number;
};

export async function fetchMyOrders(token: string): Promise<OrderSummary[]> {
  let res: Response;
  try {
    res = await apiFetch("/api/orders", {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (e: unknown) {
    if (e instanceof TypeError) {
      throw new Error(
        "Network error — start the API: npm run dev:api (from the project folder).",
      );
    }
    throw e;
  }
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as { orders: OrderSummary[] };
  return data.orders;
}

export type OrderLineItem = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
};

export type OrderDetail = {
  id: string;
  userId: number;
  createdAt: string;
  status: string;
  deliveryMode: "delivery" | "pickup";
  fullName: string;
  phone: string;
  address: string;
  notes: string;
  paymentMethod: string;
  subtotal: number;
  tax: number;
  total: number;
  lines: OrderLineItem[];
};

export async function fetchOrderById(
  token: string,
  orderId: string,
): Promise<OrderDetail> {
  let res: Response;
  try {
    res = await apiFetch(`/api/orders/${encodeURIComponent(orderId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (e: unknown) {
    if (e instanceof TypeError) {
      throw new Error(
        "Network error — start the API: npm run dev:api (from the project folder).",
      );
    }
    throw e;
  }
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as { order: OrderDetail };
  return data.order;
}
