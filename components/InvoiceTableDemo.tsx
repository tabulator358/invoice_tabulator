"use client";

import { useEffect, useMemo, useState } from "react";

export type InvoiceTableRow = {
  templateId: string;
  supplier: string;
  customer: string;
  issueDate: string;
  dueDate: string;
  bankAccount: string;
  description: string;
  quantity: string;
  price: string;
  invoiceNumber: string;
  comment: string;
  currency: string;
};

const SUPPLIER_SAMPLE = `Frederick II of Prussia
Sanssouci Palace
Maulbeerallee 14469 Potsdam, 
Kingdom of Prussia
VAT ID DE123456789
Non-VAT payer`;

const CUSTOMER_MARIA = `Empress Maria Theresa
Hofburg Palace
Michaelerkuppel 1
Vienna
Habsburg Monarchy`;

const CUSTOMER_VICTORIA = `Queen Victoria
Buckingham Palace
London SW1A 1AA
United Kingdom`;

const INITIAL_ROWS: InvoiceTableRow[] = [
  {
    templateId: "5",
    supplier: SUPPLIER_SAMPLE,
    customer: CUSTOMER_MARIA,
    issueDate: "2025-02-28",
    dueDate: "2025-03-14",
    bankAccount: "123456/0100",
    description:
      "Deployment of the Royal Musketeers regiment with full ceremonial armament",
    quantity: "1",
    price: "19000",
    invoiceNumber: "202501",
    comment:
      "Please remit payment before the next royal masquerade to avoid being drafted into the musketeers",
    currency: "eur",
  },
  {
    templateId: "3",
    supplier: SUPPLIER_SAMPLE,
    customer: CUSTOMER_MARIA,
    issueDate: "2025-02-28",
    dueDate: "2025-03-14",
    bankAccount: "123456/0100",
    description:
      "Habsburg military logistics: overland troop movements between Vienna and Prague",
    quantity: "1",
    price: "18000",
    invoiceNumber: "202502",
    comment:
      "Unpaid invoices will be handled by the Imperial Bureau of Passive-Aggressive Letters",
    currency: "czk",
  },
  {
    templateId: "3",
    supplier: SUPPLIER_SAMPLE,
    customer: CUSTOMER_VICTORIA,
    issueDate: "2025-03-31",
    dueDate: "2025-04-14",
    bankAccount: "123456/0100",
    description:
      "Her Majesty\u2019s Expeditionary Fleet: colonial convoy escort and naval provisioning",
    quantity: "1",
    price: "19000",
    invoiceNumber: "202503",
    comment:
      "Please remit payment before the next royal carriage inspection",
    currency: "gbp",
  },
];

export function buildInvoiceHref(row: InvoiceTableRow): string {
  const templateId = row.templateId.trim() || "1";
  const params = new URLSearchParams();
  params.set("invoiceNumber", row.invoiceNumber);
  params.set("supplier", row.supplier);
  params.set("customer", row.customer);
  params.set("issueDate", row.issueDate);
  params.set("dueDate", row.dueDate);
  params.set("bankAccount", row.bankAccount);
  params.set("description", row.description);
  params.set("quantity", row.quantity);
  params.set("price", row.price);
  params.set("comment", row.comment);
  params.set("currency", row.currency.trim().toLowerCase());
  return `/invoice/${templateId}?${params.toString()}`;
}

const cellClass = "border border-gray-300 bg-white align-top p-0";
const inputClass =
  "w-full min-w-0 bg-transparent px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-400";
const textareaClass = `${inputClass} resize-y min-h-[4.5rem] font-sans`;

export default function InvoiceTableDemo() {
  const [rows, setRows] = useState<InvoiceTableRow[]>(INITIAL_ROWS);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(typeof window !== "undefined" ? window.location.origin : "");
  }, []);

  const updateRow = (index: number, patch: Partial<InvoiceTableRow>) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  };

  const hrefs = useMemo(() => rows.map((row) => buildInvoiceHref(row)), [rows]);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-sm">
      <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
        <thead>
          <tr className="bg-gray-100">
            {[
              "Template",
              "Supplier",
              "Customer",
              "Issue date",
              "Due date",
              "Bank account",
              "Description",
              "Qty",
              "Price",
              "Invoice #",
              "Comment",
              "Currency",
              "Link",
            ].map((label) => (
              <th
                key={label}
                className="border border-gray-300 px-2 py-2 text-xs font-semibold uppercase tracking-wide text-gray-700"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const href = hrefs[index];
            const fullUrl = origin ? `${origin}${href}` : href;
            return (
              <tr key={index} className="hover:bg-gray-50/80">
                <td className={cellClass}>
                  <input
                    className={`${inputClass} w-14 font-mono text-center`}
                    type="text"
                    inputMode="numeric"
                    value={row.templateId}
                    onChange={(e) =>
                      updateRow(index, { templateId: e.target.value })
                    }
                    aria-label={`Row ${index + 1} template number`}
                  />
                </td>
                <td className={`${cellClass} min-w-[200px]`}>
                  <textarea
                    className={textareaClass}
                    value={row.supplier}
                    onChange={(e) =>
                      updateRow(index, { supplier: e.target.value })
                    }
                    rows={5}
                    aria-label={`Row ${index + 1} supplier`}
                  />
                </td>
                <td className={`${cellClass} min-w-[200px]`}>
                  <textarea
                    className={textareaClass}
                    value={row.customer}
                    onChange={(e) =>
                      updateRow(index, { customer: e.target.value })
                    }
                    rows={5}
                    aria-label={`Row ${index + 1} customer`}
                  />
                </td>
                <td className={`${cellClass} min-w-[7rem]`}>
                  <input
                    className={`${inputClass} font-mono`}
                    type="text"
                    value={row.issueDate}
                    onChange={(e) =>
                      updateRow(index, { issueDate: e.target.value })
                    }
                    aria-label={`Row ${index + 1} issue date`}
                  />
                </td>
                <td className={`${cellClass} min-w-[7rem]`}>
                  <input
                    className={`${inputClass} font-mono`}
                    type="text"
                    value={row.dueDate}
                    onChange={(e) =>
                      updateRow(index, { dueDate: e.target.value })
                    }
                    aria-label={`Row ${index + 1} due date`}
                  />
                </td>
                <td className={`${cellClass} min-w-[7rem]`}>
                  <input
                    className={`${inputClass} font-mono`}
                    type="text"
                    value={row.bankAccount}
                    onChange={(e) =>
                      updateRow(index, { bankAccount: e.target.value })
                    }
                    aria-label={`Row ${index + 1} bank account`}
                  />
                </td>
                <td className={`${cellClass} min-w-[220px]`}>
                  <textarea
                    className={textareaClass}
                    value={row.description}
                    onChange={(e) =>
                      updateRow(index, { description: e.target.value })
                    }
                    rows={3}
                    aria-label={`Row ${index + 1} description`}
                  />
                </td>
                <td className={`${cellClass} w-16`}>
                  <input
                    className={`${inputClass} font-mono text-right`}
                    type="text"
                    inputMode="decimal"
                    value={row.quantity}
                    onChange={(e) =>
                      updateRow(index, { quantity: e.target.value })
                    }
                    aria-label={`Row ${index + 1} quantity`}
                  />
                </td>
                <td className={`${cellClass} min-w-[5.5rem]`}>
                  <input
                    className={`${inputClass} font-mono text-right`}
                    type="text"
                    inputMode="decimal"
                    value={row.price}
                    onChange={(e) => updateRow(index, { price: e.target.value })}
                    aria-label={`Row ${index + 1} price`}
                  />
                </td>
                <td className={`${cellClass} min-w-[6rem]`}>
                  <input
                    className={`${inputClass} font-mono`}
                    type="text"
                    value={row.invoiceNumber}
                    onChange={(e) =>
                      updateRow(index, { invoiceNumber: e.target.value })
                    }
                    aria-label={`Row ${index + 1} invoice number`}
                  />
                </td>
                <td className={`${cellClass} min-w-[200px]`}>
                  <textarea
                    className={textareaClass}
                    value={row.comment}
                    onChange={(e) =>
                      updateRow(index, { comment: e.target.value })
                    }
                    rows={3}
                    aria-label={`Row ${index + 1} comment`}
                  />
                </td>
                <td className={`${cellClass} w-20`}>
                  <input
                    className={`${inputClass} font-mono uppercase`}
                    type="text"
                    value={row.currency}
                    onChange={(e) =>
                      updateRow(index, { currency: e.target.value })
                    }
                    aria-label={`Row ${index + 1} currency`}
                  />
                </td>
                <td className={`${cellClass} min-w-[280px] max-w-md`}>
                  <div className="flex flex-col gap-1 p-1">
                    <input
                      readOnly
                      className={`${inputClass} cursor-default font-mono text-xs text-gray-800`}
                      value={fullUrl}
                      title={fullUrl}
                      aria-label={`Row ${index + 1} generated link`}
                    />
                    <a
                      href={href}
                      className="inline-flex w-fit items-center rounded border border-gray-300 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-900 hover:bg-gray-100"
                    >
                      Open invoice
                    </a>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
