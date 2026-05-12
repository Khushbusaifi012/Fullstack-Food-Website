import type { OrderDetail } from "./ordersApi";
import { formatInr } from "./formatMoney";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatInvoiceDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "full",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function paymentMethodLabel(id: string): string {
  switch (id) {
    case "online":
    case "wallet":
      return "Pay online";
    case "paypal":
      return "PayPal";
    case "visa":
      return "Visa";
    case "mastercard":
      return "Mastercard";
    default:
      return id;
  }
}

function deliveryLabel(mode: string): string {
  return mode === "pickup" ? "Pickup" : "Delivery";
}

/** PDF capture: keep layout print-friendly (flat card, strong type hierarchy). */
const INVOICE_STYLES = `
  * { box-sizing: border-box; }
  .sheet {
    max-width: 640px;
    margin: 0;
    background: #fff;
    padding: 2rem 2rem 2.25rem;
    border-radius: 0;
    border: 1px solid #ececec;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    color: #171717;
    -webkit-font-smoothing: antialiased;
  }
  h1 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 .35rem;
    color: #ff5722;
    letter-spacing: -0.02em;
    text-transform: lowercase;
  }
  .tagline { color: #737373; font-size: .8125rem; margin: 0 0 1.25rem; }
  .muted { color: #737373; font-size: .875rem; }
  .hero-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; flex-wrap: wrap; margin: 0 0 1.75rem; }
  .hero-meta .line-meta { margin: .45rem 0 0; line-height: 1.45; }
  .hero-meta .line-meta:first-of-type { margin-top: .65rem; }
  .badge-row { display: flex; align-items: center; flex-wrap: wrap; gap: .5rem; }
  .badge {
    display: inline-block;
    font-size: .625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .07em;
    background: #ff5722;
    color: #fff;
    padding: .3rem .65rem;
    border-radius: 6px;
  }
  .mode-label { color: #737373; font-size: .875rem; }
  .hero-total { text-align: right; min-width: 140px; }
  .hero-total .label { margin: 0; color: #737373; font-size: .8125rem; }
  .hero-total .amount { margin: .2rem 0 0; font-size: 1.85rem; font-weight: 800; color: #171717; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
  .section-title {
    margin: 0 0 .65rem;
    font-size: .6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .12em;
    color: #737373;
  }
  .section-title.spaced { margin-top: 1.75rem; }
  table { width: 100%; border-collapse: collapse; margin: 0 0 .25rem; font-size: .875rem; }
  thead tr { border-bottom: 1px solid #e5e5e5; }
  th, td { text-align: left; padding: .7rem .35rem; border-bottom: 1px solid #f0f0f0; }
  th { font-size: .65rem; font-weight: 600; text-transform: uppercase; letter-spacing: .1em; color: #737373; padding-top: 0; padding-bottom: .55rem; }
  tbody tr:last-child td { border-bottom: none; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; color: #262626; }
  tbody td:first-child { font-weight: 500; color: #171717; }
  .totals { margin-top: 1rem; font-size: .9375rem; }
  .totals .line { display: flex; justify-content: space-between; padding: .4rem 0; color: #262626; }
  .totals .line span:last-child { font-variant-numeric: tabular-nums; }
  .totals .grand {
    font-size: 1.125rem;
    font-weight: 800;
    color: #ff5722;
    border-top: 1px solid #e5e5e5;
    margin-top: .35rem;
    padding-top: .85rem;
  }
  .field { margin: .85rem 0 0; line-height: 1.5; font-size: .9375rem; }
  .field:first-of-type { margin-top: .25rem; }
  .field strong { display: inline; font-size: .9375rem; color: #171717; }
  footer { margin-top: 2.25rem; padding-top: 1.25rem; border-top: 1px solid #f0f0f0; font-size: .72rem; color: #a3a3a3; line-height: 1.5; }
`;

function buildInvoiceSheetHtml(detail: OrderDetail): string {
  const rowsHtml = detail.lines
    .map(
      (line) => `
    <tr>
      <td>${escapeHtml(line.name)}</td>
      <td class="num">${escapeHtml(formatInr(line.unitPrice))}</td>
      <td class="num">${line.quantity}</td>
      <td class="num">${escapeHtml(formatInr(line.unitPrice * line.quantity))}</td>
    </tr>`,
    )
    .join("");

  const statusUpper = escapeHtml(detail.status.toUpperCase());

  return `
  <div class="sheet">
    <h1>foodislice</h1>
    <p class="tagline">Payment invoice / receipt</p>
    <div class="hero-row">
      <div class="hero-meta">
        <div class="badge-row">
          <span class="badge">${statusUpper}</span>
          <span class="mode-label">${escapeHtml(deliveryLabel(detail.deliveryMode))}</span>
        </div>
        <p class="muted line-meta">${escapeHtml(formatInvoiceDate(detail.createdAt))}</p>
        <p class="muted line-meta"><strong style="color:#525252;font-weight:600">Order ID</strong><br/><span style="font-family:ui-monospace,monospace;font-size:.8125rem;word-break:break-all">${escapeHtml(detail.id)}</span></p>
      </div>
      <div class="hero-total">
        <p class="label">Total paid</p>
        <p class="amount">${escapeHtml(formatInr(detail.total))}</p>
      </div>
    </div>

    <h2 class="section-title">Items</h2>
    <table>
      <thead><tr><th>Item</th><th class="num">Price</th><th class="num">Qty</th><th class="num">Amount</th></tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>

    <div class="totals">
      <div class="line"><span>Subtotal</span><span>${escapeHtml(formatInr(detail.subtotal))}</span></div>
      <div class="line"><span>Tax (GST)</span><span>${escapeHtml(formatInr(detail.tax))}</span></div>
      <div class="line grand"><span>Total</span><span>${escapeHtml(formatInr(detail.total))}</span></div>
    </div>

    <h2 class="section-title spaced">Customer &amp; payment</h2>
    <p class="field"><strong>Name</strong><br/>${escapeHtml(detail.fullName)}</p>
    <p class="field"><strong>Phone</strong><br/>${escapeHtml(detail.phone)}</p>
    ${
      detail.deliveryMode === "delivery" && detail.address.trim()
        ? `<p class="field"><strong>Address</strong><br/>${escapeHtml(detail.address).replace(/\n/g, "<br/>")}</p>`
        : ""
    }
    ${
      detail.notes.trim()
        ? `<p class="field"><strong>Notes</strong><br/>${escapeHtml(detail.notes).replace(/\n/g, "<br/>")}</p>`
        : ""
    }
    <p class="field"><strong>Payment method</strong><br/>${escapeHtml(paymentMethodLabel(detail.paymentMethod))}</p>

    <footer>
      Thank you for ordering with foodislice. Keep this file for your records. For support, use Message in the app.
    </footer>
  </div>`;
}

/**
 * Renders the same invoice layout as before, then saves it as a PDF file.
 */
export async function downloadOrderInvoice(detail: OrderDetail): Promise<void> {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);

  const safeId = detail.id.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 12) || "order";

  const mount = document.createElement("div");
  mount.setAttribute("aria-hidden", "true");
  mount.style.cssText =
    "position:fixed;left:-12000px;top:0;width:720px;pointer-events:none;opacity:0.01;";
  mount.innerHTML = `<style>${INVOICE_STYLES}</style>${buildInvoiceSheetHtml(detail)}`;
  document.body.appendChild(mount);

  const sheet = mount.querySelector(".sheet");
  if (!sheet || !(sheet instanceof HTMLElement)) {
    document.body.removeChild(mount);
    throw new Error("Invoice markup missing");
  }

  try {
    const canvas = await html2canvas(sheet, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: 720,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const margin = 12;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentHeight = pageHeight - margin * 2;
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let page = 0;
    while (page * contentHeight < imgHeight - 0.01) {
      if (page > 0) pdf.addPage();
      pdf.addImage(imgData, "JPEG", margin, margin - page * contentHeight, imgWidth, imgHeight);
      page += 1;
    }

    pdf.save(`foodislice-invoice-${safeId}.pdf`);
  } finally {
    document.body.removeChild(mount);
  }
}
