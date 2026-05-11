import type { CategoryId } from "../data/menu";
import { categories } from "../data/menu";

type CategoryStripProps = {
  selected: CategoryId;
  onSelect: (id: CategoryId) => void;
};

export function CategoryStrip({ selected, onSelect }: CategoryStripProps) {
  return (
    <section aria-label="Explore categories" className="relative">
      <div className="mb-4">
        <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Explore categories
        </h2>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Tap a category to see dishes
        </p>
      </div>
      <div className="grid grid-cols-5 gap-2 pt-0.5 sm:gap-3">
        {categories.map((c) => {
          const isSel = selected === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={`group flex aspect-square max-h-[5.75rem] w-full flex-col items-center justify-center gap-1.5 rounded-2xl border px-1.5 py-2 shadow-sm transition duration-200 will-change-transform hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 max-sm:max-h-[5rem] max-sm:rounded-xl sm:max-h-[6.5rem] sm:gap-2.5 sm:px-2 sm:py-3 dark:shadow-none ${
                isSel
                  ? "border-brand bg-gradient-to-br from-brand/20 via-brand/[0.08] to-transparent shadow-md shadow-brand/10 ring-2 ring-brand/25 dark:from-brand/25 dark:via-brand/10"
                  : "border-black/[0.06] bg-panel hover:border-brand/35 dark:border-white/[0.08]"
              }`}
            >
              <span
                className={`text-[1.35rem] leading-none transition-transform duration-200 group-hover:scale-110 sm:text-[1.65rem] ${isSel ? "drop-shadow-sm" : ""}`}
                aria-hidden
              >
                {c.emoji}
              </span>
              <span
                className={`line-clamp-2 text-center text-[10px] font-bold leading-tight transition-colors sm:text-xs ${
                  isSel
                    ? "text-brand dark:text-brand"
                    : "text-neutral-700 dark:text-neutral-300"
                }`}
              >
                {c.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
