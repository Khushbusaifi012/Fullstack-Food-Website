import { Check } from "lucide-react";
import type { OrderDeliveryMode } from "../lib/orderTracking";
import { getOrderTrackingSnapshot } from "../lib/orderTracking";

type OrderTrackingTimelineProps = {
  status: string;
  deliveryMode: OrderDeliveryMode;
  /** Tighter layout for the post-checkout modal */
  compact?: boolean;
};

export function OrderTrackingTimeline({
  status,
  deliveryMode,
  compact,
}: OrderTrackingTimelineProps) {
  const { steps, phase, isCancelled } = getOrderTrackingSnapshot(
    status,
    deliveryMode,
  );

  if (isCancelled) {
    return (
      <div
        className="rounded-2xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-center text-sm font-semibold text-red-800 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-200"
        role="status"
      >
        This order was cancelled.
      </div>
    );
  }

  const lastIdx = steps.length - 1;
  const barPct =
    lastIdx <= 0 ? 0 : Math.min(100, Math.max(0, (phase / lastIdx) * 100));

  return (
    <div>
      <div
        className={`flex justify-between ${compact ? "px-0" : "px-1"}`}
        aria-hidden
      >
        {steps.map((step, i) => {
          /** Past steps OR the final step when the order has reached “done” phase (avoid showing step count 4 there). */
          const past = i < phase;
          const finalStepComplete = phase === lastIdx && i === lastIdx;
          const completed = past || finalStepComplete;
          const current = i === phase && !finalStepComplete;

          return (
            <div
              key={step.id}
              className="flex flex-col items-center"
              style={{ width: `${100 / steps.length}%` }}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold sm:h-9 sm:w-9 sm:text-xs ${
                  completed
                    ? "bg-brand text-white shadow-md shadow-brand/25"
                    : current
                      ? "bg-brand text-white shadow-lg shadow-brand/35 ring-[3px] ring-brand/30"
                      : "border-2 border-neutral-200 bg-surface text-neutral-400 dark:border-white/15 dark:bg-white/[0.04] dark:text-neutral-500"
                }`}
              >
                {completed ? (
                  <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
                ) : (
                  i + 1
                )}
              </div>
              <p
                className={`mt-2 max-w-[4.8rem] text-center text-[9px] font-bold uppercase leading-tight tracking-wide sm:max-w-none sm:text-[10px] ${
                  i > phase
                    ? "text-neutral-400 dark:text-neutral-500"
                    : "text-neutral-800 dark:text-neutral-100"
                }`}
              >
                {step.label}
              </p>
              {!compact ? (
                <p className="mt-0.5 hidden max-w-[5.5rem] text-center text-[10px] leading-snug text-neutral-500 sm:block dark:text-neutral-400">
                  {step.hint}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div
        className={`mx-auto mt-1 max-w-md ${compact ? "mt-2" : "mt-3"}`}
        aria-label="Overall progress"
      >
        <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand to-brand/80 transition-[width] duration-500 ease-out"
            style={{ width: `${barPct}%` }}
          />
        </div>
      </div>

      {!compact ? (
        <p className="mt-4 text-center text-xs text-neutral-500 dark:text-neutral-400">
          We&apos;ll move these steps along as your order is prepared
          {deliveryMode === "delivery" ? " and delivered" : " and ready for pickup"}.
          Open this order again to see updates.
        </p>
      ) : (
        <p className="mt-3 text-center text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          Track every step anytime in{" "}
          <span className="font-semibold text-neutral-700 dark:text-neutral-300">
            Order history
          </span>
          .
        </p>
      )}
    </div>
  );
}
