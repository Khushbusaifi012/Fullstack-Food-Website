import paypalMark from "../assets/payment/paypal.jpg";
import paytmMark from "../assets/payment/paytm.png";
import mcMark from "../assets/payment/mc.png";
import visaMark from "../assets/payment/visa.png";
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
      return "Paytm";
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

export function paymentMethodMarkSrc(id: string): string | null {
  switch (id) {
    case "paypal":
      return paypalMark;
    case "visa":
      return visaMark;
    case "mastercard":
      return mcMark;
    case "online":
    case "wallet":
      return paytmMark;
    default:
      return null;
  }
}

function deliveryLabel(mode: string): string {
  return mode === "pickup" ? "Pickup" : "Delivery";
}

let pdfLibLoad: Promise<[typeof import("jspdf"), typeof import("html2canvas")]> | null = null;

function loadPdfLibs() {
  pdfLibLoad ??= Promise.all([import("jspdf"), import("html2canvas")]);
  return pdfLibLoad;
}

/** Warm up jsPDF + html2canvas so the download click is less likely to lose user-activation (blocked saves). */
export function preloadInvoicePdfLibs(): void {
  void loadPdfLibs();
}

function triggerAnchorPdfDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true, view: window }),
  );
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** iOS (and many in-app browsers) ignore `<a download>`; user must open the PDF then Share / Save. */
function invoicePdfNeedsViewerFallback(): boolean {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return true;
  if (/Android/i.test(ua) && /; wv\)/i.test(ua)) return true;
  return false;
}

function openInvoicePdfInNewTab(blobUrl: string): void {
  const win = window.open(blobUrl, "_blank", "noopener,noreferrer");
  if (win) return;
  const a = document.createElement("a");
  a.href = blobUrl;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true, view: window }),
  );
  a.remove();
}

async function trySaveInvoiceWithPicker(
  blob: Blob,
  filename: string,
): Promise<"saved" | "aborted" | "failed"> {
  const w = window as Window & {
    showSaveFilePicker?: (opts: {
      suggestedName?: string;
      types?: { description: string; accept: Record<string, string[]> }[];
    }) => Promise<{
      createWritable: () => Promise<{
        write: (data: Blob | ArrayBuffer) => Promise<void>;
        close: () => Promise<void>;
      }>;
    }>;
  };
  if (typeof w.showSaveFilePicker !== "function") return "failed";
  try {
    const handle = await w.showSaveFilePicker({
      suggestedName: filename,
      types: [{ description: "PDF", accept: { "application/pdf": [".pdf"] } }],
    });
    const writable = await handle.createWritable();
    await writable.write(await blob.arrayBuffer());
    await writable.close();
    return "saved";
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") return "aborted";
    return "failed";
  }
}

export type InvoiceDownloadResult = {
  delivery: "saved_picker" | "saved_download" | "opened_viewer";
};

async function deliverInvoicePdf(blob: Blob, filename: string): Promise<InvoiceDownloadResult> {
  if (!invoicePdfNeedsViewerFallback()) {
    const picked = await trySaveInvoiceWithPicker(blob, filename);
    if (picked === "saved") return { delivery: "saved_picker" };
  }

  if (invoicePdfNeedsViewerFallback()) {
    const url = URL.createObjectURL(blob);
    openInvoicePdfInNewTab(url);
    window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
    return { delivery: "opened_viewer" };
  }

  triggerAnchorPdfDownload(blob, filename);
  return { delivery: "saved_download" };
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
  .pay-method-row {
    display: inline-flex;
    align-items: center;
    gap: .65rem;
    flex-wrap: wrap;
    margin-top: .35rem;
  }
  .pay-method-mark {
    height: 36px;
    width: auto;
    max-width: 140px;
    object-fit: contain;
    flex-shrink: 0;
  }
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
  const markSrc = paymentMethodMarkSrc(detail.paymentMethod);
  const paymentBody =
    markSrc !== null
      ? `<span class="pay-method-row"><img src="${markSrc}" alt="" class="pay-method-mark" width="120" height="40" /></span>`
      : escapeHtml(paymentMethodLabel(detail.paymentMethod));

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
    <p class="field"><strong>Payment method</strong><br/>${paymentBody}</p>

    <footer>
      Thank you for ordering with foodislice. Keep this file for your records. For support, use Message in the app.
    </footer>
  </div>`;
}

function waitForInvoiceImages(root: HTMLElement): Promise<void> {
  const imgs = [...root.querySelectorAll("img")];
  return Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalHeight > 0) {
            resolve();
            return;
          }
          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
        }),
    ),
  ).then(() => {
    void root.offsetHeight;
  });
}

/**
 * Renders the same invoice layout as before, then saves it as a PDF file.
 */
export async function downloadOrderInvoice(detail: OrderDetail): Promise<InvoiceDownloadResult> {
  const [{ jsPDF }, { default: html2canvas }] = await loadPdfLibs();

  const safeId = detail.id.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 12) || "order";
  const filename = `foodislice-invoice-${safeId}.pdf`;

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
    await waitForInvoiceImages(sheet);
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

    /** Prefer one page: tiny overflow (common with html2canvas) scales down instead of a blank 2nd page. */
    const minScaleBeforeMultiPage = 0.5;
    const scaleToOnePage = contentHeight / imgHeight;

    if (imgHeight <= contentHeight) {
      pdf.addImage(imgData, "JPEG", margin, margin, imgWidth, imgHeight);
    } else if (scaleToOnePage >= minScaleBeforeMultiPage) {
      const drawH = contentHeight;
      const drawW = imgWidth * scaleToOnePage;
      const drawX = margin + (imgWidth - drawW) / 2;
      pdf.addImage(imgData, "JPEG", drawX, margin, drawW, drawH);
    } else {
      let page = 0;
      while (page * contentHeight < imgHeight - 0.01) {
        if (page > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", margin, margin - page * contentHeight, imgWidth, imgHeight);
        page += 1;
      }
    }

    const blob = pdf.output("blob");
    return await deliverInvoicePdf(blob, filename);
  } finally {
    document.body.removeChild(mount);
  }
}
