import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartPanel } from "../components/CartPanel";
import { CategoryStrip } from "../components/CategoryStrip";
import { CustomizationView } from "../components/CustomizationView";
import { FeedbackView } from "../components/FeedbackView";
import { FoodOrderView } from "../components/FoodOrderView";
import { MessageView } from "../components/MessageView";
import { OrderHistoryView } from "../components/OrderHistoryView";
import { PaymentDetailsView } from "../components/PaymentDetailsView";
import { Header } from "../components/Header";
import type { PaymentMethodId } from "../components/PaymentMethods";
import { ProductCard } from "../components/ProductCard";
import { Sidebar } from "../components/Sidebar";
import { useAuth, getStoredAuthToken } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import {
  CHECKOUT_DRAFT_CLEARED_EVENT,
  clearCheckoutDraft,
  loadCheckoutDraft,
} from "../lib/checkoutDraft";
import { formatInr } from "../lib/formatMoney";
import { createOrder } from "../lib/ordersApi";
import {
  loadPaymentPreference,
  savePaymentPreference,
} from "../lib/paymentPreference";
import type { CategoryId, MenuTab } from "../data/menu";
import { products } from "../data/menu";

type MenuSortId = "default" | "price-asc" | "price-desc" | "name";

const MENU_SORT_OPTIONS: { id: MenuSortId; label: string; description: string }[] = [
  { id: "default", label: "Default", description: "Same order as the menu" },
  { id: "price-asc", label: "Price · low to high", description: "Cheapest first" },
  { id: "price-desc", label: "Price · high to low", description: "Premium first" },
  { id: "name", label: "Name A–Z", description: "Alphabetical" },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const isLoggedIn = !!user;

  const [category, setCategory] = useState<CategoryId>("burger");
  const [tab, setTab] = useState<MenuTab>("popular");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>(
    () => loadPaymentPreference() ?? "mastercard",
  );

  function setPaymentAndPersist(id: PaymentMethodId) {
    setPaymentMethod(id);
    savePaymentPreference(id);
  }
  const [navActive, setNavActive] = useState<
    | "dashboard"
    | "food-order"
    | "feedback"
    | "message"
    | "history"
    | "payment"
    | "customization"
  >("dashboard");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuSearch, setMenuSearch] = useState("");
  const [menuSort, setMenuSort] = useState<MenuSortId>("default");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const cart = useCart();

  const filtered = useMemo(() => {
    const q = menuSearch.trim().toLowerCase();
    if (q) {
      return products.filter((p) => p.name.toLowerCase().includes(q));
    }
    return products.filter((p) => {
      if (p.category !== category) return false;
      if (
        category === "noodles" ||
        category === "hotdog" ||
        category === "icecream" ||
        category === "momos" ||
        category === "riceMeals"
      )
        return true;
      return p.tab === tab;
    });
  }, [category, tab, menuSearch]);

  const displayProducts = useMemo(() => {
    const items = [...filtered];
    switch (menuSort) {
      case "price-asc":
        items.sort((a, b) => a.price - b.price || a.name.localeCompare(b.name));
        break;
      case "price-desc":
        items.sort((a, b) => b.price - a.price || a.name.localeCompare(b.name));
        break;
      case "name":
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    return items;
  }, [filtered, menuSort]);

  useEffect(() => {
    if (!filterSheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFilterSheetOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [filterSheetOpen]);

  const cartAside = (
    <CartPanel
      lines={cart.lines}
      subtotal={cart.subtotal}
      tax={cart.tax}
      total={cart.total}
      paymentMethod={paymentMethod}
      onPaymentChange={setPaymentAndPersist}
      onQuantityChange={cart.setQuantity}
      onPlaceOrder={async () => {
        if (!user) {
          setCartOpen(false);
          navigate("/login", { state: { from: "/menu" } });
          return;
        }
        if (cart.lines.length === 0) {
          showToast("Your cart is empty.");
          return;
        }
        const token = getStoredAuthToken();
        if (!token) {
          showToast("Please log in again.");
          navigate("/login", { state: { from: "/menu" } });
          return;
        }
        const draft = loadCheckoutDraft();
        const fullName = (draft?.fullName ?? user.name).trim();
        const phone = (draft?.phone ?? "").trim();
        const address = (draft?.address ?? "").trim();
        const notes = (draft?.notes ?? "").trim();
        const deliveryMode = draft?.mode === "pickup" ? "pickup" : "delivery";
        if (!fullName) {
          showToast("Enter your name on Food Order before placing the order.");
          setNavActive("food-order");
          return;
        }
        if (!phone) {
          showToast("Enter your phone on Food Order before placing the order.");
          setNavActive("food-order");
          return;
        }
        if (deliveryMode === "delivery" && !address) {
          showToast("Enter your delivery address on Food Order.");
          setNavActive("food-order");
          return;
        }
        try {
          const order = await createOrder(token, {
            lines: cart.lines.map(
              ({ productId, name, unitPrice, quantity }) => ({
                productId,
                name,
                unitPrice,
                quantity,
              }),
            ),
            deliveryMode,
            fullName,
            phone,
            address,
            notes,
            paymentMethod,
          });
          clearCheckoutDraft();
          window.dispatchEvent(new Event(CHECKOUT_DRAFT_CLEARED_EVENT));
          cart.clearCart();
          setCartOpen(false);
          showToast(
            `Order placed — ${formatInr(order.total)} (ref ${order.id.slice(0, 8)}…)`,
          );
        } catch (e) {
          showToast(e instanceof Error ? e.message : "Could not place order.");
        }
      }}
    />
  );

  return (
    <div className="flex min-h-screen flex-col bg-surface font-sans text-neutral-900 dark:text-neutral-100">
      <Header
        onOpenNav={() => setSidebarOpen(true)}
        onOpenCart={() => setCartOpen(true)}
        userName={user?.name}
        isLoggedIn={isLoggedIn}
        menuSearch={menuSearch}
        onMenuSearchChange={setMenuSearch}
        onOpenFilters={() => setFilterSheetOpen(true)}
      />

      {/* Mobile search */}
      <div className="border-b border-black/5 bg-panel px-4 py-3 dark:border-white/10 md:hidden">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <label className="sr-only" htmlFor="search-food-mobile">
              Search food
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              id="search-food-mobile"
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              placeholder="Search food."
              autoComplete="off"
              className="h-11 w-full rounded-2xl border border-black/5 bg-surface pl-10 pr-4 text-sm text-neutral-900 outline-none ring-brand/30 placeholder:text-neutral-400 focus:ring-2 dark:border-white/10 dark:text-neutral-100"
            />
          </div>
          <button
            type="button"
            onClick={() => setFilterSheetOpen(true)}
            className="flex h-11 shrink-0 items-center gap-2 rounded-2xl bg-brand px-4 text-sm font-bold text-white shadow-md shadow-brand/25"
            aria-label="Open filters and sort"
            aria-expanded={filterSheetOpen}
            aria-haspopup="dialog"
          >
            <SlidersHorizontal className="h-5 w-5 shrink-0" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden h-full min-h-0 w-[240px] shrink-0 overflow-hidden border-r border-black/5 bg-panel dark:border-white/10 lg:flex lg:flex-col">
          <Sidebar
            active={navActive}
            onSelect={setNavActive}
            isLoggedIn={isLoggedIn}
            onLogout={isLoggedIn ? logout : undefined}
          />
        </aside>

        {/* Mobile nav drawer */}
        <div
          className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? "pointer-events-auto" : "pointer-events-none"}`}
          aria-hidden={!sidebarOpen}
        >
          <button
            type="button"
            className={`absolute inset-0 bg-black/40 transition-opacity ${sidebarOpen ? "opacity-100" : "opacity-0"}`}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          />
          <div
            className={`absolute inset-y-0 left-0 flex w-[min(280px,88vw)] max-w-full flex-col overflow-hidden bg-panel shadow-xl transition-transform duration-200 dark:border-r dark:border-white/10 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
          >
            <Sidebar
              active={navActive}
              onSelect={(k) => {
                setNavActive(k);
                setSidebarOpen(false);
              }}
              isLoggedIn={isLoggedIn}
              onLogout={
                isLoggedIn
                  ? () => {
                      setSidebarOpen(false);
                      logout();
                    }
                  : undefined
              }
            />
          </div>
        </div>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 lg:p-6">
          {navActive === "food-order" ? (
            <FoodOrderView
              userDisplayName={user?.name}
              cartLineCount={cart.lines.length}
              onGoToMenu={() => setNavActive("dashboard")}
            />
          ) : navActive === "feedback" ? (
            <FeedbackView user={user} onBack={() => setNavActive("dashboard")} />
          ) : navActive === "message" ? (
            <MessageView user={user} onBack={() => setNavActive("dashboard")} />
          ) : navActive === "history" ? (
            <OrderHistoryView user={user} onBack={() => setNavActive("dashboard")} />
          ) : navActive === "payment" ? (
            <PaymentDetailsView
              paymentMethod={paymentMethod}
              onPaymentChange={setPaymentAndPersist}
              onBack={() => setNavActive("dashboard")}
              onGoToOrderHistory={() => setNavActive("history")}
            />
          ) : navActive === "customization" ? (
            <CustomizationView onBack={() => setNavActive("dashboard")} />
          ) : (
            <div className="relative">
              <div className="pointer-events-none absolute left-1/2 top-0 h-[min(280px,42vw)] w-[min(100%,720px)] -translate-x-1/2 rounded-full bg-brand/[0.07] blur-3xl dark:bg-brand/15" aria-hidden />
              <div className="relative">
                <CategoryStrip
                  selected={category}
                  onSelect={(c) => {
                    setCategory(c);
                    setMenuSearch("");
                  }}
                />

              {menuSearch.trim() !== "" ? (
                <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                  <span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {displayProducts.length}
                    </span>{" "}
                    {displayProducts.length === 1 ? "dish" : "dishes"} matching &quot;{menuSearch.trim()}&quot;
                    {" · "}
                    <span className="text-neutral-500">all categories</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setMenuSearch("")}
                    className="font-bold text-brand hover:underline"
                  >
                    Clear search
                  </button>
                </p>
              ) : null}

              {menuSearch.trim() === "" &&
              category !== "noodles" &&
              category !== "hotdog" &&
              category !== "icecream" &&
              category !== "momos" &&
              category !== "riceMeals" ? (
                <div className="mt-6 inline-flex gap-1 rounded-2xl border border-black/[0.06] bg-panel/80 p-1 shadow-inner dark:border-white/10 dark:bg-white/[0.04]">
                  {(["popular", "recent"] as MenuTab[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTab(t)}
                      className={`relative rounded-xl px-5 py-2 text-sm font-bold capitalize transition ${
                        tab === t
                          ? "bg-brand text-white shadow-md shadow-brand/25"
                          : "text-neutral-600 hover:bg-black/[0.04] hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/[0.06] dark:hover:text-neutral-100"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              ) : null}

              {displayProducts.length === 0 ? (
                <p className="mt-8 rounded-2xl bg-panel p-8 text-center text-sm text-neutral-500 shadow-soft ring-1 ring-black/[0.04] dark:text-neutral-400 dark:ring-white/10">
                  {menuSearch.trim() !== "" ? (
                    <>
                      No dishes match &quot;{menuSearch.trim()}&quot;. Try a different name or{" "}
                      <button
                        type="button"
                        className="font-bold text-brand hover:underline"
                        onClick={() => setMenuSearch("")}
                      >
                        clear search
                      </button>
                      .
                    </>
                  ) : (
                    <>
                      No items in this category
                      {category === "noodles" ||
                      category === "hotdog" ||
                      category === "icecream" ||
                      category === "momos" ||
                      category === "riceMeals"
                        ? "."
                        : " for the selected tab."}{" "}
                      Try another category
                      {category === "noodles" ||
                      category === "hotdog" ||
                      category === "icecream" ||
                      category === "momos" ||
                      category === "riceMeals"
                        ? ""
                        : " or tab"}
                      .
                    </>
                  )}
                </p>
              ) : (
                <div className="mt-6 grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
                  {displayProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOrderNow={(p) => {
                        cart.addItem({
                          productId: p.id,
                          name: p.name,
                          unitPrice: p.price,
                          image: p.image,
                        });
                        setCartOpen(false);
                      }}
                    />
                  ))}
                </div>
              )}
              </div>
            </div>
          )}
        </main>

        {/* Desktop cart */}
        <aside className="hidden h-full min-h-0 w-[320px] shrink-0 overflow-hidden border-l border-black/5 bg-panel dark:border-white/10 lg:flex lg:flex-col lg:p-5">
          {cartAside}
        </aside>

        {/* Mobile cart drawer */}
        <div
          className={`fixed inset-0 z-40 lg:hidden ${cartOpen ? "pointer-events-auto" : "pointer-events-none"}`}
          aria-hidden={!cartOpen}
        >
          <button
            type="button"
            className={`absolute inset-0 bg-black/40 transition-opacity ${cartOpen ? "opacity-100" : "opacity-0"}`}
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
          />
          <div
            className={`absolute inset-y-0 right-0 flex w-[min(360px,92vw)] max-w-full flex-col bg-panel shadow-xl transition-transform duration-200 dark:border-l dark:border-white/10 ${cartOpen ? "translate-x-0" : "translate-x-full"}`}
          >
            <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 dark:border-white/10">
              <span className="font-bold text-neutral-900 dark:text-neutral-100">Cart</span>
              <button
                type="button"
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-brand hover:bg-brand/10"
                onClick={() => setCartOpen(false)}
              >
                Done
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col p-4">{cartAside}</div>
          </div>
        </div>
      </div>

      {filterSheetOpen ? (
        <div
          className="fixed inset-0 z-[45] flex items-end justify-center p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="filter-sheet-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            aria-label="Close filters"
            onClick={() => setFilterSheetOpen(false)}
          />
          <div className="relative z-10 flex max-h-[min(90vh,640px)] w-full max-w-md flex-col rounded-t-[1.5rem] bg-panel shadow-2xl ring-1 ring-black/10 dark:ring-white/10 sm:rounded-3xl">
            <div className="border-b border-black/5 px-6 pb-4 pt-6 dark:border-white/10">
              <h2
                id="filter-sheet-title"
                className="text-lg font-extrabold text-neutral-900 dark:text-neutral-50"
              >
                Filter &amp; sort
              </h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                Sort the dishes you see on the menu. Categories and search still apply when you
                close this.
              </p>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <p className="text-xs font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Sort by
              </p>
              <ul className="mt-3 space-y-2" role="list">
                {MENU_SORT_OPTIONS.map((opt) => {
                  const selected = menuSort === opt.id;
                  return (
                    <li key={opt.id}>
                      <button
                        type="button"
                        onClick={() => setMenuSort(opt.id)}
                        className={`flex w-full flex-col rounded-2xl border-2 px-4 py-3 text-left transition ${
                          selected
                            ? "border-brand bg-brand/10 dark:bg-brand/[0.12]"
                            : "border-black/[0.08] bg-transparent hover:border-black/15 dark:border-white/10 dark:hover:border-white/20"
                        }`}
                      >
                        <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                          {opt.label}
                        </span>
                        <span className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                          {opt.description}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="border-t border-black/5 px-6 py-4 dark:border-white/10">
              <button
                type="button"
                onClick={() => setFilterSheetOpen(false)}
                className="w-full rounded-2xl bg-brand py-3 text-sm font-bold text-white shadow-lg shadow-brand/30 transition hover:brightness-110"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
