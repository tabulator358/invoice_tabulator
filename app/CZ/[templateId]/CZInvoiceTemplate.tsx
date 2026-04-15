"use client";

import { useMemo, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { InvoiceData } from "@/types/invoice";
import { generateSPAYD } from "@/lib/spayd";
import { exportInvoicePdf } from "@/lib/pdfInvoice";

interface CZInvoiceTemplateProps {
  templateId: number;
  invoiceData: InvoiceData;
  total: number;
}

// Template configurations (same as InvoiceTemplate)
const getTemplateConfig = (id: number) => {
  // Ensure id is a valid positive number
  const validId = (isNaN(id) || id <= 0) ? 1 : Math.floor(id);
  
  const configs = [
    // Template 1: Classic Professional
    { primaryColor: "rgb(37, 99, 235)", accentColor: "rgb(219, 234, 254)", textColor: "rgb(17, 24, 39)" },
    // Template 2: Modern Minimal
    { primaryColor: "rgb(71, 85, 105)", accentColor: "rgb(241, 245, 249)", textColor: "rgb(15, 23, 42)" },
    // Template 3: Bold Business
    { primaryColor: "rgb(99, 102, 241)", accentColor: "rgb(224, 231, 255)", textColor: "rgb(30, 27, 75)" },
    // Template 4: Clean Corporate
    { primaryColor: "rgb(51, 65, 85)", accentColor: "rgb(248, 250, 252)", textColor: "rgb(15, 23, 42)" },
    // Template 5: Fresh & Simple
    { primaryColor: "rgb(34, 197, 94)", accentColor: "rgb(220, 252, 231)", textColor: "rgb(20, 83, 45)" },
    // Template 6: Executive Elite
    { primaryColor: "rgb(30, 58, 138)", accentColor: "rgb(219, 234, 254)", textColor: "rgb(17, 24, 39)" },
    // Template 7: Startup Style
    { primaryColor: "rgb(147, 51, 234)", accentColor: "rgb(243, 232, 255)", textColor: "rgb(59, 7, 100)" },
    // Template 8: Creative Agency
    { primaryColor: "rgb(249, 115, 22)", accentColor: "rgb(255, 237, 213)", textColor: "rgb(67, 20, 7)" },
    // Template 9: Tech Forward
    { primaryColor: "rgb(6, 182, 212)", accentColor: "rgb(207, 250, 254)", textColor: "rgb(22, 78, 99)" },
    // Template 10: Traditional
    { primaryColor: "rgb(120, 53, 15)", accentColor: "rgb(254, 243, 199)", textColor: "rgb(69, 26, 3)" },
  ];

  // Generate additional configs for templates 11-50
  const additionalColors = [
    { primaryColor: "rgb(220, 38, 38)", accentColor: "rgb(254, 226, 226)", textColor: "rgb(127, 29, 29)" },
    { primaryColor: "rgb(217, 119, 6)", accentColor: "rgb(254, 243, 199)", textColor: "rgb(120, 53, 15)" },
    { primaryColor: "rgb(202, 138, 4)", accentColor: "rgb(254, 249, 195)", textColor: "rgb(113, 63, 18)" },
    { primaryColor: "rgb(5, 150, 105)", accentColor: "rgb(209, 250, 229)", textColor: "rgb(6, 78, 59)" },
  ];

  const index = (validId - 1) % configs.length;
  if (validId <= 10) {
    return configs[index];
  }
  return additionalColors[(validId - 11) % additionalColors.length];
};

const parseRgb = (rgbStr: string): [number, number, number] => {
  const match = rgbStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return [28, 63, 170];
  return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
};

// QR Code Component
const QRCodeSection = ({ spaydString, config }: { spaydString: string; config: ReturnType<typeof getTemplateConfig> }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="text-sm font-semibold mb-2" style={{ color: config.primaryColor }}>
        QR Platba
      </div>
      <div className="bg-white p-3 rounded-lg border-2" style={{ borderColor: config.primaryColor }}>
        <QRCodeSVG value={spaydString} size={150} level="M" />
      </div>
      <div className="text-xs text-gray-500 mt-2 text-center max-w-[150px]">
        Naskenujte pro platbu
      </div>
    </div>
  );
};

export default function CZInvoiceTemplate({ templateId, invoiceData, total }: CZInvoiceTemplateProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const config = getTemplateConfig(templateId);
  const spaydString = useMemo(() => generateSPAYD(invoiceData, total), [invoiceData, total]);
  
  const currencyFormatter = useMemo(() => {
    const codesToTry = [invoiceData.currencyCode, "CZK"].filter(Boolean) as string[];
    for (const code of codesToTry) {
      try {
        return new Intl.NumberFormat(undefined, { style: "currency", currency: code });
      } catch {
        // continue with next code
      }
    }
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "CZK" });
  }, [invoiceData.currencyCode]);
  const formatAmount = (value: number) => currencyFormatter.format(value);

  const handleDownloadPDF = async () => {
    await exportInvoicePdf(invoiceData, {
      total,
      title: "INVOICE (CZ)",
      includeSpayd: spaydString,
      primaryColor: parseRgb(config.primaryColor),
      accentColor: parseRgb(config.accentColor),
      templateTextColor: parseRgb(config.textColor),
    });
  };

  // Layout variations based on template ID
  const getLayout = () => {
    const layoutType = templateId % 4;

    // Modern Layout (Templates divisible by 4)
    if (layoutType === 0) {
      return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div ref={invoiceRef} className="bg-white shadow-lg rounded-lg overflow-hidden">
              {/* Header with color accent */}
              <div className="h-3" style={{ backgroundColor: config.primaryColor }}></div>

              <div className="p-12">
                {/* Title */}
                <h1 className="text-4xl font-bold mb-12" style={{ color: config.primaryColor }}>
                  INVOICE
                </h1>

                {/* Supplier and Customer in columns */}
                <div className="grid grid-cols-2 gap-8 mb-12">
                  <div>
                    <div className="text-sm font-semibold mb-2" style={{ color: config.primaryColor }}>
                      FROM
                    </div>
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {invoiceData.supplier}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold mb-2" style={{ color: config.primaryColor }}>
                      TO
                    </div>
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {invoiceData.customer}
                    </div>
                  </div>
                </div>

                {/* Invoice Details */}
                <div className="grid grid-cols-3 gap-6 mb-12 p-6 rounded-lg" style={{ backgroundColor: config.accentColor }}>
                  <div>
                    <div className="text-xs font-semibold mb-1" style={{ color: config.primaryColor }}>
                      INVOICE NUMBER
                    </div>
                    <div className="font-semibold" style={{ color: config.textColor }}>
                      {invoiceData.invoiceNumber}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold mb-1" style={{ color: config.primaryColor }}>
                      ISSUE DATE
                    </div>
                    <div className="font-semibold" style={{ color: config.textColor }}>
                      {invoiceData.issueDate}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold mb-1" style={{ color: config.primaryColor }}>
                      DUE DATE
                    </div>
                    <div className="font-semibold" style={{ color: config.textColor }}>
                      {invoiceData.dueDate}
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="mb-8">
                  <div className="border-b-2 pb-3 mb-3" style={{ borderColor: config.primaryColor }}>
                    <div className="grid grid-cols-3 gap-4 text-sm font-semibold" style={{ color: config.primaryColor }}>
                      <div>DESCRIPTION</div>
                      <div className="text-right">QUANTITY × PRICE</div>
                      <div className="text-right">AMOUNT</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-4 text-gray-700">
                    <div>{invoiceData.description}</div>
                    <div className="text-right">
                      {invoiceData.quantity} × {formatAmount(invoiceData.price)}
                    </div>
                    <div className="text-right font-semibold">{formatAmount(total)}</div>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-end mb-8">
                  <div className="w-64">
                    <div className="flex justify-between py-4 px-6 rounded-lg text-lg font-bold text-white" style={{ backgroundColor: config.primaryColor }}>
                      <span>TOTAL</span>
                      <span>{formatAmount(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Section with QR Code and Bank Account */}
                <div className="mb-8 grid grid-cols-2 gap-8 items-start">
                  <div>
                    <div className="text-sm font-semibold mb-2" style={{ color: config.primaryColor }}>
                      BANK ACCOUNT
                    </div>
                    <div className="text-gray-700 font-mono">{invoiceData.bankAccount}</div>
                  </div>
                  <div>
                    <QRCodeSection spaydString={spaydString} config={config} />
                  </div>
                </div>

                {/* Comment */}
                {invoiceData.comment && (
                  <div className="pt-8 border-t border-gray-200">
                    <div className="text-sm font-semibold mb-2" style={{ color: config.primaryColor }}>
                      NOTES
                    </div>
                    <div className="text-gray-600 whitespace-pre-wrap">{invoiceData.comment}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Download Button */}
            <div className="text-center mt-8">
              <button
                onClick={handleDownloadPDF}
                className="px-8 py-3 text-white rounded-lg font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: config.primaryColor }}
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Classic Layout (Templates where id % 4 === 1)
    if (layoutType === 1) {
      return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div ref={invoiceRef} className="bg-white shadow-lg p-16">
              {/* Classic Header */}
              <div className="text-center mb-12 pb-8 border-b-4" style={{ borderColor: config.primaryColor }}>
                <h1 className="text-5xl font-bold mb-2" style={{ color: config.primaryColor }}>
                  INVOICE
                </h1>
                <div className="text-xl font-semibold text-gray-600">
                  {invoiceData.invoiceNumber}
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-2 gap-12 mb-12">
                <div>
                  <div className="mb-8">
                    <div className="text-xs font-bold mb-3 tracking-wider" style={{ color: config.primaryColor }}>
                      BILLED TO
                    </div>
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {invoiceData.customer}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold mb-3 tracking-wider" style={{ color: config.primaryColor }}>
                      FROM
                    </div>
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {invoiceData.supplier}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-4 rounded" style={{ backgroundColor: config.accentColor }}>
                    <div className="text-xs font-bold mb-1" style={{ color: config.primaryColor }}>
                      ISSUE DATE
                    </div>
                    <div className="font-semibold text-gray-800">{invoiceData.issueDate}</div>
                  </div>
                  <div className="p-4 rounded" style={{ backgroundColor: config.accentColor }}>
                    <div className="text-xs font-bold mb-1" style={{ color: config.primaryColor }}>
                      DUE DATE
                    </div>
                    <div className="font-semibold text-gray-800">{invoiceData.dueDate}</div>
                  </div>
                  <div className="p-4 rounded" style={{ backgroundColor: config.accentColor }}>
                    <div className="text-xs font-bold mb-1" style={{ color: config.primaryColor }}>
                      BANK ACCOUNT
                    </div>
                    <div className="font-mono text-sm text-gray-800">{invoiceData.bankAccount}</div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="mb-8">
                <div className="mb-4 pb-2 border-b-2" style={{ borderColor: config.primaryColor }}>
                  <div className="text-xs font-bold tracking-wider" style={{ color: config.primaryColor }}>
                    INVOICE ITEMS
                  </div>
                </div>
                <div className="py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{invoiceData.description}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Quantity: {invoiceData.quantity} × {formatAmount(invoiceData.price)}
                      </div>
                    </div>
                    <div className="text-xl font-bold text-gray-800">{formatAmount(total)}</div>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-end mb-8">
                <div className="w-80">
                  <div className="flex justify-between items-center py-6 px-8 text-white text-2xl font-bold" style={{ backgroundColor: config.primaryColor }}>
                    <span>TOTAL DUE</span>
                    <span>{formatAmount(total)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Section with QR Code */}
              <div className="mb-8 flex justify-between items-start gap-8">
                <div className="flex-1">
                  <div className="text-xs font-bold mb-2 tracking-wider" style={{ color: config.primaryColor }}>
                    PAYMENT INFORMATION
                  </div>
                  <div className="font-mono text-sm text-gray-800">{invoiceData.bankAccount}</div>
                </div>
                <div>
                  <QRCodeSection spaydString={spaydString} config={config} />
                </div>
              </div>

              {/* Comment */}
              {invoiceData.comment && (
                <div className="mt-8 p-6 rounded" style={{ backgroundColor: config.accentColor }}>
                  <div className="text-xs font-bold mb-2" style={{ color: config.primaryColor }}>
                    ADDITIONAL NOTES
                  </div>
                  <div className="text-gray-700 whitespace-pre-wrap">{invoiceData.comment}</div>
                </div>
              )}
            </div>

            {/* Download Button */}
            <div className="text-center mt-8">
              <button
                onClick={handleDownloadPDF}
                className="px-8 py-3 text-white rounded-lg font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: config.primaryColor }}
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Minimal Layout (Templates where id % 4 === 2)
    if (layoutType === 2) {
      return (
        <div className="min-h-screen bg-white py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <div ref={invoiceRef} className="p-16 border-2 border-gray-200">
              {/* Minimal Header */}
              <div className="flex justify-between items-start mb-16">
                <div>
                  <h1 className="text-6xl font-light mb-4" style={{ color: config.textColor }}>
                    Invoice
                  </h1>
                  <div className="text-sm text-gray-500">{invoiceData.invoiceNumber}</div>
                </div>
                <div className="w-2 h-24 rounded-full" style={{ backgroundColor: config.primaryColor }}></div>
              </div>

              {/* Minimalist Info Blocks */}
              <div className="grid grid-cols-2 gap-16 mb-16">
                <div className="space-y-8">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                      From
                    </div>
                    <div className="whitespace-pre-wrap text-gray-700 text-sm leading-loose">
                      {invoiceData.supplier}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                      To
                    </div>
                    <div className="whitespace-pre-wrap text-gray-700 text-sm leading-loose">
                      {invoiceData.customer}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-gray-400 mb-1">
                      Issue Date
                    </div>
                    <div className="text-gray-800">{invoiceData.issueDate}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-gray-400 mb-1">
                      Due Date
                    </div>
                    <div className="text-gray-800">{invoiceData.dueDate}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-gray-400 mb-1">
                      Bank Account
                    </div>
                    <div className="text-gray-800 font-mono text-sm">{invoiceData.bankAccount}</div>
                  </div>
                </div>
              </div>

              {/* Minimal Item */}
              <div className="mb-16">
                <div className="border-t border-b border-gray-200 py-8">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="text-gray-800 font-light text-lg">{invoiceData.description}</div>
                      <div className="text-sm text-gray-400 mt-2">
                        {invoiceData.quantity} × {formatAmount(invoiceData.price)}
                      </div>
                    </div>
                    <div className="text-2xl font-light" style={{ color: config.textColor }}>
                      {formatAmount(total)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Minimal Total */}
              <div className="flex justify-end mb-12">
                <div className="text-right">
                  <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                    Total Amount
                  </div>
                  <div className="text-5xl font-light" style={{ color: config.primaryColor }}>
                    {formatAmount(total)}
                  </div>
                </div>
              </div>

              {/* Payment Section with QR Code */}
              <div className="mb-12 flex justify-between items-start gap-12">
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                    Payment Details
                  </div>
                  <div className="text-gray-800 font-mono text-sm">{invoiceData.bankAccount}</div>
                </div>
                <div>
                  <QRCodeSection spaydString={spaydString} config={config} />
                </div>
              </div>

              {/* Comment */}
              {invoiceData.comment && (
                <div className="border-t border-gray-200 pt-8">
                  <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                    Notes
                  </div>
                  <div className="text-gray-600 text-sm whitespace-pre-wrap leading-loose">
                    {invoiceData.comment}
                  </div>
                </div>
              )}
            </div>

            {/* Download Button */}
            <div className="text-center mt-8">
              <button
                onClick={handleDownloadPDF}
                className="px-8 py-3 bg-gray-900 text-white rounded font-medium hover:bg-gray-800 transition-colors"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Bold Layout (Templates where id % 4 === 3)
    return (
      <div className="min-h-screen py-12 px-4" style={{ backgroundColor: config.accentColor }}>
        <div className="max-w-4xl mx-auto">
          <div ref={invoiceRef} className="bg-white shadow-2xl">
            {/* Bold Header with colored background */}
            <div className="p-12 text-white" style={{ backgroundColor: config.primaryColor }}>
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-6xl font-black mb-2">INVOICE</h1>
                  <div className="text-xl font-bold opacity-90">{invoiceData.invoiceNumber}</div>
                </div>
                <div className="text-right space-y-3">
                  <div>
                    <div className="text-xs opacity-75 font-semibold">ISSUE DATE</div>
                    <div className="text-lg font-bold">{invoiceData.issueDate}</div>
                  </div>
                  <div>
                    <div className="text-xs opacity-75 font-semibold">DUE DATE</div>
                    <div className="text-lg font-bold">{invoiceData.dueDate}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-12">
              {/* Bold Address Section */}
              <div className="grid grid-cols-2 gap-8 mb-12">
                <div className="p-6 border-l-4" style={{ borderColor: config.primaryColor }}>
                  <div className="text-xs font-black mb-3 tracking-wider" style={{ color: config.primaryColor }}>
                    FROM
                  </div>
                  <div className="whitespace-pre-wrap text-gray-800 font-medium leading-relaxed">
                    {invoiceData.supplier}
                  </div>
                </div>
                <div className="p-6 border-l-4" style={{ borderColor: config.primaryColor }}>
                  <div className="text-xs font-black mb-3 tracking-wider" style={{ color: config.primaryColor }}>
                    BILL TO
                  </div>
                  <div className="whitespace-pre-wrap text-gray-800 font-medium leading-relaxed">
                    {invoiceData.customer}
                  </div>
                </div>
              </div>

              {/* Bold Items */}
              <div className="mb-8">
                <div className="p-4 text-white font-black text-sm tracking-wider" style={{ backgroundColor: config.primaryColor }}>
                  DESCRIPTION
                </div>
                <div className="border-l-4 border-r-4 border-b-4 p-6" style={{ borderColor: config.primaryColor }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xl font-bold text-gray-900 mb-2">{invoiceData.description}</div>
                      <div className="text-gray-600 font-semibold">
                        {invoiceData.quantity} units @ {formatAmount(invoiceData.price)} each
                      </div>
                    </div>
                    <div className="text-3xl font-black" style={{ color: config.primaryColor }}>
                      {formatAmount(total)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bold Total */}
              <div className="flex justify-end mb-8">
                <div className="w-96">
                  <div className="p-8 text-white" style={{ backgroundColor: config.primaryColor }}>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-black">TOTAL AMOUNT</span>
                      <span className="text-4xl font-black">{formatAmount(total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Section with QR Code */}
              <div className="mb-8 grid grid-cols-2 gap-8 items-start">
                <div className="p-6" style={{ backgroundColor: config.accentColor }}>
                  <div className="text-xs font-black mb-2 tracking-wider" style={{ color: config.primaryColor }}>
                    PAYMENT DETAILS
                  </div>
                  <div className="text-gray-800 font-mono font-bold text-lg">{invoiceData.bankAccount}</div>
                </div>
                <div className="flex justify-center">
                  <QRCodeSection spaydString={spaydString} config={config} />
                </div>
              </div>

              {/* Comment */}
              {invoiceData.comment && (
                <div className="border-l-4 p-6" style={{ borderColor: config.primaryColor }}>
                  <div className="text-xs font-black mb-2 tracking-wider" style={{ color: config.primaryColor }}>
                    NOTES
                  </div>
                  <div className="text-gray-700 font-medium whitespace-pre-wrap">{invoiceData.comment}</div>
                </div>
              )}
            </div>
          </div>

          {/* Download Button */}
          <div className="text-center mt-8">
            <button
              onClick={handleDownloadPDF}
              className="px-10 py-4 text-white rounded font-bold text-lg transition-all hover:scale-105"
              style={{ backgroundColor: config.primaryColor }}
            >
              DOWNLOAD PDF
            </button>
          </div>
        </div>
      </div>
    );
  };

  return getLayout();
}

