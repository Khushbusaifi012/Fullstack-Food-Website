import { MessageSquare } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Related order{" "}
                <span className="font-normal normal-case tracking-normal text-neutral-400">(optional)</span>
              </span>
              <div className="relative">
                <select
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="h-12 w-full cursor-pointer appearance-none rounded-2xl border border-black/10 bg-surface py-2 pl-4 pr-10 text-sm font-medium text-neutral-900 outline-none transition focus:border-brand/40 focus:ring-2 focus:ring-brand/25 dark:border-white/[0.1] dark:bg-black/25 dark:text-neutral-100"
                >
                  <option value="">None</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {formatShortDate(o.createdAt)} — {formatInr(o.total)} · {o.id.slice(0, 8)}…
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
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
