import { Heart, Star } from "lucide-react";
import { useEffect, useState } from "react";
import type { Product } from "../data/menu";
import { formatInr } from "../lib/formatMoney";
import { menuImageFallback } from "../lib/menuImageFallback";

type ProductCardProps = {
  product: Product;
  onOrderNow: (product: Product) => void;
};

export function ProductCard({ product, onOrderNow }: ProductCardProps) {
  const [selected, setSelected] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.image);

  useEffect(() => {
    setImgSrc(product.image);
  }, [product.id, product.image]);

  const pctOff =
    product.originalPrice > 0 && product.originalPrice > product.price
      ? Math.round(
          (1 - product.price / product.originalPrice) * 100,
        )
      : 0;

  return (
    <article className="group relative flex flex-col rounded-[1.35rem] bg-panel p-3 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.05] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.35)] dark:ring-white/[0.07] dark:hover:shadow-[0_20px_48px_-12px_rgba(0,0,0,0.55)]">
      <div className="relative mb-3 overflow-hidden rounded-2xl bg-surface ring-1 ring-black/[0.04] dark:ring-white/10">
        {pctOff > 0 ? (
          <span className="absolute right-2 top-2 z-10 rounded-lg bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-md">
            {pctOff}% off
          </span>
        ) : null}
        <button
          type="button"
          onClick={() => setSelected((s) => !s)}
          className={`absolute left-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-xl border bg-panel/95 text-sm font-bold shadow-md backdrop-blur-md transition hover:scale-105 ${
            selected
              ? "border-brand text-brand shadow-brand/20"
              : "border-black/10 text-neutral-400 dark:border-white/15 dark:text-neutral-500"
          }`}
          aria-pressed={selected}
          aria-label="Select item"
        >
          {selected ? "✓" : ""}
        </button>
        <img
          src={imgSrc}
          alt=""
          className="aspect-[4/3] w-full object-cover transition duration-500 ease-out group-hover:scale-105"
          loading="lazy"
          onError={() => setImgSrc(menuImageFallback)}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
      </div>
      <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug text-neutral-900 dark:text-neutral-100">
        {product.name}
      </h3>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="text-lg font-bold tabular-nums text-brand">
          {formatInr(product.price)}
        </span>
        <span className="text-sm tabular-nums text-neutral-400 line-through dark:text-neutral-500">
          {formatInr(product.originalPrice)}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400">
        <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
        <span className="font-bold text-neutral-800 dark:text-neutral-200">{product.rating}</span>
        <span className="text-neutral-400 dark:text-neutral-500">({product.reviewsLabel})</span>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setWishlisted((w) => !w)}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition sm:text-sm ${
            wishlisted
              ? "border-brand/40 bg-brand/10 text-brand shadow-inner"
              : "border-black/10 bg-surface/80 text-neutral-700 hover:border-brand/30 hover:bg-surface dark:border-white/10 dark:text-neutral-300 dark:hover:bg-white/[0.06]"
          }`}
        >
          <Heart
            className={`h-4 w-4 ${wishlisted ? "fill-brand text-brand" : ""}`}
            strokeWidth={2}
          />
          Wishlist
        </button>
        <button
          type="button"
          onClick={() => onOrderNow(product)}
          className="flex-[1.25] rounded-xl bg-brand py-2.5 text-xs font-bold text-white shadow-lg shadow-brand/30 transition hover:bg-brand/95 hover:shadow-xl hover:shadow-brand/35 active:scale-[0.98] sm:text-sm"
        >
          Order Now
        </button>
      </div>
    </article>
  );
}
