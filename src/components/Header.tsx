import {
  Menu,
  Moon,
  Pizza,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sun,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

type HeaderProps = {
  onOpenNav: () => void;
  onOpenCart: () => void;
  userName?: string;
  isLoggedIn: boolean;
  menuSearch: string;
  onMenuSearchChange: (value: string) => void;
  onOpenFilters: () => void;
};

function initialLetter(displayName: string): string {
  const t = displayName.trim();
  if (!t) return "?";
  const char = [...t][0];
  return char ? char.toUpperCase() : "?";
}

export function Header({
  onOpenNav,
  onOpenCart,
  userName = "Guest",
  isLoggedIn,
  menuSearch,
  onMenuSearchChange,
  onOpenFilters,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-black/5 bg-panel/90 px-4 py-3 shadow-sm backdrop-blur-lg backdrop-saturate-150 dark:border-white/10 dark:bg-panel/88 supports-[backdrop-filter]:bg-panel/75 dark:supports-[backdrop-filter]:bg-panel/72 lg:px-6">
      <button
        type="button"
        onClick={onOpenNav}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Link
        to="/menu"
        className="flex shrink-0 items-center gap-2 rounded-xl outline-none ring-brand/30 focus-visible:ring-2"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <Pizza className="h-5 w-5" strokeWidth={2.25} />
        </span>
        <span className="text-xl font-bold tracking-tight text-brand">
          foodislice
        </span>
      </Link>

      <div className="mx-auto hidden min-w-0 max-w-xl flex-1 items-center gap-2 md:flex">
        <label className="sr-only" htmlFor="search-food">
          Search food
        </label>
        <div className="relative flex min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            id="search-food"
            value={menuSearch}
            onChange={(e) => onMenuSearchChange(e.target.value)}
            placeholder="Search food."
            autoComplete="off"
            className="h-11 w-full rounded-2xl border border-black/5 bg-surface pl-10 pr-4 text-sm text-neutral-900 outline-none ring-brand/30 placeholder:text-neutral-400 focus:ring-2 dark:border-white/10 dark:text-neutral-100"
          />
        </div>
        <button
          type="button"
          onClick={onOpenFilters}
          className="flex h-11 shrink-0 items-center gap-2 rounded-2xl bg-brand px-5 text-sm font-semibold text-white shadow-md shadow-brand/25 transition hover:bg-brand/95"
          aria-label="Open filters and sort"
          aria-haspopup="dialog"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter
        </button>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          aria-pressed={theme === "dark"}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" strokeWidth={2} />
          ) : (
            <Moon className="h-5 w-5" strokeWidth={2} />
          )}
        </button>

        <button
          type="button"
          onClick={onOpenCart}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/5 bg-panel text-neutral-700 shadow-soft transition hover:bg-surface lg:hidden dark:border-white/10 dark:text-neutral-200 dark:hover:bg-neutral-800"
          aria-label="Open cart"
        >
          <ShoppingBag className="h-5 w-5 text-brand" strokeWidth={2} />
        </button>

        {isLoggedIn ? (
          <div className="hidden items-center gap-2 rounded-2xl border border-black/5 bg-panel px-2 py-1.5 shadow-soft dark:border-white/10 sm:flex">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-sm font-bold uppercase text-brand"
              aria-hidden
            >
              {initialLetter(userName)}
            </div>
            <span className="hidden max-w-[10rem] truncate pr-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200 md:inline">
              {userName.trim() || "Guest"}
            </span>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/login"
              state={{ from: "/menu" }}
              className="rounded-xl px-3 py-2 text-xs font-semibold text-neutral-700 ring-1 ring-black/10 hover:bg-surface dark:text-neutral-200 dark:ring-white/15 dark:hover:bg-neutral-800 sm:text-sm"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="rounded-xl bg-brand px-3 py-2 text-xs font-semibold text-white shadow-md shadow-brand/25 hover:bg-brand/95 sm:text-sm"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
