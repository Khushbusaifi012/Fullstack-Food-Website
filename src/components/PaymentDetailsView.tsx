import { Wallet } from "lucide-react";
import type { PaymentMethodId } from "./PaymentMethods";
import { PaymentMethods } from "./PaymentMethods";

type PaymentDetailsViewProps = {
  paymentMethod: PaymentMethodId;
  onPaymentChange: (id: PaymentMethodId) => void;
  onBack: () => void;
  onGoToOrderHistory: () => void;
};

export function PaymentDetailsView({
  paymentMethod,
  onPaymentChange,
  onBack,
  onGoToOrderHistory,
}: PaymentDetailsViewProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-4">
      <header className="flex gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-neutral-900 shadow-inner ring-1 ring-black/20 dark:bg-black dark:ring-white/10">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand/30 to-brand/10 text-brand ring-1 ring-brand/25">
            <Wallet className="h-5 w-5" strokeWidth={2} />
          </span>
        </div>
        <div className="min-w-0 pt-0.5">
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
            Payment details
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            Choose how you usually pay at checkout. This app does not collect or store card numbers
            — only a method label is saved on this device. Checkout is{" "}
            <strong className="text-neutral-900 dark:text-neutral-200">online only</strong>; we
            don&apos;t offer cash on delivery (COD).
          </p>
        </div>
      </header>

      <div className="rounded-[1.35rem] bg-panel p-5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.1)] ring-1 ring-black/[0.06] dark:shadow-[0_4px_28px_-4px_rgba(0,0,0,0.4)] dark:ring-white/[0.08] sm:p-6">
        <PaymentMethods selected={paymentMethod} onSelect={onPaymentChange} />
        <p className="mt-6 border-t border-black/[0.06] pt-5 text-xs leading-relaxed text-neutral-500 dark:border-white/[0.08] dark:text-neutral-400">
          In a production app, payments would go through a provider (for example Stripe or Razorpay).
          Saved cards and refunds would be managed there, not in this demo.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={onGoToOrderHistory}
          className="rounded-2xl border-2 border-black/[0.12] bg-transparent px-6 py-3 text-sm font-bold text-neutral-800 transition hover:bg-black/[0.03] dark:border-white/[0.15] dark:text-neutral-100 dark:hover:bg-white/[0.06]"
        >
          Order history & receipts
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
  );
}
