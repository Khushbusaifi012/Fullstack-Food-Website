/** Shared document shapes (MongoDB stores the same fields). */

export type DbUser = {
  id: number;
  email: string;
  password_hash: string;
  name: string;
};

export type OrderLine = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
};

export type DbOrder = {
  id: string;
  userId: number;
  createdAt: string;
  status: "placed";
  deliveryMode: "delivery" | "pickup";
  fullName: string;
  phone: string;
  address: string;
  notes: string;
  paymentMethod: string;
  subtotal: number;
  tax: number;
  total: number;
  lines: OrderLine[];
};

export type DbFeedback = {
  id: string;
  userId: number;
  email: string;
  name: string;
  category: string;
  message: string;
  createdAt: string;
};

/** Support / “Message” inbox (separate from feedback). */
export type DbMessage = {
  id: string;
  userId: number;
  email: string;
  name: string;
  subject: string;
  message: string;
  /** Optional link to one of the user’s order IDs. */
  orderId: string;
  createdAt: string;
};

export type AppData = {
  users: DbUser[];
  orders: DbOrder[];
  feedbacks: DbFeedback[];
};
