import { Star } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AuthUser } from "../context/AuthContext";
import { getStoredAuthToken } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import type { FeedbackCategory } from "../lib/feedbackApi";
import { submitFeedback } from "../lib/feedbackApi";

type FeedbackViewProps = {
  user: AuthUser | null;
  onBack: () => void;
};

const categories: { value: FeedbackCategory; label: string }[] = [
  { value: "suggestion", label: "Suggestion" },
  { value: "compliment", label: "Compliment" },
  { value: "bug", label: "Bug / problem" },
  { value: "other", label: "Other" },
];

export function FeedbackView({ user, onBack }: FeedbackViewProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [category, setCategory] = useState<FeedbackCategory>("suggestion");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

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
      await submitFeedback(token, { message: trimmed, category });
      setMessage("");
      showToast("Thanks! Your feedback was saved.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not send feedback.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-4">
      <header className="flex gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-neutral-900 shadow-inner ring-1 ring-black/20 dark:bg-black dark:ring-white/10">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand/30 to-brand/10 text-brand ring-1 ring-brand/25">
            <Star className="h-5 w-5 fill-brand/20" strokeWidth={2} />
          </span>
        </div>
        <div className="min-w-0 pt-0.5">
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
            Feedback
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            Tell us what you think about foodislice, the app, or your orders. Your message is stored
            with your account so we can follow up if needed.
          </p>
        </div>
      </header>

      {!user ? (
        <div className="rounded-[1.35rem] bg-panel p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.06] dark:shadow-[0_4px_28px_-4px_rgba(0,0,0,0.45)] dark:ring-white/[0.08]">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Log in to send feedback.
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
              Topic
            </span>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                className="h-12 w-full cursor-pointer appearance-none rounded-2xl border border-black/10 bg-surface py-2 pl-4 pr-10 text-sm font-medium text-neutral-900 outline-none transition focus:border-brand/40 focus:ring-2 focus:ring-brand/25 dark:border-white/[0.1] dark:bg-black/25 dark:text-neutral-100"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
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
              placeholder="What went well? What should we improve?"
              rows={6}
              className="min-h-[8.5rem] w-full resize-y rounded-2xl border border-black/10 bg-surface px-4 py-3 text-sm leading-relaxed text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-brand/40 focus:ring-2 focus:ring-brand/25 dark:border-white/[0.1] dark:bg-black/25 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            />
          </label>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="submit"
              disabled={sending}
              className="rounded-2xl bg-brand px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand/30 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60 sm:min-w-[10rem]"
            >
              {sending ? "Sending…" : "Send feedback"}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="rounded-2xl border-2 border-black/[0.12] bg-transparent px-6 py-3.5 text-sm font-bold text-neutral-800 transition hover:bg-black/[0.03] dark:border-white/[0.15] dark:text-neutral-100 dark:hover:bg-white/[0.06]"
            >
              Back to menu
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
