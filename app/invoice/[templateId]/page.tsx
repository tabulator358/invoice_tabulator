"use client";

import { useSearchParams, useParams } from "next/navigation";
import { Suspense } from "react";
import InvoiceTemplate from "./InvoiceTemplate";

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
  const templateId = parseInt(params.templateId as string);
  const currencyCode = resolveCurrencyCode(searchParams.get("currency"));

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
