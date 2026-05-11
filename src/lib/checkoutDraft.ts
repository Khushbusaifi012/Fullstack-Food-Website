const STORAGE_KEY = "foodislice_checkout_draft";

export type CheckoutDraft = {
  mode: "delivery" | "pickup";
  fullName: string;
  phone: string;
  address: string;
  notes: string;
};

export function loadCheckoutDraft(): Partial<CheckoutDraft> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as unknown;
    if (!p || typeof p !== "object") return null;
    const rec = p as Record<string, unknown>;
    return {
      mode: rec.mode === "pickup" ? "pickup" : "delivery",
      fullName: typeof rec.fullName === "string" ? rec.fullName : "",
      phone: typeof rec.phone === "string" ? rec.phone : "",
      address: typeof rec.address === "string" ? rec.address : "",
      notes: typeof rec.notes === "string" ? rec.notes : "",
    };
  } catch {
    return null;
  }
}

export function saveCheckoutDraft(draft: CheckoutDraft): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* quota / private mode */
  }
}

/** Call after a successful order so the next checkout starts clean. */
export function clearCheckoutDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export const CHECKOUT_DRAFT_CLEARED_EVENT = "foodislice:checkout-draft-cleared";
