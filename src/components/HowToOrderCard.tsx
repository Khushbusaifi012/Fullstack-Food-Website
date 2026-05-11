import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import orderfoodImg from "../assets/orderfood.jpg";

const slides = [
  {
    title: "How to order food?",
    body: "Ordering food from our web app is seamless and delightful — browse the menu, fill your cart, and relax while we get your meal ready.",
  },
  {
    title: "Choose your favorite food",
    body: "Browse our menu and pick what you love.",
  },
  {
    title: "Add to cart",
    body: "Add your selected items to the cart.",
  },
  {
    title: "Enter delivery details",
    body: "Provide your address and contact information.",
  },
  {
    title: "Place order & enjoy",
    body: "Confirm your order and we'll deliver it to you. Sit back, relax and enjoy your meal!",
  },
] as const;

export function HowToOrderCard({ embedded }: { embedded?: boolean } = {}) {
  const [index, setIndex] = useState(0);
  const last = slides.length - 1;

  const prev = () => setIndex((i) => (i === 0 ? last : i - 1));
  const next = () => setIndex((i) => (i === last ? 0 : i + 1));

  return (
    <section
      aria-labelledby="how-to-order-heading"
      className={
        embedded
          ? "rounded-none bg-transparent p-0 shadow-none ring-0"
          : "rounded-2xl bg-panel p-4 shadow-soft ring-1 ring-black/[0.04] sm:p-5 dark:ring-white/10"
      }
    >
      <div className="overflow-hidden rounded-xl bg-[#fef8f0]">
        <img
          src={orderfoodImg}
          alt="How to order food — step-by-step guide"
          className="mx-auto max-h-52 w-full object-contain object-center sm:max-h-56"
          decoding="async"
        />
      </div>

      <div className="mt-4">
        <h2
          id="how-to-order-heading"
          className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-xl"
        >
          {slides[index].title}
        </h2>
        <p className="mt-2 min-h-[3rem] text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 sm:min-h-[3.25rem]">
          {slides[index].body}
        </p>

        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-panel text-neutral-600 shadow-sm transition hover:bg-neutral-50 dark:border-white/10 dark:text-neutral-400 dark:hover:bg-neutral-800"
            aria-label="Previous tip"
            onClick={prev}
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white shadow-md shadow-brand/25 transition hover:brightness-105"
            aria-label="Next tip"
            onClick={next}
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2} />
          </button>
          <span className="ml-auto text-xs font-medium text-neutral-400 dark:text-neutral-500">
            {index + 1} / {slides.length}
          </span>
        </div>
      </div>
    </section>
  );
}
