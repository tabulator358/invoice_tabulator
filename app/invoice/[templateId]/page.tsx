"use client";

import { useSearchParams, useParams } from "next/navigation";
import { Suspense } from "react";
import InvoiceTemplate from "./InvoiceTemplate";
import CZInvoiceTemplate from "@/app/CZ/[templateId]/CZInvoiceTemplate";

const currencyAliases: Record<string, string> = {
  usd: "USD",
  dollar: "USD",
  dollars: "USD",
  eur: "EUR",
  euro: "EUR",
  euros: "EUR",
  czk: "CZK",
  koruna: "CZK",
  korun: "CZK",
  gbp: "GBP",
  pound: "GBP",
  pounds: "GBP",
  aud: "AUD",
  cad: "CAD",
  sek: "SEK",
  nok: "NOK",
  pln: "PLN",
  chf: "CHF",
};

const resolveCurrencyCode = (value: string | null) => {
  if (!value) return "USD";
  const normalized = value.trim().toLowerCase();
  if (!normalized) return "USD";
  if (currencyAliases[normalized]) return currencyAliases[normalized];
  if (normalized.length === 3 && /^[a-z]{3}$/i.test(normalized)) {
    return normalized.toUpperCase();
  }
  return "USD";
};

function InvoiceContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  // Parse templateId - handle cases like "x1", "cz1", "1" or invalid values
  let templateId = 1; // default
  let isCZTemplate = false;
  const templateIdParam = params.templateId as string;
  if (templateIdParam) {
    const lowerParam = templateIdParam.toLowerCase();
    // If starts with 'cz', it's a Czech template with QR codes
    if (lowerParam.startsWith("cz")) {
      isCZTemplate = true;
      const num = parseInt(templateIdParam.substring(2));
      if (!isNaN(num) && num > 0) {
        templateId = num;
      }
    }
    // If starts with 'x', extract number after it (e.g., "x1" -> 1)
    else if (templateIdParam.startsWith("x") || templateIdParam.startsWith("X")) {
      const num = parseInt(templateIdParam.substring(1));
      if (!isNaN(num) && num > 0) {
        templateId = num;
      }
    } else {
      const num = parseInt(templateIdParam);
      if (!isNaN(num) && num > 0) {
        templateId = num;
      }
    }
  }
  
  // For CZ templates, default to CZK currency if not specified
  const currencyParam = searchParams.get("currency");
  const currencyCode = isCZTemplate 
    ? (currencyParam ? resolveCurrencyCode(currencyParam) : "CZK")
    : resolveCurrencyCode(currencyParam);

  // Parse invoice data from URL parameters
  const invoiceData = {
    invoiceNumber: searchParams.get("invoiceNumber") || "",
    supplier: (searchParams.get("supplier") || "").replace(/\\n/g, "\n"),
    customer: (searchParams.get("customer") || "").replace(/\\n/g, "\n"),
    issueDate: searchParams.get("issueDate") || "",
    dueDate: searchParams.get("dueDate") || "",
    bankAccount: searchParams.get("bankAccount") || "",
    description: searchParams.get("description") || "",
    quantity: parseFloat(searchParams.get("quantity") || "1"),
    price: parseFloat(searchParams.get("price") || "0"),
    currencyCode,
    comment: searchParams.get("comment") || "",
  };

  const total = invoiceData.quantity * invoiceData.price;

  // Use CZInvoiceTemplate for Czech templates (with QR codes)
  if (isCZTemplate) {
    return (
      <CZInvoiceTemplate
        templateId={templateId}
        invoiceData={invoiceData}
        total={total}
      />
    );
  }

  return (
    <InvoiceTemplate
      templateId={templateId}
      invoiceData={invoiceData}
      total={total}
    />
  );
}

export default function InvoicePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <InvoiceContent />
    </Suspense>
  );
}
