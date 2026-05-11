import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { products } from "../data/menu";

export type CartLine = {
  productId: string;
  name: string;
  unitPrice: number;
  image: string;
  quantity: number;
};

/** Approximate GST-style levy on food orders (demo). */
const TAX_RATE = 0.05;
const CART_KEY = "foodislice_cart_inr";

function isCartLine(x: unknown): x is CartLine {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.productId === "string" &&
    typeof o.name === "string" &&
    typeof o.unitPrice === "number" &&
    typeof o.image === "string" &&
    typeof o.quantity === "number" &&
    o.quantity > 0
  );
}

function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCartLine);
  } catch {
    return [];
  }
}

type CartContextValue = {
  lines: CartLine[];
  addItem: (item: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeLine: (productId: string) => void;
  clearCart: () => void;
  taxRate: number;
  subtotal: number;
  tax: number;
  total: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => loadCart());

  /** Refresh cart line images when menu asset URLs change (e.g. dev paths / build hashes). */
  useEffect(() => {
    setLines((prev) => {
      let changed = false;
      const next = prev.map((line) => {
        const product = products.find((p) => p.id === line.productId);
        if (product && product.image !== line.image) {
          changed = true;
          return { ...line, image: product.image };
        }
        return line;
      });
      return changed ? next : prev;
    });
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(lines));
  }, [lines]);

  const addItem = useCallback(
    (item: Omit<CartLine, "quantity"> & { quantity?: number }) => {
      setLines((prev) => {
        const existing = prev.find((l) => l.productId === item.productId);
        const qty = item.quantity ?? 1;
        if (existing) {
          return prev.map((l) =>
            l.productId === item.productId
              ? { ...l, quantity: l.quantity + qty }
              : l,
          );
        }
        return [
          ...prev,
          {
            productId: item.productId,
            name: item.name,
            unitPrice: item.unitPrice,
            image: item.image,
            quantity: qty,
          },
        ];
      });
    },
    [],
  );

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setLines((prev) => {
      if (quantity <= 0) {
        return prev.filter((l) => l.productId !== productId);
      }
      return prev.map((l) =>
        l.productId === productId ? { ...l, quantity } : l,
      );
    });
  }, []);

  const removeLine = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setLines([]);
  }, []);

  const totals = useMemo(() => {
    const subtotal = lines.reduce(
      (sum, l) => sum + l.unitPrice * l.quantity,
      0,
    );
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;
    return { subtotal, tax, total };
  }, [lines]);

  const value = useMemo(
    () => ({
      lines,
      addItem,
      setQuantity,
      removeLine,
      clearCart,
      taxRate: TAX_RATE,
      ...totals,
    }),
    [lines, addItem, setQuantity, removeLine, clearCart, totals],
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
