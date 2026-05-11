import type { PaymentMethodId } from "../components/PaymentMethods";

const STORAGE_KEY = "foodislice_preferred_payment";

const VALID: readonly PaymentMethodId[] = [
  "paypal",
  "visa",
  "mastercard",
  "online",
];

function isPaymentMethodId(s: string): s is PaymentMethodId {
  return (VALID as readonly string[]).includes(s);
}

/** `wallet` was the old id for the same online tile. */
function migrateLegacyPaymentId(raw: string): PaymentMethodId | null {
  if (raw === "wallet") return "online";
  if (isPaymentMethodId(raw)) return raw;
  return null;
}

export function loadPaymentPreference(): PaymentMethodId | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return migrateLegacyPaymentId(raw);
  } catch {
    /* ignore */
  }
  return null;
}

export function savePaymentPreference(id: PaymentMethodId): void {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* quota / private mode */
  }
}
