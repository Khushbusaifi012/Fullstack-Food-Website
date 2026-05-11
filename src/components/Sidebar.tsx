import {
  ChevronRight,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Palette,
  Receipt,
  ShoppingBag,
  Star,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import orderfoodThumb from "../assets/orderfood.jpg";
import { HowToOrderCard } from "./HowToOrderCard";

type NavKey =
  | "dashboard"
  | "food-order"
  | "feedback"
  | "message"
  | "history"
  | "payment"
  | "customization";

type SidebarProps = {
  active: NavKey;
  onSelect?: (key: NavKey) => void;
  isLoggedIn: boolean;
  onLogout?: () => void;
};

const items: { key: NavKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "food-order", label: "Food Order", icon: ShoppingBag },
  { key: "feedback", label: "Feedback", icon: Star },
  { key: "message", label: "Message", icon: MessageSquare },
  { key: "history", label: "Order History", icon: Receipt },
  { key: "payment", label: "Payment details", icon: Wallet },
  { key: "customization", label: "Customization", icon: Palette },
];

export function Sidebar({
  active,
  onSelect,
  isLoggedIn,
  onLogout,
}: SidebarProps) {
  const [howToOpen, setHowToOpen] = useState(false);

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 p-4 lg:p-5">
      <div className="relative shrink-0 overflow-hidden rounded-[1.25rem] bg-panel p-4 shadow-soft ring-1 ring-black/5 dark:ring-white/10">
        <div
          className="pointer-events-none absolute -left-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-brand/25 via-orange-200/40 to-transparent blur-2xl"
          aria-hidden
        />
        <p className="relative text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          How to order food?
        </p>
        <div className="relative mt-3 flex items-end gap-2">
          <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-surface shadow-inner ring-1 ring-black/5 dark:ring-white/10">
            <img
              src={orderfoodThumb}
              alt="Order guide preview"
              className="h-full w-full object-cover object-center"
            />
          </div>
          <button
            type="button"
            onClick={() => setHowToOpen(true)}
            className="mb-1 ml-auto flex shrink-0 items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-brand/20 transition hover:brightness-105"
          >
            Learn
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-1">
        {items.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect?.(key)}
              className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium transition ${
                isActive
                  ? "border border-brand/25 bg-brand/10 text-brand"
                  : "text-neutral-600 hover:bg-black/[0.03] dark:text-neutral-400 dark:hover:bg-white/[0.06]"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
              {label}
            </button>
          );
        })}
        {isLoggedIn && onLogout ? (
          <button
            type="button"
            onClick={onLogout}
            className="mt-2 flex items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-neutral-600 transition hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-5 w-5 shrink-0" strokeWidth={2} />
            Log out
          </button>
        ) : null}
      </nav>

      {howToOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            aria-label="Close guide"
            onClick={() => setHowToOpen(false)}
          />
          <div
            className="relative z-[101] w-full max-w-lg max-h-[min(90vh,640px)] overflow-y-auto rounded-2xl bg-panel shadow-2xl ring-1 ring-black/10 dark:ring-white/15"
            role="dialog"
            aria-modal="true"
            aria-labelledby="how-to-order-heading"
          >
            <button
              type="button"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              aria-label="Close"
              onClick={() => setHowToOpen(false)}
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
            <div className="p-4 pt-12 sm:p-5 sm:pt-14">
              <HowToOrderCard embedded />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
