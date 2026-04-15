import { InvoiceData } from "@/types/invoice";

interface ExportInvoicePdfOptions {
  total: number;
  title?: string;
  includeSpayd?: string;
  primaryColor?: [number, number, number];
  accentColor?: [number, number, number];
  templateTextColor?: [number, number, number];
  returnBlob?: boolean;
}

const createCurrencyFormatter = (currencyCode: string, fallbackCode: string) => {
  const codesToTry = [currencyCode, fallbackCode].filter(Boolean) as string[];
  for (const code of codesToTry) {
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: code });
    } catch {
      // try next formatter candidate
    }
  }
  return new Intl.NumberFormat(undefined, { style: "currency", currency: fallbackCode });
};

const toSingleLine = (value: string) => value.replace(/\s+/g, " ").trim();

// Cache only the raw font data (base64), not the doc registration.
// Each new jsPDF instance needs fonts registered separately.
let fontDataPromise: Promise<{ regular: string; bold: string }> | null = null;

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
};

const ensureUnicodeFonts = async (doc: import("jspdf").jsPDF) => {
  if (!fontDataPromise) {
    fontDataPromise = (async () => {
      const [regularFontResponse, boldFontResponse] = await Promise.all([
        fetch("/fonts/NotoSans-Regular.ttf"),
        fetch("/fonts/NotoSans-Bold.ttf"),
      ]);

      if (!regularFontResponse.ok || !boldFontResponse.ok) {
        throw new Error("Unable to load PDF font files for Unicode text.");
      }

      const [regularFontBuffer, boldFontBuffer] = await Promise.all([
        regularFontResponse.arrayBuffer(),
        boldFontResponse.arrayBuffer(),
      ]);

      return {
        regular: arrayBufferToBase64(regularFontBuffer),
        bold: arrayBufferToBase64(boldFontBuffer),
      };
    })();
  }

  const { regular, bold } = await fontDataPromise;
  // Register fonts into this specific doc instance every time
  doc.addFileToVFS("NotoSans-Regular.ttf", regular);
  doc.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
  doc.addFileToVFS("NotoSans-Bold.ttf", bold);
  doc.addFont("NotoSans-Bold.ttf", "NotoSans", "bold");
};

export const exportInvoicePdf = async (
  invoiceData: InvoiceData,
  { total, title = "INVOICE", includeSpayd, primaryColor, accentColor, templateTextColor, returnBlob }: ExportInvoicePdfOptions
) => {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  await ensureUnicodeFonts(doc);

  const pageWidth = 210;
  const marginX = 15;
  const contentWidth = pageWidth - marginX * 2;
  const leftColumnWidth = 85;
  const rightColumnX = marginX + leftColumnWidth + 10;
  const rightColumnWidth = contentWidth - leftColumnWidth - 10;

  const headingColor: [number, number, number] = primaryColor ?? [28, 63, 170];
  const textColor: [number, number, number] = templateTextColor ?? [33, 37, 41];
  const mutedColor: [number, number, number] = primaryColor
    ? [Math.min(255, primaryColor[0] + 60), Math.min(255, primaryColor[1] + 60), Math.min(255, primaryColor[2] + 60)]
    : [108, 117, 125];
  const lineColor: [number, number, number] = accentColor ?? [222, 226, 230];

  // Top color bar (matches the web template accent strip)
  doc.setFillColor(...headingColor);
  doc.rect(0, 0, pageWidth, 4, "F");

  let y = 20;

  doc.setFont("NotoSans", "bold");
  doc.setFontSize(24);
  doc.setTextColor(...headingColor);
  doc.text(title, marginX, y);

  doc.setFontSize(11);
  doc.setTextColor(...textColor);
  const invoiceNumber = invoiceData.invoiceNumber || "-";
  doc.text(`Invoice No: ${invoiceNumber}`, pageWidth - marginX, y, { align: "right" });
  y += 8;

  doc.setDrawColor(...lineColor);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 8;

  const blockLabel = (label: string, x: number, startY: number) => {
    doc.setFont("NotoSans", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...mutedColor);
    doc.text(label, x, startY);
  };

  const blockBody = (text: string, x: number, startY: number, width: number) => {
    doc.setFont("NotoSans", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...textColor);
    const lines = doc.splitTextToSize(text || "-", width);
    doc.text(lines, x, startY);
    return lines.length;
  };

  blockLabel("Supplier", marginX, y);
  blockLabel("Customer", rightColumnX, y);
  const supplierLines = blockBody(invoiceData.supplier, marginX, y + 6, leftColumnWidth);
  const customerLines = blockBody(invoiceData.customer, rightColumnX, y + 6, rightColumnWidth);
  y += Math.max(supplierLines, customerLines) * 5 + 12;

  // Accent background box for date/account details
  const boxHeight = 18;
  doc.setFillColor(...lineColor);
  doc.roundedRect(marginX, y - 4, contentWidth, boxHeight, 2, 2, "F");

  doc.setFont("NotoSans", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...headingColor);
  doc.text("Issue Date", marginX + 3, y + 1);
  doc.text("Due Date", marginX + 60, y + 1);
  doc.text("Bank Account", marginX + 110, y + 1);

  doc.setFont("NotoSans", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  doc.text(invoiceData.issueDate || "-", marginX + 3, y + 8);
  doc.text(invoiceData.dueDate || "-", marginX + 60, y + 8);
  doc.text(invoiceData.bankAccount || "-", marginX + 110, y + 8);
  y += 20;

  doc.setDrawColor(...lineColor);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 8;

  const formatter = createCurrencyFormatter(invoiceData.currencyCode, "USD");
  const formatAmount = (value: number) => formatter.format(value);
  const quantityPrice = `${invoiceData.quantity} x ${formatAmount(invoiceData.price)}`;

  // Column positions: Description | Qty × Price | Amount
  // Description: x=15, width=80 → ends at x=95
  // Qty × Price: right-aligned at x=152 (starts ~100 for typical values)
  // Amount: right-aligned at x=195
  const descWidth = 80;
  const qtyColRight = 152;
  const amountColRight = pageWidth - marginX;

  doc.setFont("NotoSans", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...mutedColor);
  doc.text("Description", marginX, y);
  doc.text("Qty \u00d7 Price", qtyColRight, y, { align: "right" });
  doc.text("Amount", amountColRight, y, { align: "right" });
  y += 6;

  doc.setFont("NotoSans", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...textColor);
  const descriptionLines = doc.splitTextToSize(invoiceData.description || "-", descWidth);
  doc.text(descriptionLines, marginX, y);
  doc.text(quantityPrice, qtyColRight, y, { align: "right" });
  doc.text(formatAmount(total), amountColRight, y, { align: "right" });
  y += Math.max(descriptionLines.length * 5, 8) + 3;

  doc.setDrawColor(...lineColor);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 10;

  // Colored background for Total row
  const totalBoxWidth = 90;
  const totalBoxX = pageWidth - marginX - totalBoxWidth;
  doc.setFillColor(...headingColor);
  doc.roundedRect(totalBoxX, y - 5, totalBoxWidth, 12, 2, 2, "F");

  doc.setFont("NotoSans", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL", totalBoxX + 4, y + 3);
  doc.text(formatAmount(total), pageWidth - marginX - 3, y + 3, { align: "right" });
  y += 14;

  if (invoiceData.comment) {
    doc.setFont("NotoSans", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...mutedColor);
    doc.text("Notes", marginX, y);
    y += 6;

    doc.setFont("NotoSans", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...textColor);
    const noteLines = doc.splitTextToSize(invoiceData.comment, contentWidth);
    doc.text(noteLines, marginX, y);
    y += noteLines.length * 5 + 6;
  }

  if (includeSpayd) {
    doc.setFont("NotoSans", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...mutedColor);
    doc.text("SPAYD", marginX, y);
    y += 6;

    doc.setFont("NotoSans", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...textColor);
    const spaydLines = doc.splitTextToSize(toSingleLine(includeSpayd), contentWidth);
    doc.text(spaydLines, marginX, y);
  }

  if (returnBlob) {
    return doc.output("blob") as Blob;
  }
  const filename = `${invoiceData.invoiceNumber || "invoice"}.pdf`;
  doc.save(filename);
};
