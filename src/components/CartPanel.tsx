import { Minus, Plus, Receipt, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { CartLine } from "../context/CartContext";
import { formatInr } from "../lib/formatMoney";
import { menuImageFallback } from "../lib/menuImageFallback";
import type { PaymentMethodId } from "./PaymentMethods";
import { PaymentMethods } from "./PaymentMethods";

type CartPanelProps = {
  lines: CartLine[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethodId;
  onPaymentChange: (id: PaymentMethodId) => void;
  onQuantityChange: (productId: string, qty: number) => void;
  onPlaceOrder: () => void;
};

export function CartPanel({
  lines,
  subtotal,
  tax,
  total,
  paymentMethod,
  onPaymentChange,
  onQuantityChange,
  onPlaceOrder,
}: CartPanelProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <div className="shrink-0">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand/15 text-brand">
            <Receipt className="h-5 w-5" strokeWidth={2} />
          </span>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Your invoice
            </h2>
            <p className="mt-0.5 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
              Review totals and pay online when you&apos;re ready
            </p>
          </div>
        </div>
      </div>

      <div className="shrink-0 space-y-4">
        <div className="relative overflow-hidden rounded-2xl border border-black/[0.05] bg-gradient-to-br from-neutral-50/90 via-panel to-panel p-4 shadow-sm dark:border-white/[0.06] dark:from-white/[0.04] dark:via-panel dark:to-panel">
          <div className="absolute inset-y-2 left-0 w-1 rounded-full bg-gradient-to-b from-brand to-brand/50" aria-hidden />
          <div className="space-y-2.5 pl-3.5">
            <Row label="Sub total" value={subtotal} />
            <Row label="Tax (GST)" value={tax} muted />
            <div className="border-t border-black/5 pt-3 dark:border-white/10">
              <Row label="Total payment" value={total} emphasis />
            </div>
          </div>
        </div>

        <PaymentMethods
          selected={paymentMethod}
          onSelect={onPaymentChange}
        />
        <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          Payment is online only when you tap Place Order — we don&apos;t accept cash on
          delivery (COD).
        </p>

        <button
          type="button"
          onClick={onPlaceOrder}
          className="w-full rounded-2xl bg-gradient-to-r from-brand to-brand/90 py-4 text-sm font-bold text-white shadow-lg shadow-brand/35 transition hover:from-brand/95 hover:to-brand/85 hover:shadow-xl hover:shadow-brand/40 active:scale-[0.99]"
        >
          Place an order now
        </button>
      </div>

      <ul className="flex min-h-[min(120px,40vh)] flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {lines.length === 0 ? (
          <li className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 bg-surface/50 px-6 py-10 text-center dark:border-white/10 dark:bg-white/[0.03]">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <ShoppingBag className="h-7 w-7" strokeWidth={1.75} />
            </span>
            <p className="mt-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Your cart is empty
            </p>
            <p className="mt-1 max-w-[14rem] text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
              Browse the menu and tap <span className="font-semibold text-brand">Order Now</span> on
              anything you like.
            </p>
          </li>
        ) : (
          lines.map((line) => (
            <li
              key={line.productId}
              className="flex gap-3 rounded-2xl bg-panel p-2 shadow-soft ring-1 ring-black/[0.04] dark:ring-white/10"
            >
              <CartLineThumb src={line.image} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {line.name}
                </p>
                <p className="text-sm font-bold text-brand">
                  {formatInr(line.unitPrice * line.quantity)}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 bg-panel text-neutral-600 hover:bg-surface dark:border-white/10 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    onClick={() =>
                      onQuantityChange(line.productId, line.quantity - 1)
                    }
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-[1.5rem] text-center text-sm font-semibold dark:text-neutral-200">
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 bg-panel text-neutral-600 hover:bg-surface dark:border-white/10 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    onClick={() =>
                      onQuantityChange(line.productId, line.quantity + 1)
                    }
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                    onClick={() => onQuantityChange(line.productId, 0)}
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function CartLineThumb({ src }: { src: string }) {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <img
      src={imgSrc}
      alt=""
      className="h-14 w-14 shrink-0 rounded-xl object-cover"
      onError={() => setImgSrc(menuImageFallback)}
    />
  );
}

function Row({
  label,
  value,
  muted,
  emphasis,
}: {
  label: string;
  value: number;
  muted?: boolean;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span
        className={
          emphasis
            ? "font-bold text-neutral-900 dark:text-neutral-100"
            : muted
              ? "text-neutral-500 dark:text-neutral-400"
              : "text-neutral-700 dark:text-neutral-300"
        }
      >
        {label}
      </span>
      <span
        className={
          emphasis
            ? "text-lg font-bold text-neutral-900 dark:text-neutral-100"
            : "font-semibold text-neutral-800 dark:text-neutral-200"
        }
      >
        {formatInr(value)}
      </span>
    </div>
  );
}
