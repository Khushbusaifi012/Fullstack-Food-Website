import { Palette } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  loadCustomizationPrefs,
  saveCustomizationPrefs,
  type CustomizationPrefs,
  type SpiceLevel,
} from "../lib/customizationPrefs";

type CustomizationViewProps = {
  onBack: () => void;
};

const spiceOptions: { value: SpiceLevel; label: string }[] = [
  { value: "any", label: "No default" },
  { value: "mild", label: "Mild" },
  { value: "medium", label: "Medium" },
  { value: "hot", label: "Hot" },
];

export function CustomizationView({ onBack }: CustomizationViewProps) {
  const [prefs, setPrefs] = useState<CustomizationPrefs>(() =>
    loadCustomizationPrefs(),
  );
  const [spiceOpen, setSpiceOpen] = useState(false);
  const spiceDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveCustomizationPrefs(prefs);
  }, [prefs]);

  useEffect(() => {
    if (!spiceOpen) return;
    const close = (e: MouseEvent) => {
      if (
        spiceDropdownRef.current &&
        !spiceDropdownRef.current.contains(e.target as Node)
      ) {
        setSpiceOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [spiceOpen]);

  useEffect(() => {
    if (!spiceOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSpiceOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [spiceOpen]);

  function toggle<K extends keyof CustomizationPrefs>(key: K, value: boolean) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }

  const spiceLabel =
    spiceOptions.find((o) => o.value === prefs.spiceDefault)?.label ?? "No default";

  function setSpice(level: SpiceLevel) {
    setPrefs((prev) => ({ ...prev, spiceDefault: level }));
    setSpiceOpen(false);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-4">
      <header className="flex gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-neutral-900 shadow-inner ring-1 ring-black/20 dark:bg-black dark:ring-white/10">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand/30 to-brand/10 text-brand ring-1 ring-brand/25">
            <Palette className="h-5 w-5" strokeWidth={2} />
          </span>
        </div>
        <div className="min-w-0 pt-0.5">
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
            Customization
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            Set preferences we can keep in mind. They are stored on this device only — add
            specifics in <strong className="text-neutral-800 dark:text-neutral-200">Food Order</strong>{" "}
            notes if the kitchen needs exact instructions.
          </p>
        </div>
      </header>

      <section className="rounded-[1.35rem] bg-panel p-5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.1)] ring-1 ring-black/[0.06] dark:shadow-[0_4px_28px_-4px_rgba(0,0,0,0.4)] dark:ring-white/[0.08] sm:p-6">
        <p className="text-sm font-extrabold text-neutral-900 dark:text-neutral-100">
          Dietary & allergies
        </p>
        <ul className="mt-5 space-y-4">
          {(
            [
              ["vegetarianHighlight", "Mostly vegetarian"] as const,
              ["veganHighlight", "Vegan"] as const,
              ["glutenFree", "Gluten-free"] as const,
              ["noNuts", "No nuts / allergy"] as const,
            ] as const
          ).map(([key, label]) => (
            <li key={key}>
              <label className="flex cursor-pointer items-center gap-3.5 rounded-xl py-0.5 transition hover:bg-black/[0.03] dark:hover:bg-white/[0.04]">
                <input
                  type="checkbox"
                  checked={prefs[key]}
                  onChange={(e) => toggle(key, e.target.checked)}
                  className="h-5 w-5 shrink-0 rounded-md border-2 border-black/20 text-brand accent-brand focus:ring-2 focus:ring-brand/30 dark:border-white/25"
                />
                <span className="text-sm font-medium leading-snug text-neutral-700 dark:text-neutral-300">
                  {label}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[1.35rem] bg-panel p-5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.1)] ring-1 ring-black/[0.06] dark:shadow-[0_4px_28px_-4px_rgba(0,0,0,0.4)] dark:ring-white/[0.08] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <span
            className="shrink-0 text-sm font-extrabold text-neutral-900 dark:text-neutral-100"
            id="spice-level-label"
          >
            Default spice level
          </span>
          <div
            ref={spiceDropdownRef}
            className="relative min-w-0 sm:ml-auto sm:w-[min(100%,15rem)]"
          >
            <button
              type="button"
              id="spice-level-trigger"
              aria-haspopup="listbox"
              aria-expanded={spiceOpen}
              aria-labelledby="spice-level-label"
              onClick={() => setSpiceOpen((o) => !o)}
              className="flex h-12 w-full cursor-pointer items-center justify-between gap-2 rounded-full border-2 border-brand/70 bg-surface px-4 text-left text-sm font-semibold text-neutral-900 shadow-sm outline-none transition hover:border-brand hover:bg-black/[0.02] focus-visible:ring-2 focus-visible:ring-brand/35 dark:border-[#c2410c]/80 dark:bg-black/30 dark:text-neutral-100 dark:hover:border-brand dark:hover:bg-white/[0.04]"
            >
              <span className="truncate">{spiceLabel}</span>
              <svg
                className={`h-5 w-5 shrink-0 text-brand transition ${spiceOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {spiceOpen ? (
              <ul
                role="listbox"
                aria-labelledby="spice-level-label"
                className="absolute right-0 top-full z-20 mt-2 w-full min-w-[12rem] overflow-hidden rounded-2xl border border-black/10 bg-neutral-100 py-1 shadow-xl ring-1 ring-black/5 dark:border-white/10 dark:bg-[#2a2a2a] dark:ring-white/5"
              >
                {spiceOptions.map((o) => {
                  const selected = prefs.spiceDefault === o.value;
                  return (
                    <li key={o.value} role="option" aria-selected={selected}>
                      <button
                        type="button"
                        onClick={() => setSpice(o.value)}
                        className={`flex w-full px-4 py-2.5 text-left text-sm font-semibold transition ${
                          selected
                            ? "bg-sky-200/90 text-neutral-900 dark:bg-sky-600/35 dark:text-neutral-50"
                            : "text-neutral-800 hover:bg-black/5 dark:text-neutral-200 dark:hover:bg-white/[0.08]"
                        }`}
                      >
                        {o.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </div>
      </section>

      <button
        type="button"
        onClick={onBack}
        className="rounded-2xl border-2 border-black/[0.12] bg-transparent px-6 py-3 text-sm font-bold text-neutral-800 transition hover:bg-black/[0.03] dark:border-white/[0.15] dark:text-neutral-100 dark:hover:bg-white/[0.06]"
      >
        Back to menu
      </button>
    </div>
  );
}
