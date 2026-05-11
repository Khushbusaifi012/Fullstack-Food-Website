const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Format amount as Indian Rupees (₹1,234 style). */
export function formatInr(amount: number): string {
  return inr.format(amount);
}
