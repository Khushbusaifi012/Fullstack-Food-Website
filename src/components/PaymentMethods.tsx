export type PaymentMethodId = "paypal" | "visa" | "mastercard" | "online";

type PaymentMethodsProps = {
  selected: PaymentMethodId;
  onSelect: (id: PaymentMethodId) => void;
};

const methods: {
  id: PaymentMethodId;
  label: string;
  className: string;
}[] = [
  {
    id: "paypal",
    label: "PayPal",
    className: "bg-[#003087] text-white",
  },
  { id: "visa", label: "Visa", className: "bg-[#1A1F71] text-white" },
  {
    id: "mastercard",
    label: "MC",
    className: "bg-gradient-to-br from-[#EB001B] to-[#F79E1B] text-white",
  },
  {
    id: "online",
    label: "Pay",
    className:
      "bg-neutral-800 text-white ring-1 ring-inset ring-white/10",
  },
];

export function PaymentMethods({ selected, onSelect }: PaymentMethodsProps) {
  return (
    <div>
      <h3 className="text-sm font-extrabold text-neutral-900 dark:text-neutral-100">
        Payment method
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        Pay online when you order — we don&apos;t offer cash on delivery (COD).
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {methods.map((m) => {
          const isSel = selected === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelect(m.id)}
              aria-pressed={isSel}
              className={`flex min-h-[4.5rem] flex-col items-center justify-center rounded-2xl px-2 py-3 text-center text-[10px] font-extrabold uppercase tracking-wide shadow-md transition sm:aspect-[5/3] sm:min-h-0 ${
                m.className
              } ${
                isSel
                  ? "ring-[3px] ring-brand ring-offset-2 ring-offset-neutral-100 scale-[1.02] shadow-lg dark:ring-offset-neutral-950"
                  : "opacity-95 hover:opacity-100 hover:brightness-110 active:scale-[0.98]"
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
