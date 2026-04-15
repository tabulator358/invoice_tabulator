import QRCode from "qrcode";
import { InvoiceData } from "@/types/invoice";

interface ExportInvoicePdfOptions {
  total: number;
  title?: string;
  includeSpayd?: string;
  primaryColor?: [number, number, number];
  accentColor?: [number, number, number];
  templateTextColor?: [number, number, number];
  returnBlob?: boolean;
  /** 0 = Modern, 1 = Classic, 2 = Minimal, 3 = Bold — mirrors templateId % 4 */
  layoutVariant?: number;
}

// ─── helpers ────────────────────────────────────────────────────────────────

const createCurrencyFormatter = (currencyCode: string, fallbackCode: string) => {
  for (const code of [currencyCode, fallbackCode].filter(Boolean) as string[]) {
    try { return new Intl.NumberFormat(undefined, { style: "currency", currency: code }); }
    catch { /* try next */ }
  }
  return new Intl.NumberFormat(undefined, { style: "currency", currency: fallbackCode });
};

const toSingleLine = (s: string) => s.replace(/\s+/g, " ").trim();

let fontDataPromise: Promise<{ regular: string; bold: string }> | null = null;

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize)
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  return btoa(binary);
};

const ensureUnicodeFonts = async (doc: import("jspdf").jsPDF) => {
  if (!fontDataPromise) {
    fontDataPromise = (async () => {
      const [r, b] = await Promise.all([
        fetch("/fonts/NotoSans-Regular.ttf"),
        fetch("/fonts/NotoSans-Bold.ttf"),
      ]);
      if (!r.ok || !b.ok) throw new Error("Unable to load PDF font files for Unicode text.");
      const [rb, bb] = await Promise.all([r.arrayBuffer(), b.arrayBuffer()]);
      return { regular: arrayBufferToBase64(rb), bold: arrayBufferToBase64(bb) };
    })();
  }
  const { regular, bold } = await fontDataPromise;
  doc.addFileToVFS("NotoSans-Regular.ttf", regular);
  doc.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
  doc.addFileToVFS("NotoSans-Bold.ttf", bold);
  doc.addFont("NotoSans-Bold.ttf", "NotoSans", "bold");
};

// ─── layout context ─────────────────────────────────────────────────────────

type Doc = import("jspdf").jsPDF;

interface Ctx {
  doc: Doc;
  pageWidth: number;
  marginX: number;
  contentWidth: number;
  h: [number, number, number];   // heading / primary
  t: [number, number, number];   // body text
  a: [number, number, number];   // accent background
  m: [number, number, number];   // muted labels
  l: [number, number, number];   // line / divider
  fmt: (v: number) => string;
  inv: InvoiceData;
  total: number;
  title: string;
  spayd?: string;
  qrDataUrl?: string;            // base64 PNG of SPAYD QR code
}

const QR_SIZE = 32; // mm

/** Renders QR code image + label at given position, returns height used */
const renderQR = (ctx: Ctx, x: number, y: number): number => {
  if (!ctx.qrDataUrl) return 0;
  const { doc, h, m } = ctx;
  doc.setFont("NotoSans", "bold"); doc.setFontSize(8); doc.setTextColor(...h);
  doc.text("QR Platba", x + QR_SIZE / 2, y, { align: "center" });
  doc.addImage(ctx.qrDataUrl, "PNG", x, y + 3, QR_SIZE, QR_SIZE);
  doc.setFont("NotoSans", "normal"); doc.setFontSize(7); doc.setTextColor(...m);
  doc.text("Naskenujte pro platbu", x + QR_SIZE / 2, y + QR_SIZE + 7, { align: "center" });
  return QR_SIZE + 12;
};

/** Renders QR code in the footer (right-aligned). SPAYD string is never shown as text. */
const renderSpayd = (ctx: Ctx, y: number) => {
  if (!ctx.qrDataUrl) return;
  const { pageWidth, marginX } = ctx;
  const qrX = pageWidth - marginX - QR_SIZE;
  renderQR(ctx, qrX, y);
};

// ─── MODERN (variant 0) ──────────────────────────────────────────────────────

function renderModern(ctx: Ctx) {
  const { doc, pageWidth, marginX, contentWidth, h, t, a, m, l, fmt, inv, total, title, spayd } = ctx;

  doc.setFillColor(...h);
  doc.rect(0, 0, pageWidth, 4, "F");

  let y = 20;

  doc.setFont("NotoSans", "bold"); doc.setFontSize(24); doc.setTextColor(...h);
  doc.text(title, marginX, y);
  doc.setFontSize(11); doc.setTextColor(...t);
  doc.text(`Invoice No: ${inv.invoiceNumber || "-"}`, pageWidth - marginX, y, { align: "right" });
  y += 8;

  doc.setDrawColor(...l); doc.line(marginX, y, pageWidth - marginX, y); y += 8;

  const leftW = 85, rightX = marginX + 95, rightW = contentWidth - 95;
  doc.setFont("NotoSans", "bold"); doc.setFontSize(10); doc.setTextColor(...m);
  doc.text("Supplier", marginX, y); doc.text("Customer", rightX, y);

  doc.setFont("NotoSans", "normal"); doc.setFontSize(11); doc.setTextColor(...t);
  const supL = doc.splitTextToSize(inv.supplier || "-", leftW);
  const cusL = doc.splitTextToSize(inv.customer || "-", rightW);
  doc.text(supL, marginX, y + 6); doc.text(cusL, rightX, y + 6);
  y += Math.max(supL.length, cusL.length) * 5 + 12;

  doc.setFillColor(...a);
  doc.roundedRect(marginX, y - 4, contentWidth, 18, 2, 2, "F");
  doc.setFont("NotoSans", "bold"); doc.setFontSize(9); doc.setTextColor(...h);
  doc.text("Issue Date", marginX + 3, y + 1);
  doc.text("Due Date", marginX + 60, y + 1);
  doc.text("Bank Account", marginX + 110, y + 1);
  doc.setFont("NotoSans", "normal"); doc.setFontSize(10); doc.setTextColor(...t);
  doc.text(inv.issueDate || "-", marginX + 3, y + 8);
  doc.text(inv.dueDate || "-", marginX + 60, y + 8);
  doc.text(inv.bankAccount || "-", marginX + 110, y + 8);
  y += 20;

  doc.setDrawColor(...l); doc.line(marginX, y, pageWidth - marginX, y); y += 8;

  const descW = 80, qtyR = 152, amtR = pageWidth - marginX;
  doc.setFont("NotoSans", "bold"); doc.setFontSize(10); doc.setTextColor(...m);
  doc.text("Description", marginX, y);
  doc.text("Qty \u00d7 Price", qtyR, y, { align: "right" });
  doc.text("Amount", amtR, y, { align: "right" });
  y += 6;

  const descL = doc.splitTextToSize(inv.description || "-", descW);
  doc.setFont("NotoSans", "normal"); doc.setFontSize(11); doc.setTextColor(...t);
  doc.text(descL, marginX, y);
  doc.text(`${inv.quantity} \u00d7 ${fmt(inv.price)}`, qtyR, y, { align: "right" });
  doc.text(fmt(total), amtR, y, { align: "right" });
  y += Math.max(descL.length * 5, 8) + 3;

  doc.setDrawColor(...l); doc.line(marginX, y, pageWidth - marginX, y); y += 10;

  const tbW = 90, tbX = pageWidth - marginX - tbW;
  doc.setFillColor(...h); doc.roundedRect(tbX, y - 5, tbW, 12, 2, 2, "F");
  doc.setFont("NotoSans", "bold"); doc.setFontSize(12); doc.setTextColor(255, 255, 255);
  doc.text("TOTAL", tbX + 4, y + 3);
  doc.text(fmt(total), amtR - 3, y + 3, { align: "right" });
  y += 14;

  if (inv.comment) {
    doc.setFont("NotoSans", "bold"); doc.setFontSize(10); doc.setTextColor(...m);
    doc.text("Notes", marginX, y); y += 6;
    doc.setFont("NotoSans", "normal"); doc.setFontSize(11); doc.setTextColor(...t);
    const nl = doc.splitTextToSize(inv.comment, contentWidth);
    doc.text(nl, marginX, y); y += nl.length * 5 + 6;
  }

  renderSpayd(ctx, y);
}

// ─── CLASSIC (variant 1) ─────────────────────────────────────────────────────

function renderClassic(ctx: Ctx) {
  const { doc, pageWidth, marginX, contentWidth, h, t, a, m, l, fmt, inv, total, title, spayd } = ctx;

  let y = 20;

  // Centered title + border
  doc.setFont("NotoSans", "bold"); doc.setFontSize(26); doc.setTextColor(...h);
  doc.text(title, pageWidth / 2, y, { align: "center" }); y += 9;
  doc.setFont("NotoSans", "normal"); doc.setFontSize(12); doc.setTextColor(...m);
  doc.text(inv.invoiceNumber || "-", pageWidth / 2, y, { align: "center" }); y += 6;
  doc.setDrawColor(...h); doc.setLineWidth(0.8);
  doc.line(marginX, y, pageWidth - marginX, y);
  doc.setLineWidth(0.2); y += 10;

  const leftW = 88, rightX = marginX + leftW + 8, rightW = contentWidth - leftW - 8;
  const boxH = 15;

  // BILLED TO (left)
  doc.setFont("NotoSans", "bold"); doc.setFontSize(9); doc.setTextColor(...h);
  doc.text("BILLED TO", marginX, y); y += 5;
  doc.setFont("NotoSans", "normal"); doc.setFontSize(10); doc.setTextColor(...t);
  const cusL = doc.splitTextToSize(inv.customer || "-", leftW);
  doc.text(cusL, marginX, y);

  // Issue Date box (right, same row)
  const ry1 = y - 5;
  doc.setFillColor(...a); doc.roundedRect(rightX, ry1, rightW, boxH, 2, 2, "F");
  doc.setFont("NotoSans", "bold"); doc.setFontSize(8); doc.setTextColor(...h);
  doc.text("ISSUE DATE", rightX + 3, ry1 + 5);
  doc.setFont("NotoSans", "normal"); doc.setFontSize(10); doc.setTextColor(...t);
  doc.text(inv.issueDate || "-", rightX + 3, ry1 + 11);

  // Due Date box
  const ry2 = ry1 + boxH + 2;
  doc.setFillColor(...a); doc.roundedRect(rightX, ry2, rightW, boxH, 2, 2, "F");
  doc.setFont("NotoSans", "bold"); doc.setFontSize(8); doc.setTextColor(...h);
  doc.text("DUE DATE", rightX + 3, ry2 + 5);
  doc.setFont("NotoSans", "normal"); doc.setFontSize(10); doc.setTextColor(...t);
  doc.text(inv.dueDate || "-", rightX + 3, ry2 + 11);

  y += Math.max(cusL.length * 4.5, 32) + 6;

  // FROM (left)
  doc.setFont("NotoSans", "bold"); doc.setFontSize(9); doc.setTextColor(...h);
  doc.text("FROM", marginX, y); y += 5;
  doc.setFont("NotoSans", "normal"); doc.setFontSize(10); doc.setTextColor(...t);
  const supL = doc.splitTextToSize(inv.supplier || "-", leftW);
  doc.text(supL, marginX, y);

  // Bank Account box (right)
  const ry3 = y - 5;
  doc.setFillColor(...a); doc.roundedRect(rightX, ry3, rightW, boxH + 3, 2, 2, "F");
  doc.setFont("NotoSans", "bold"); doc.setFontSize(8); doc.setTextColor(...h);
  doc.text("BANK ACCOUNT", rightX + 3, ry3 + 5);
  doc.setFont("NotoSans", "normal"); doc.setFontSize(9); doc.setTextColor(...t);
  const bankL = doc.splitTextToSize(inv.bankAccount || "-", rightW - 6);
  doc.text(bankL, rightX + 3, ry3 + 11);

  y += Math.max(supL.length * 4.5, 22) + 8;

  // Items section
  doc.setDrawColor(...h); doc.setLineWidth(0.5);
  doc.line(marginX, y, pageWidth - marginX, y);
  doc.setLineWidth(0.2); y += 6;
  doc.setFont("NotoSans", "bold"); doc.setFontSize(9); doc.setTextColor(...h);
  doc.text("INVOICE ITEMS", marginX, y); y += 7;

  const descW = 80, qtyR = 152, amtR = pageWidth - marginX;
  const descL = doc.splitTextToSize(inv.description || "-", descW);
  doc.setFont("NotoSans", "bold"); doc.setFontSize(11); doc.setTextColor(...t);
  doc.text(descL, marginX, y);
  doc.setFont("NotoSans", "normal"); doc.setFontSize(10); doc.setTextColor(...m);
  doc.text(`${inv.quantity} \u00d7 ${fmt(inv.price)}`, qtyR, y, { align: "right" });
  doc.setFont("NotoSans", "bold"); doc.setFontSize(13); doc.setTextColor(...t);
  doc.text(fmt(total), amtR, y, { align: "right" });
  y += Math.max(descL.length * 5, 8) + 6;

  doc.setDrawColor(...l); doc.line(marginX, y, pageWidth - marginX, y); y += 8;

  // TOTAL DUE — wider box
  const tbW = 120, tbX = pageWidth - marginX - tbW;
  doc.setFillColor(...h); doc.rect(tbX, y - 3, tbW, 14, "F");
  doc.setFont("NotoSans", "bold"); doc.setFontSize(12); doc.setTextColor(255, 255, 255);
  doc.text("TOTAL DUE", tbX + 4, y + 7);
  doc.text(fmt(total), amtR - 3, y + 7, { align: "right" });
  y += 20;

  // Notes in accent box
  if (inv.comment) {
    const noteL = doc.splitTextToSize(inv.comment, contentWidth - 6);
    doc.setFillColor(...a);
    doc.roundedRect(marginX, y - 3, contentWidth, noteL.length * 5 + 14, 2, 2, "F");
    doc.setFont("NotoSans", "bold"); doc.setFontSize(9); doc.setTextColor(...h);
    doc.text("ADDITIONAL NOTES", marginX + 3, y + 4); y += 9;
    doc.setFont("NotoSans", "normal"); doc.setFontSize(10); doc.setTextColor(...t);
    doc.text(noteL, marginX + 3, y); y += noteL.length * 5 + 8;
  }

  renderSpayd(ctx, y);
}

// ─── MINIMAL (variant 2) ─────────────────────────────────────────────────────

function renderMinimal(ctx: Ctx) {
  const { doc, pageWidth, marginX, contentWidth, h, t, a: _a, m, l, fmt, inv, total, title, spayd } = ctx;

  let y = 24;

  // Large light title
  doc.setFont("NotoSans", "normal"); doc.setFontSize(30); doc.setTextColor(...t);
  const displayTitle = (title === "INVOICE" || title === "FAKTURA (CZ)") ? "Invoice" : title;
  doc.text(displayTitle, marginX, y);

  // Thin vertical color accent bar (top-right)
  doc.setFillColor(...h);
  doc.roundedRect(pageWidth - marginX - 3, 8, 3, 22, 1, 1, "F");

  y += 5;
  doc.setFont("NotoSans", "normal"); doc.setFontSize(10); doc.setTextColor(...m);
  doc.text(inv.invoiceNumber || "-", marginX, y); y += 14;

  // Two columns
  const leftW = 78, rightX = marginX + leftW + 18, rightW = contentWidth - leftW - 18;

  // FROM
  doc.setFont("NotoSans", "normal"); doc.setFontSize(8); doc.setTextColor(...m);
  doc.text("FROM", marginX, y); y += 4;
  doc.setFont("NotoSans", "normal"); doc.setFontSize(10); doc.setTextColor(...t);
  const supL = doc.splitTextToSize(inv.supplier || "-", leftW);
  doc.text(supL, marginX, y);

  // Right: dates (plain, minimal style)
  let ry = y - 4;
  const labelF = () => { doc.setFont("NotoSans", "normal"); doc.setFontSize(8); doc.setTextColor(...m); };
  const valueF = () => { doc.setFont("NotoSans", "normal"); doc.setFontSize(10); doc.setTextColor(...t); };
  labelF(); doc.text("ISSUE DATE", rightX, ry); ry += 4;
  valueF(); doc.text(inv.issueDate || "-", rightX, ry); ry += 8;
  labelF(); doc.text("DUE DATE", rightX, ry); ry += 4;
  valueF(); doc.text(inv.dueDate || "-", rightX, ry); ry += 8;
  labelF(); doc.text("BANK ACCOUNT", rightX, ry); ry += 4;
  doc.setFont("NotoSans", "normal"); doc.setFontSize(9); doc.setTextColor(...t);
  doc.text(doc.splitTextToSize(inv.bankAccount || "-", rightW), rightX, ry);

  y += supL.length * 4.5 + 8;

  // TO
  doc.setFont("NotoSans", "normal"); doc.setFontSize(8); doc.setTextColor(...m);
  doc.text("TO", marginX, y); y += 4;
  doc.setFont("NotoSans", "normal"); doc.setFontSize(10); doc.setTextColor(...t);
  const cusL = doc.splitTextToSize(inv.customer || "-", leftW);
  doc.text(cusL, marginX, y); y += cusL.length * 4.5 + 12;

  // Thin lines around item
  doc.setDrawColor(...l); doc.line(marginX, y, pageWidth - marginX, y); y += 8;

  const amtR = pageWidth - marginX, qtyR = 152, descW = 80;
  const descL = doc.splitTextToSize(inv.description || "-", descW);

  doc.setFont("NotoSans", "normal"); doc.setFontSize(12); doc.setTextColor(...t);
  doc.text(descL, marginX, y);
  doc.setFont("NotoSans", "normal"); doc.setFontSize(10); doc.setTextColor(...m);
  doc.text(`${inv.quantity} \u00d7 ${fmt(inv.price)}`, qtyR, y, { align: "right" });
  doc.setFont("NotoSans", "normal"); doc.setFontSize(14); doc.setTextColor(...t);
  doc.text(fmt(total), amtR, y, { align: "right" });
  y += Math.max(descL.length * 6, 10) + 5;

  doc.setDrawColor(...l); doc.line(marginX, y, pageWidth - marginX, y); y += 12;

  // Large right-aligned total (no box)
  doc.setFont("NotoSans", "normal"); doc.setFontSize(9); doc.setTextColor(...m);
  doc.text("TOTAL AMOUNT", amtR, y, { align: "right" }); y += 8;
  doc.setFont("NotoSans", "normal"); doc.setFontSize(24); doc.setTextColor(...h);
  doc.text(fmt(total), amtR, y, { align: "right" }); y += 14;

  // Notes
  if (inv.comment) {
    doc.setFont("NotoSans", "normal"); doc.setFontSize(8); doc.setTextColor(...m);
    doc.text("NOTES", marginX, y); y += 5;
    doc.setFont("NotoSans", "normal"); doc.setFontSize(10); doc.setTextColor(...t);
    const nl = doc.splitTextToSize(inv.comment, contentWidth);
    doc.text(nl, marginX, y); y += nl.length * 5 + 6;
  }

  renderSpayd(ctx, y);
}

// ─── BOLD (variant 3) ────────────────────────────────────────────────────────

function renderBold(ctx: Ctx) {
  const { doc, pageWidth, marginX, contentWidth, h, t, a, m, l, fmt, inv, total, title, spayd } = ctx;

  // Full-width color header
  const headerH = 42;
  doc.setFillColor(...h); doc.rect(0, 0, pageWidth, headerH, "F");

  doc.setFont("NotoSans", "bold"); doc.setFontSize(26); doc.setTextColor(255, 255, 255);
  doc.text(title, marginX, 20);
  doc.setFontSize(13);
  doc.text(inv.invoiceNumber || "-", marginX, 31);

  // Dates in header right
  doc.setFontSize(8); doc.setTextColor(220, 220, 255);
  doc.text("ISSUE DATE", pageWidth - marginX, 13, { align: "right" });
  doc.setFontSize(12); doc.setTextColor(255, 255, 255);
  doc.text(inv.issueDate || "-", pageWidth - marginX, 20, { align: "right" });
  doc.setFontSize(8); doc.setTextColor(220, 220, 255);
  doc.text("DUE DATE", pageWidth - marginX, 28, { align: "right" });
  doc.setFontSize(12); doc.setTextColor(255, 255, 255);
  doc.text(inv.dueDate || "-", pageWidth - marginX, 35, { align: "right" });

  let y = headerH + 12;

  // FROM + BILL TO with left color border
  const halfW = (contentWidth - 8) / 2, rightX = marginX + halfW + 8;
  const addrH = 32;

  doc.setFillColor(...h);
  doc.rect(marginX, y, 2.5, addrH, "F");
  doc.rect(rightX, y, 2.5, addrH, "F");

  doc.setFont("NotoSans", "bold"); doc.setFontSize(9); doc.setTextColor(...h);
  doc.text("FROM", marginX + 5, y + 6);
  doc.setFont("NotoSans", "normal"); doc.setFontSize(10); doc.setTextColor(...t);
  doc.text(doc.splitTextToSize(inv.supplier || "-", halfW - 8), marginX + 5, y + 12);

  doc.setFont("NotoSans", "bold"); doc.setFontSize(9); doc.setTextColor(...h);
  doc.text("BILL TO", rightX + 5, y + 6);
  doc.setFont("NotoSans", "normal"); doc.setFontSize(10); doc.setTextColor(...t);
  doc.text(doc.splitTextToSize(inv.customer || "-", halfW - 8), rightX + 5, y + 12);

  y += addrH + 10;

  // Description header (full-width color bar)
  doc.setFillColor(...h); doc.rect(marginX, y, contentWidth, 9, "F");
  doc.setFont("NotoSans", "bold"); doc.setFontSize(8); doc.setTextColor(255, 255, 255);
  doc.text("DESCRIPTION", marginX + 3, y + 6);
  doc.text("QTY \u00d7 PRICE", 152, y + 6, { align: "right" });
  doc.text("AMOUNT", pageWidth - marginX - 3, y + 6, { align: "right" });
  y += 9;

  // Item row with colored border
  const descW = 80;
  const descL = doc.splitTextToSize(inv.description || "-", descW);
  const rowH = Math.max(descL.length * 6, 16);
  doc.setDrawColor(...h); doc.setLineWidth(0.5);
  doc.rect(marginX, y, contentWidth, rowH, "S");
  doc.setLineWidth(0.2);

  doc.setFont("NotoSans", "bold"); doc.setFontSize(11); doc.setTextColor(...t);
  doc.text(descL, marginX + 3, y + 7);
  doc.setFont("NotoSans", "normal"); doc.setFontSize(10); doc.setTextColor(...m);
  doc.text(`${inv.quantity} \u00d7 ${fmt(inv.price)}`, 152, y + 7, { align: "right" });
  doc.setFont("NotoSans", "bold"); doc.setFontSize(14); doc.setTextColor(...h);
  doc.text(fmt(total), pageWidth - marginX - 3, y + 7, { align: "right" });
  y += rowH + 8;

  // TOTAL AMOUNT — full-width color box
  doc.setFillColor(...h); doc.rect(marginX, y, contentWidth, 16, "F");
  doc.setFont("NotoSans", "bold"); doc.setFontSize(12); doc.setTextColor(255, 255, 255);
  doc.text("TOTAL AMOUNT", marginX + 4, y + 10);
  doc.setFontSize(16);
  doc.text(fmt(total), pageWidth - marginX - 3, y + 10, { align: "right" });
  y += 22;

  // Payment details in accent box (left half) + QR on right half
  const payW = contentWidth / 2 - 4;
  doc.setFillColor(...a); doc.roundedRect(marginX, y, payW, 20, 2, 2, "F");
  doc.setFont("NotoSans", "bold"); doc.setFontSize(8); doc.setTextColor(...h);
  doc.text("PAYMENT DETAILS", marginX + 3, y + 6);
  doc.setFont("NotoSans", "bold"); doc.setFontSize(10); doc.setTextColor(...t);
  doc.text(doc.splitTextToSize(inv.bankAccount || "-", payW - 8), marginX + 3, y + 13);

  // QR in the right half of the payment row
  if (ctx.qrDataUrl) {
    const qrX = marginX + payW + 8;
    renderQR(ctx, qrX, y - 2);
  }
  y += Math.max(26, ctx.qrDataUrl ? QR_SIZE + 14 : 0);

  // Notes with left color line
  if (inv.comment) {
    const noteL = doc.splitTextToSize(inv.comment, contentWidth - 8);
    const noteH = noteL.length * 5 + 10;
    doc.setFillColor(...h); doc.rect(marginX, y, 2.5, noteH, "F");
    doc.setFont("NotoSans", "bold"); doc.setFontSize(9); doc.setTextColor(...h);
    doc.text("NOTES", marginX + 5, y + 6);
    doc.setFont("NotoSans", "normal"); doc.setFontSize(10); doc.setTextColor(...t);
    doc.text(noteL, marginX + 5, y + 13); y += noteH + 6;
  }

  // QR already rendered inline above; only render SPAYD text here
  renderSpayd({ ...ctx, qrDataUrl: undefined }, y);
}

// ─── main export ─────────────────────────────────────────────────────────────

export const exportInvoicePdf = async (
  invoiceData: InvoiceData,
  {
    total,
    title = "INVOICE",
    includeSpayd,
    primaryColor,
    accentColor,
    templateTextColor,
    returnBlob,
    layoutVariant,
  }: ExportInvoicePdfOptions
): Promise<Blob | void> => {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  await ensureUnicodeFonts(doc);

  const formatter = createCurrencyFormatter(invoiceData.currencyCode, "USD");

  // Compute muted color as a lightened version of primary
  const p = primaryColor ?? [28, 63, 170];
  const muteShift = (c: number) => Math.min(255, c + 70);
  const muted: [number, number, number] = primaryColor
    ? [muteShift(p[0]), muteShift(p[1]), muteShift(p[2])]
    : [108, 117, 125];

  const qrDataUrl = includeSpayd
    ? await QRCode.toDataURL(includeSpayd, { width: 200, margin: 1, color: { dark: "#000000", light: "#ffffff" } })
    : undefined;

  const ctx: Ctx = {
    doc,
    pageWidth: 210,
    marginX: 15,
    contentWidth: 180,
    h: p,
    t: templateTextColor ?? [33, 37, 41],
    a: accentColor ?? [222, 226, 230],
    m: muted,
    l: accentColor ?? [222, 226, 230],
    fmt: (v) => formatter.format(v),
    inv: invoiceData,
    total,
    title,
    spayd: includeSpayd,
    qrDataUrl,
  };

  const variant = (layoutVariant ?? 0) % 4;
  if (variant === 1) renderClassic(ctx);
  else if (variant === 2) renderMinimal(ctx);
  else if (variant === 3) renderBold(ctx);
  else renderModern(ctx);

  if (returnBlob) return doc.output("blob") as Blob;
  doc.save(`${invoiceData.invoiceNumber || "invoice"}.pdf`);
};
