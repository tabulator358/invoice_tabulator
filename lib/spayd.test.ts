import test from "node:test";
import assert from "node:assert/strict";
import { formatAccountForSPAYD, generateSPAYD } from "@/lib/spayd";
import type { InvoiceData } from "@/types/invoice";

test("converts local Czech account with prefix to CZ IBAN", () => {
  const iban = formatAccountForSPAYD("7720-77628031/0710");
  assert.equal(iban, "CZ9207100077200077628031");
});

test("converts local Czech account without prefix to CZ IBAN", () => {
  const iban = formatAccountForSPAYD("77628031/0710");
  assert.equal(iban, "CZ3707100000000077628031");
});

test("uses bank code override for conversion", () => {
  const iban = formatAccountForSPAYD("7720-77628031", "0710");
  assert.equal(iban, "CZ9207100077200077628031");
});

test("keeps valid IBAN unchanged", () => {
  const iban = formatAccountForSPAYD("cz9207100077200077628031");
  assert.equal(iban, "CZ9207100077200077628031");
});

test("throws on invalid IBAN checksum", () => {
  assert.throws(() => formatAccountForSPAYD("CZ0007100007720077628031"));
});

test("throws on invalid local account input", () => {
  assert.throws(() => formatAccountForSPAYD("abc/0710"));
  assert.throws(() => formatAccountForSPAYD("7720-77628031/12345"));
});

test("generates SPAYD with IBAN ACC and X-VS", () => {
  const invoiceData: InvoiceData = {
    invoiceNumber: "INV-2026-001",
    supplier: "Supplier",
    customer: "Customer",
    issueDate: "2026-01-01",
    dueDate: "2026-01-15",
    bankAccount: "7720-77628031/0710",
    description: "Service",
    quantity: 1,
    price: 100,
    currencyCode: "czk",
    comment: "Test payment",
  };

  const spayd = generateSPAYD(invoiceData, 2690);
  assert.match(spayd, /^SPD\*1\.0\*ACC:CZ\d{22}\*AM:2690\.00\*CC:CZK\*/);
  assert.match(spayd, /\*X-VS:2026001\*/);
});
