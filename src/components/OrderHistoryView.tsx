import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  MapPin,
  Package,
  Phone,
  Receipt,
  StickyNote,
  Truck,
  User,
} from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { AuthUser } from "../context/AuthContext";
import { getStoredAuthToken } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatInr } from "../lib/formatMoney";
import { downloadOrderInvoice } from "../lib/orderInvoice";
import {
  fetchMyOrders,
  fetchOrderById,
  type OrderDetail,
  type OrderSummary,
} from "../lib/ordersApi";

type OrderHistoryViewProps = {
  user: AuthUser | null;
  onBack: () => void;
};

function formatShortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function deliveryLabel(mode: string): string {
  return mode === "pickup" ? "Pickup" : "Delivery";
}

function paymentMethodLabel(id: string): string {
  switch (id) {
    case "online":
    case "wallet":
      return "Pay online";
    case "paypal":
      return "PayPal";
    case "visa":
      return "Visa";
    case "mastercard":
      return "Mastercard";
    default:
      return id;
  }
}

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand/12 text-brand">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </span>
      <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
        {children}
      </h2>
    </div>
  );
}

export function OrderHistoryView({ user, onBack }: OrderHistoryViewProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadList = useCallback(async () => {
    const token = getStoredAuthToken();
    if (!token || !user) return;
    setLoadingList(true);
    try {
      const list = await fetchMyOrders(token);
      setOrders(list);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not load orders.");
    } finally {
      setLoadingList(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  async function openDetail(orderId: string) {
    const token = getStoredAuthToken();
    if (!token) {
      showToast("Please log in again.");
      navigate("/login", { state: { from: "/menu" } });
      return;
    }
    setLoadingDetail(true);
    setDetail(null);
    try {
      const d = await fetchOrderById(token, orderId);
      setDetail(d);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not load order.");
    } finally {
      setLoadingDetail(false);
    }
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl space-y-8 pb-4">
        <header className="flex gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-neutral-900 shadow-inner ring-1 ring-black/20 dark:bg-black dark:ring-white/10">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand/30 to-brand/10 text-brand ring-1 ring-brand/25">
              <Receipt className="h-5 w-5" strokeWidth={2} />
            </span>
          </div>
          <div className="min-w-0 pt-0.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
              Order history
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              Log in to see orders you have placed on this device.
            </p>
          </div>
        </header>
        <div className="rounded-[1.35rem] bg-panel p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.06] dark:shadow-[0_4px_28px_-4px_rgba(0,0,0,0.45)] dark:ring-white/[0.08]">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/login", { state: { from: "/menu" } })}
              className="rounded-2xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand/30 transition hover:brightness-110"
            >
              Log in
            </button>
            <button
              type="button"
              onClick={onBack}
              className="rounded-2xl border-2 border-black/[0.12] bg-transparent px-6 py-3 text-sm font-bold text-neutral-800 transition hover:bg-black/[0.03] dark:border-white/[0.15] dark:text-neutral-100 dark:hover:bg-white/[0.06]"
            >
              Back to menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (detail) {
    const isDelivery = detail.deliveryMode === "delivery";

    return (
      <div className="space-y-5 pb-4">
        <button
          type="button"
          onClick={() => setDetail(null)}
          className="group inline-flex items-center gap-2 rounded-full border border-black/10 bg-panel px-4 py-2 text-sm font-semibold text-neutral-800 shadow-sm transition hover:border-brand/25 hover:bg-brand/5 hover:text-brand dark:border-white/10 dark:text-neutral-200 dark:hover:bg-brand/10"
        >
          <ChevronLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" strokeWidth={2} />
          All orders
        </button>

        <article className="overflow-hidden rounded-3xl bg-panel shadow-[0_24px_48px_-12px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.06] dark:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)] dark:ring-white/10">
          <div className="relative overflow-hidden bg-gradient-to-br from-brand/20 via-brand/[0.07] to-transparent px-5 pb-8 pt-6 sm:px-7 sm:pt-7">
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand/25 blur-3xl"
              aria-hidden
            />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-brand shadow-sm dark:bg-neutral-900/90 dark:text-brand">
                    {detail.status}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.06] px-3 py-1 text-[11px] font-semibold text-neutral-700 dark:bg-white/10 dark:text-neutral-200">
                    {isDelivery ? (
                      <Truck className="h-3.5 w-3.5" strokeWidth={2} />
                    ) : (
                      <Package className="h-3.5 w-3.5" strokeWidth={2} />
                    )}
                    {deliveryLabel(detail.deliveryMode)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {formatShortDate(detail.createdAt)}
                  </p>
                  <p className="mt-1.5 max-w-full break-all font-mono text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-500">
                    ID {detail.id}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(detail.id);
                          showToast("Order ID copied.");
                        } catch {
                          showToast("Could not copy — select the ID and copy manually.");
                        }
                      }}
                      className="text-xs font-semibold text-brand hover:underline"
                    >
                      Copy order ID
                    </button>
                    <span className="text-neutral-300 dark:text-neutral-600" aria-hidden>
                      ·
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await downloadOrderInvoice(detail);
                          showToast("Invoice PDF downloaded.");
                        } catch {
                          showToast("Could not download invoice.");
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-brand/40 bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand transition hover:bg-brand/15 dark:border-brand/30 dark:bg-brand/[0.12]"
                    >
                      <Download className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                      Download invoice
                    </button>
                  </div>
                </div>
              </div>
              <div className="shrink-0 text-left sm:text-right">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
                  Total paid
                </p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
                  {formatInr(detail.total)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8 px-5 py-7 sm:px-7">
            <section className="space-y-4">
              <SectionTitle icon={Package}>Items</SectionTitle>
              <ul className="space-y-2">
                {detail.lines.map((line, i) => (
                  <li
                    key={`${line.productId}-${i}`}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-black/[0.04] bg-surface/80 px-4 py-3 dark:border-white/[0.06] dark:bg-white/[0.03]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {line.name}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                        {formatInr(line.unitPrice)} each
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="flex h-8 min-w-[2rem] items-center justify-center rounded-lg bg-brand/15 text-sm font-bold text-brand">
                        ×{line.quantity}
                      </span>
                      <span className="min-w-[4.5rem] text-right text-base font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
                        {formatInr(line.unitPrice * line.quantity)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="relative overflow-hidden rounded-2xl border border-black/[0.06] bg-gradient-to-br from-neutral-50/90 to-transparent dark:border-white/[0.08] dark:from-white/[0.04] dark:to-transparent">
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-brand to-brand/40" aria-hidden />
              <div className="space-y-3 p-5 pl-6">
                <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-medium text-neutral-800 dark:text-neutral-200">
                    {formatInr(detail.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                  <span>Tax (GST)</span>
                  <span className="tabular-nums font-medium">
                    {formatInr(detail.tax)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-black/5 pt-3 dark:border-white/10">
                  <span className="text-base font-bold text-neutral-900 dark:text-white">
                    Total
                  </span>
                  <span className="text-lg font-bold tabular-nums text-brand">
                    {formatInr(detail.total)}
                  </span>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <SectionTitle icon={User}>Details</SectionTitle>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex gap-3 rounded-2xl border border-black/[0.04] bg-surface/60 p-4 dark:border-white/[0.06] dark:bg-white/[0.03]">
                  <User className="mt-0.5 h-5 w-5 shrink-0 text-brand" strokeWidth={2} />
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      Name
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {detail.fullName}
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3 rounded-2xl border border-black/[0.04] bg-surface/60 p-4 dark:border-white/[0.06] dark:bg-white/[0.03]">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand" strokeWidth={2} />
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      Phone
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {detail.phone}
                    </dd>
                  </div>
                </div>
                {isDelivery && detail.address ? (
                  <div className="flex gap-3 rounded-2xl border border-black/[0.04] bg-surface/60 p-4 sm:col-span-2 dark:border-white/[0.06] dark:bg-white/[0.03]">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand" strokeWidth={2} />
                    <div className="min-w-0 flex-1">
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                        Address
                      </dt>
                      <dd className="mt-1 text-sm font-medium leading-relaxed text-neutral-900 dark:text-neutral-100">
                        {detail.address}
                      </dd>
                    </div>
                  </div>
                ) : null}
                {detail.notes ? (
                  <div className="flex gap-3 rounded-2xl border border-black/[0.04] bg-surface/60 p-4 sm:col-span-2 dark:border-white/[0.06] dark:bg-white/[0.03]">
                    <StickyNote className="mt-0.5 h-5 w-5 shrink-0 text-brand" strokeWidth={2} />
                    <div className="min-w-0 flex-1">
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                        Notes
                      </dt>
                      <dd className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">
                        {detail.notes}
                      </dd>
                    </div>
                  </div>
                ) : null}
                <div className="flex gap-3 rounded-2xl border border-black/[0.04] bg-surface/60 p-4 sm:col-span-2 dark:border-white/[0.06] dark:bg-white/[0.03]">
                  <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-brand" strokeWidth={2} />
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      Payment
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {paymentMethodLabel(detail.paymentMethod)}
                    </dd>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-4">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="flex gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-neutral-900 shadow-inner ring-1 ring-black/20 dark:bg-black dark:ring-white/10">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand/30 to-brand/10 text-brand ring-1 ring-brand/25">
              <Receipt className="h-5 w-5" strokeWidth={2} />
            </span>
          </div>
          <div className="min-w-0 pt-0.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
              Order history
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              Tap an order to see items, totals, and delivery details.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3 sm:justify-end">
          <button
            type="button"
            onClick={() => void loadList()}
            disabled={loadingList}
            className="rounded-2xl border-2 border-black/[0.1] bg-surface/80 px-5 py-2.5 text-sm font-bold text-neutral-800 transition hover:border-black/15 hover:bg-surface disabled:opacity-50 dark:border-white/[0.12] dark:bg-white/[0.05] dark:text-neutral-100 dark:hover:bg-white/[0.08]"
          >
            {loadingList ? "Refreshing…" : "Refresh"}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="rounded-2xl border-2 border-black/[0.1] bg-transparent px-5 py-2.5 text-sm font-bold text-neutral-800 transition hover:bg-black/[0.03] dark:border-white/[0.15] dark:text-neutral-100 dark:hover:bg-white/[0.06]"
          >
            Back to menu
          </button>
        </div>
      </header>

      {loadingList && orders.length === 0 ? (
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="rounded-[1.35rem] bg-panel p-6 text-sm leading-relaxed text-neutral-600 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.06] dark:text-neutral-400 dark:ring-white/[0.08]">
          No orders yet. Add items from the menu and place an order from your cart.
        </p>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => void openDetail(o.id)}
                disabled={loadingDetail}
                className="group relative w-full overflow-hidden rounded-[1.25rem] bg-panel p-0 text-left shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.06] transition hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-8px_rgba(0,0,0,0.16)] hover:ring-brand/30 disabled:opacity-60 disabled:hover:translate-y-0 dark:shadow-[0_8px_28px_-8px_rgba(0,0,0,0.45)] dark:ring-white/[0.08] dark:hover:ring-brand/35"
              >
                <div className="absolute inset-y-2 left-0 w-1 rounded-full bg-gradient-to-b from-brand via-brand to-brand/60" />
                <div className="flex items-stretch py-4 pl-5 pr-4 sm:py-5 sm:pl-6 sm:pr-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="rounded-lg bg-brand px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm shadow-brand/20">
                        {o.status}
                      </span>
                      <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                        {deliveryLabel(o.deliveryMode)}
                      </span>
                    </div>
                    <p className="mt-3 text-base font-bold text-neutral-900 dark:text-neutral-50">
                      {formatShortDate(o.createdAt)}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      {o.lineCount} item{o.lineCount === 1 ? "" : "s"} · Ref{" "}
                      <span className="font-mono text-neutral-600 dark:text-neutral-300">{o.id.slice(0, 8)}</span>…
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end justify-between gap-3 pl-3">
                    <ChevronRight
                      className="h-5 w-5 text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-brand dark:text-neutral-500"
                      strokeWidth={2}
                    />
                    <p className="text-lg font-extrabold tabular-nums tracking-tight text-neutral-900 dark:text-white">
                      {formatInr(o.total)}
                    </p>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {loadingDetail ? (
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Opening order…</p>
      ) : null}
    </div>
  );
}
