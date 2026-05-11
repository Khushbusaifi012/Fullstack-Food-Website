import { MapPin, Package, Phone, Store, User } from "lucide-react";
import { useEffect, useState } from "react";
import {
  CHECKOUT_DRAFT_CLEARED_EVENT,
  loadCheckoutDraft,
  saveCheckoutDraft,
} from "../lib/checkoutDraft";
import {
  loadCustomizationPrefs,
  summarizeCustomizationPrefs,
} from "../lib/customizationPrefs";

type OrderMode = "delivery" | "pickup";

type FoodOrderViewProps = {
  userDisplayName?: string;
  cartLineCount: number;
  onGoToMenu: () => void;
};

export function FoodOrderView({
  userDisplayName,
  cartLineCount,
  onGoToMenu,
}: FoodOrderViewProps) {
  const [mode, setMode] = useState<OrderMode>(() =>
    loadCheckoutDraft()?.mode === "pickup" ? "pickup" : "delivery",
  );
  const [fullName, setFullName] = useState(() => {
    const d = loadCheckoutDraft();
    if (d?.fullName) return d.fullName;
    return userDisplayName ?? "";
  });
  const [phone, setPhone] = useState(() => loadCheckoutDraft()?.phone ?? "");
  const [address, setAddress] = useState(
    () => loadCheckoutDraft()?.address ?? "",
  );
  const [notes, setNotes] = useState(() => loadCheckoutDraft()?.notes ?? "");

  useEffect(() => {
    if (!userDisplayName) return;
    setFullName((prev) => (prev.trim() ? prev : userDisplayName));
  }, [userDisplayName]);

  useEffect(() => {
    saveCheckoutDraft({
      mode,
      fullName,
      phone,
      address,
      notes,
    });
  }, [mode, fullName, phone, address, notes]);

  useEffect(() => {
    const reset = () => {
      setMode("delivery");
      setFullName(userDisplayName ?? "");
      setPhone("");
      setAddress("");
      setNotes("");
    };
    window.addEventListener(CHECKOUT_DRAFT_CLEARED_EVENT, reset);
    return () =>
      window.removeEventListener(CHECKOUT_DRAFT_CLEARED_EVENT, reset);
  }, [userDisplayName]);

  const customizationSummary = summarizeCustomizationPrefs(loadCustomizationPrefs());

  return (
    <div className="mx-auto max-w-3xl space-y-7 pb-4">
      <header className="space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">
          Checkout
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-50">
          Food Order
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          Delivery / pickup details and special instructions. Add dishes from the menu on{" "}
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">Dashboard</span>
          , then pay <strong className="text-neutral-900 dark:text-neutral-100">online</strong>{" "}
          from your cart — no COD.
        </p>
      </header>

      {cartLineCount === 0 ? (
        <div className="relative overflow-hidden rounded-[1.35rem] bg-panel p-5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.06] dark:shadow-[0_4px_28px_-4px_rgba(0,0,0,0.45)] dark:ring-white/[0.08]">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand/[0.12] blur-2xl dark:bg-brand/20" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/25 to-brand/10 text-brand shadow-inner ring-1 ring-brand/20">
                <Package className="h-7 w-7" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Your cart is empty
                </p>
                <p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  Open Dashboard, pick a category, and tap Order Now on items you want.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onGoToMenu}
              className="shrink-0 rounded-2xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand/30 transition hover:brightness-110 active:scale-[0.98]"
            >
              Go to menu
            </button>
          </div>
        </div>
      ) : (
        <p className="rounded-2xl border border-brand/20 bg-brand/10 px-4 py-3.5 text-sm leading-relaxed text-brand dark:border-brand/25 dark:bg-brand/[0.12]">
          {cartLineCount} item{cartLineCount === 1 ? "" : "s"} in cart — review totals and pay{" "}
          <strong>online</strong> from <strong>Your Invoice</strong> (cards / PayPal / Pay).
        </p>
      )}

      <section className="rounded-[1.35rem] bg-panel p-5 shadow-soft ring-1 ring-black/[0.05] dark:ring-white/[0.07] sm:p-6">
        <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
          How would you like to receive your order?
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMode("delivery")}
            className={`flex min-h-[3.25rem] flex-col items-center justify-center gap-1 rounded-2xl border-2 px-3 py-3 text-sm font-bold transition sm:flex-row sm:gap-2 ${
              mode === "delivery"
                ? "border-brand bg-brand/10 text-brand shadow-md shadow-brand/15 ring-0 dark:bg-brand/[0.14]"
                : "border-black/[0.08] bg-surface text-neutral-600 hover:border-black/15 dark:border-white/10 dark:text-neutral-400 dark:hover:bg-white/[0.04]"
            }`}
          >
            <MapPin className="h-5 w-5 shrink-0" strokeWidth={2} />
            Delivery
          </button>
          <button
            type="button"
            onClick={() => setMode("pickup")}
            className={`flex min-h-[3.25rem] flex-col items-center justify-center gap-1 rounded-2xl border-2 px-3 py-3 text-sm font-bold transition sm:flex-row sm:gap-2 ${
              mode === "pickup"
                ? "border-brand bg-brand/10 text-brand shadow-md shadow-brand/15 ring-0 dark:bg-brand/[0.14]"
                : "border-black/[0.08] bg-surface text-neutral-600 hover:border-black/15 dark:border-white/10 dark:text-neutral-400 dark:hover:bg-white/[0.04]"
            }`}
          >
            <Store className="h-5 w-5 shrink-0" strokeWidth={2} />
            Pickup
          </button>
        </div>
      </section>

      <section className="rounded-[1.35rem] bg-panel p-5 shadow-soft ring-1 ring-black/[0.05] dark:ring-white/[0.07] sm:p-6">
        <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
          Contact {mode === "delivery" ? "& address" : ""}
        </p>

        <div className="mt-5 space-y-5">
          <label className="block">
            <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              <User className="h-3.5 w-3.5" strokeWidth={2} />
              Full name
            </span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Name on the order"
              autoComplete="name"
              className="h-12 w-full rounded-2xl border border-black/10 bg-surface px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-brand/40 focus:ring-2 focus:ring-brand/25 dark:border-white/[0.1] dark:bg-black/25 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              <Phone className="h-3.5 w-3.5" strokeWidth={2} />
              Phone
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 ..."
              autoComplete="tel"
              className="h-12 w-full rounded-2xl border border-black/10 bg-surface px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-brand/40 focus:ring-2 focus:ring-brand/25 dark:border-white/[0.1] dark:bg-black/25 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            />
          </label>

          {mode === "delivery" ? (
            <label className="block">
              <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
                Delivery address
              </span>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House / flat, street, landmark, city, PIN"
                rows={3}
                autoComplete="street-address"
                className="w-full resize-y rounded-2xl border border-black/10 bg-surface px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-brand/40 focus:ring-2 focus:ring-brand/25 dark:border-white/[0.1] dark:bg-black/25 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              />
            </label>
          ) : (
            <p className="rounded-2xl border border-black/[0.06] bg-surface/80 px-4 py-3 text-sm leading-relaxed text-neutral-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-400">
              Pick up at the restaurant counter. We will use your phone number to notify you when the
              order is ready.
            </p>
          )}

          <label className="block">
            <span className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Cooking / packing notes (optional)
            </span>
            {customizationSummary ? (
                <p className="mb-2 rounded-xl bg-brand/10 px-3 py-2.5 text-xs leading-relaxed text-brand dark:bg-brand/[0.14]">
                  Your saved preferences: {customizationSummary}. Repeat anything critical below for
                  the kitchen.
                </p>
              ) : null}
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Less spicy, no onion, leave at gate"
              rows={2}
              className="w-full resize-y rounded-2xl border border-black/10 bg-surface px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-brand/40 focus:ring-2 focus:ring-brand/25 dark:border-white/[0.1] dark:bg-black/25 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            />
          </label>
        </div>
      </section>

      <button
        type="button"
        onClick={onGoToMenu}
        className="w-full rounded-2xl border-2 border-black/[0.08] bg-transparent py-3.5 text-sm font-bold text-neutral-800 transition hover:bg-black/[0.03] dark:border-white/[0.12] dark:text-neutral-200 dark:hover:bg-white/[0.06] sm:w-auto sm:px-8"
      >
        ← Back to menu (Dashboard)
      </button>
    </div>
  );
}
