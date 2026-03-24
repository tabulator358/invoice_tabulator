import { InvoiceData } from "@/types/invoice";

interface ExportInvoicePdfOptions {
  total: number;
  title?: string;
  includeSpayd?: string;
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

let fontsReadyPromise: Promise<void> | null = null;

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
  if (!fontsReadyPromise) {
    fontsReadyPromise = (async () => {
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

      doc.addFileToVFS("NotoSans-Regular.ttf", arrayBufferToBase64(regularFontBuffer));
      doc.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
      doc.addFileToVFS("NotoSans-Bold.ttf", arrayBufferToBase64(boldFontBuffer));
      doc.addFont("NotoSans-Bold.ttf", "NotoSans", "bold");
    })();
  }

  await fontsReadyPromise;
};

export const exportInvoicePdf = async (
  invoiceData: InvoiceData,
  { total, title = "INVOICE", includeSpayd }: ExportInvoicePdfOptions
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

  const headingColor: [number, number, number] = [28, 63, 170];
  const textColor: [number, number, number] = [33, 37, 41];
  const mutedColor: [number, number, number] = [108, 117, 125];
  const lineColor: [number, number, number] = [222, 226, 230];

  let y = 18;

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

  doc.setFont("NotoSans", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...mutedColor);
  doc.text("Issue Date", marginX, y);
  doc.text("Due Date", marginX + 40, y);
  doc.text("Bank Account", marginX + 80, y);

  doc.setFont("NotoSans", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...textColor);
  doc.text(invoiceData.issueDate || "-", marginX, y + 6);
  doc.text(invoiceData.dueDate || "-", marginX + 40, y + 6);
  doc.text(invoiceData.bankAccount || "-", marginX + 80, y + 6);
  y += 14;

  doc.setDrawColor(...lineColor);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 8;

  const formatter = createCurrencyFormatter(invoiceData.currencyCode, "USD");
  const formatAmount = (value: number) => formatter.format(value);
  const quantityPrice = `${invoiceData.quantity} x ${formatAmount(invoiceData.price)}`;

  doc.setFont("NotoSans", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...mutedColor);
  doc.text("Description", marginX, y);
  doc.text("Quantity x Price", marginX + 105, y, { align: "right" });
  doc.text("Amount", pageWidth - marginX, y, { align: "right" });
  y += 6;

  doc.setFont("NotoSans", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...textColor);
  const descriptionLines = doc.splitTextToSize(invoiceData.description || "-", 95);
  doc.text(descriptionLines, marginX, y);
  doc.text(quantityPrice, marginX + 105, y, { align: "right" });
  doc.text(formatAmount(total), pageWidth - marginX, y, { align: "right" });
  y += Math.max(descriptionLines.length * 5, 8) + 3;

  doc.setDrawColor(...lineColor);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 10;

  doc.setFont("NotoSans", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...headingColor);
  doc.text(`Total: ${formatAmount(total)}`, pageWidth - marginX, y, { align: "right" });
  y += 12;

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

  const filename = `${invoiceData.invoiceNumber || "invoice"}.pdf`;
  doc.save(filename);
};
