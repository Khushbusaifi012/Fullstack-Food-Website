import { ChevronDown, MessageSquare } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AuthUser } from "../context/AuthContext";
import { getStoredAuthToken } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatInr } from "../lib/formatMoney";
import {
  fetchMyMessages,
  submitSupportMessage,
  type SupportMessage,
} from "../lib/messagesApi";
import { fetchMyOrders, type OrderSummary } from "../lib/ordersApi";

type MessageViewProps = {
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

function orderRowLabel(o: OrderSummary): string {
  return `${formatShortDate(o.createdAt)} — ${formatInr(o.total)} · ${o.id.slice(0, 8)}…`;
}

export function MessageView({ user, onBack }: MessageViewProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState("");
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [history, setHistory] = useState<SupportMessage[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [sending, setSending] = useState(false);
  const [orderMenuOpen, setOrderMenuOpen] = useState(false);
  const orderPickerRef = useRef<HTMLDivElement>(null);

  const relatedOrderTriggerLabel =
    orderId === ""
      ? "None"
      : (() => {
          const hit = orders.find((x) => x.id === orderId);
          return hit ? orderRowLabel(hit) : `Order ${orderId.slice(0, 8)}…`;
        })();

  const loadData = useCallback(async () => {
    const token = getStoredAuthToken();
    if (!token || !user) return;
    setLoadingList(true);
    try {
      const [msgs, ords] = await Promise.all([
        fetchMyMessages(token),
        fetchMyOrders(token),
      ]);
      setHistory(msgs);
      setOrders(ords);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not load messages.");
    } finally {
      setLoadingList(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!orderMenuOpen) return;
    function onPointerDown(e: PointerEvent) {
      const el = orderPickerRef.current;
      if (el && !el.contains(e.target as Node)) {
        setOrderMenuOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOrderMenuOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [orderMenuOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      navigate("/login", { state: { from: "/menu" } });
      return;
    }
    const token = getStoredAuthToken();
    if (!token) {
      showToast("Please log in again.");
      navigate("/login", { state: { from: "/menu" } });
      return;
    }
    const trimmed = message.trim();
    if (trimmed.length < 5) {
      showToast("Please write a bit more (at least 5 characters).");
      return;
    }
    setSending(true);
    try {
      await submitSupportMessage(token, {
        subject: subject.trim() || undefined,
        message: trimmed,
        orderId: orderId || undefined,
      });
      setMessage("");
      setSubject("");
      setOrderId("");
      showToast("Message sent. We’ll get back to you if needed.");
      await loadData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-4">
      <header className="flex gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-neutral-900 shadow-inner ring-1 ring-black/20 dark:bg-black dark:ring-white/10">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand/30 to-brand/10 text-brand ring-1 ring-brand/25">
            <MessageSquare className="h-5 w-5" strokeWidth={2} />
          </span>
        </div>
        <div className="min-w-0 pt-0.5">
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
            Message
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            Quick note to support — delivery issues, changes to an order, or anything urgent. Optional:
            link a recent order so we can find you faster.
          </p>
        </div>
      </header>

      {!user ? (
        <div className="rounded-[1.35rem] bg-panel p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.06] dark:shadow-[0_4px_28px_-4px_rgba(0,0,0,0.45)] dark:ring-white/[0.08]">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Log in to send a message.
          </p>
          <button
            type="button"
            onClick={() => navigate("/login", { state: { from: "/menu" } })}
            className="mt-4 rounded-2xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand/30 transition hover:brightness-110"
          >
            Log in
          </button>
        </div>
      ) : (
        <>
          <form
            onSubmit={handleSubmit}
            className="rounded-[1.35rem] bg-panel p-5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.1)] ring-1 ring-black/[0.06] dark:shadow-[0_4px_28px_-4px_rgba(0,0,0,0.4)] dark:ring-white/[0.08] sm:p-6"
          >
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Signed in as{" "}
              <span className="font-bold text-neutral-900 dark:text-neutral-100">{user.name}</span>
            </p>

            <label className="mt-6 block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Subject <span className="font-normal normal-case tracking-normal text-neutral-400">(optional)</span>
              </span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Late delivery — Sector 4"
                maxLength={120}
                className="h-12 w-full rounded-2xl border border-black/10 bg-surface px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-brand/40 focus:ring-2 focus:ring-brand/25 dark:border-white/[0.1] dark:bg-black/25 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              />
            </label>

            <label className="mt-5 block">
              <span
                id="message-related-order-label"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
              >
                Related order{" "}
                <span className="font-normal normal-case tracking-normal text-neutral-400">(optional)</span>
              </span>
              <div ref={orderPickerRef} className="relative">
                <button
                  type="button"
                  id="message-related-order-trigger"
                  aria-haspopup="listbox"
                  aria-expanded={orderMenuOpen}
                  aria-labelledby="message-related-order-label"
                  disabled={loadingList}
                  onClick={() => setOrderMenuOpen((o) => !o)}
                  className="flex h-12 w-full cursor-pointer items-center justify-between gap-2 rounded-2xl border border-black/10 bg-surface px-4 py-2 text-left text-sm font-medium text-neutral-900 outline-none transition hover:border-black/15 focus-visible:border-brand/40 focus-visible:ring-2 focus-visible:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/[0.1] dark:bg-black/25 dark:text-neutral-100 dark:hover:border-white/[0.14]"
                >
                  <span className="min-w-0 truncate">{relatedOrderTriggerLabel}</span>
                  <ChevronDown
                    aria-hidden
                    className={`h-5 w-5 shrink-0 text-neutral-400 transition-transform dark:text-neutral-500 ${orderMenuOpen ? "rotate-180" : ""}`}
                    strokeWidth={2}
                  />
                </button>
                {orderMenuOpen ? (
                  <ul
                    role="listbox"
                    aria-labelledby="message-related-order-label"
                    className="absolute left-0 right-0 top-full z-[100] mt-1.5 max-h-60 overflow-y-auto overflow-x-hidden rounded-2xl border border-black/10 bg-surface py-1 shadow-xl shadow-black/10 ring-1 ring-black/[0.04] dark:border-white/[0.12] dark:bg-neutral-950 dark:shadow-black/40 dark:ring-white/[0.06]"
                  >
                    <li role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={orderId === ""}
                        className={`flex w-full items-center px-4 py-2.5 text-left text-sm font-medium transition ${
                          orderId === ""
                            ? "bg-brand/15 text-neutral-900 dark:bg-brand/20 dark:text-neutral-50"
                            : "text-neutral-800 hover:bg-black/[0.04] dark:text-neutral-200 dark:hover:bg-white/[0.06]"
                        }`}
                        onClick={() => {
                          setOrderId("");
                          setOrderMenuOpen(false);
                        }}
                      >
                        None
                      </button>
                    </li>
                    {orders.map((o) => {
                      const selected = orderId === o.id;
                      return (
                        <li key={o.id} role="presentation">
                          <button
                            type="button"
                            role="option"
                            aria-selected={selected}
                            className={`flex w-full items-center px-4 py-2.5 text-left text-sm font-medium transition ${
                              selected
                                ? "bg-brand/15 text-neutral-900 dark:bg-brand/20 dark:text-neutral-50"
                                : "text-neutral-800 hover:bg-black/[0.04] dark:text-neutral-200 dark:hover:bg-white/[0.06]"
                            }`}
                            onClick={() => {
                              setOrderId(o.id);
                              setOrderMenuOpen(false);
                            }}
                          >
                            {orderRowLabel(o)}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            </label>

            <label className="mt-5 block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Your message
              </span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What do you need help with?"
                rows={6}
                className="min-h-[8.5rem] w-full resize-y rounded-2xl border border-black/10 bg-surface px-4 py-3 text-sm leading-relaxed text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-brand/40 focus:ring-2 focus:ring-brand/25 dark:border-white/[0.1] dark:bg-black/25 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              />
            </label>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-2xl bg-brand px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand/30 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60 sm:w-auto sm:min-w-[12rem]"
              >
                {sending ? "Sending…" : "Send message"}
              </button>
              <button
                type="button"
                onClick={onBack}
                className="w-full rounded-2xl border-2 border-black/[0.12] bg-transparent px-6 py-3.5 text-sm font-bold text-neutral-800 transition hover:bg-black/[0.03] dark:border-white/[0.15] dark:text-neutral-100 dark:hover:bg-white/[0.06] sm:w-auto"
              >
                Back to menu
              </button>
            </div>
          </form>

          <section className="space-y-4">
            <h2 className="text-lg font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
              Your messages
            </h2>
            {loadingList ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading…</p>
            ) : history.length === 0 ? (
              <p className="rounded-[1.35rem] bg-panel p-5 text-sm leading-relaxed text-neutral-600 shadow-soft ring-1 ring-black/[0.06] dark:text-neutral-400 dark:ring-white/[0.08]">
                No messages yet. Send one above if you need help.
              </p>
            ) : (
              <ul className="space-y-3">
                {history.map((m) => (
                  <li
                    key={m.id}
                    className="rounded-[1.25rem] bg-panel p-4 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.05] dark:shadow-none dark:ring-white/[0.08]"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        {formatShortDate(m.createdAt)}
                      </span>
                      {m.orderId ? (
                        <span className="rounded-lg bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand dark:bg-brand/[0.14]">
                          Order {m.orderId.slice(0, 8)}…
                        </span>
                      ) : null}
                    </div>
                    {m.subject ? (
                      <p className="mt-2 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                        {m.subject}
                      </p>
                    ) : null}
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                      {m.message}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
