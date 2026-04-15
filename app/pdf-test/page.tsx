"use client";

import { useEffect, useState } from "react";
import { exportInvoicePdf } from "@/lib/pdfInvoice";
import { generateSPAYD } from "@/lib/spayd";

const testInvoice = {
  invoiceNumber: "2024-TEST",
  supplier: "Dodavatel s.r.o.\nPražská 123\n110 00 Praha 1\nIČO: 12345678",
  customer: "Odběratel a.s.\nBrněnská 456\n602 00 Brno\nIČO: 87654321",
  issueDate: "2024-04-01",
  dueDate: "2024-04-30",
  bankAccount: "CZ6508000000192000145399",
  description: "Vývoj webové aplikace - ě š č ř ž ý á í é ů",
  quantity: 2,
  price: 25000,
  currencyCode: "CZK",
  comment: "Přiložen výkaz práce. Děkujeme za důvěru.",
};

const templateConfigs = [
  { primaryColor: "rgb(37, 99, 235)",  accentColor: "rgb(219, 234, 254)", textColor: "rgb(17, 24, 39)"  },
  { primaryColor: "rgb(71, 85, 105)",  accentColor: "rgb(241, 245, 249)", textColor: "rgb(15, 23, 42)"  },
  { primaryColor: "rgb(99, 102, 241)", accentColor: "rgb(224, 231, 255)", textColor: "rgb(30, 27, 75)"  },
  { primaryColor: "rgb(51, 65, 85)",   accentColor: "rgb(248, 250, 252)", textColor: "rgb(15, 23, 42)"  },
  { primaryColor: "rgb(34, 197, 94)",  accentColor: "rgb(220, 252, 231)", textColor: "rgb(20, 83, 45)"  },
  { primaryColor: "rgb(30, 58, 138)",  accentColor: "rgb(219, 234, 254)", textColor: "rgb(17, 24, 39)"  },
  { primaryColor: "rgb(147, 51, 234)", accentColor: "rgb(243, 232, 255)", textColor: "rgb(59, 7, 100)"  },
  { primaryColor: "rgb(249, 115, 22)", accentColor: "rgb(255, 237, 213)", textColor: "rgb(67, 20, 7)"   },
  { primaryColor: "rgb(6, 182, 212)",  accentColor: "rgb(207, 250, 254)", textColor: "rgb(22, 78, 99)"  },
  { primaryColor: "rgb(120, 53, 15)",  accentColor: "rgb(254, 243, 199)", textColor: "rgb(69, 26, 3)"   },
];

const parseRgb = (s: string): [number, number, number] => {
  const m = s.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!m) return [28, 63, 170];
  return [+m[1], +m[2], +m[3]];
};

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const saveToDisk = async (name: string, base64: string) => {
  const res = await fetch("/api/save-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, data: base64 }),
  });
  return res.json();
};

export default function PdfTestPage() {
  const [log, setLog] = useState<{ label: string; status: "ok" | "err" | "pending"; path?: string }[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const total = testInvoice.quantity * testInvoice.price;
    const spayd = generateSPAYD(testInvoice, total);

    (async () => {
      for (let i = 1; i <= 10; i++) {
        const cfg = templateConfigs[i - 1];
        const colors = {
          primaryColor: parseRgb(cfg.primaryColor),
          accentColor: parseRgb(cfg.accentColor),
          templateTextColor: parseRgb(cfg.textColor),
        };

        // --- invoice ---
        const invLabel = `invoice-template-${i}`;
        setLog(l => [...l, { label: invLabel, status: "pending" }]);
        try {
          const blob = await exportInvoicePdf(testInvoice, {
            total, title: "INVOICE", returnBlob: true, ...colors,
          }) as Blob;
          const b64 = await blobToBase64(blob);
          const { path } = await saveToDisk(invLabel, b64);
          setLog(l => l.map(x => x.label === invLabel ? { ...x, status: "ok", path } : x));
        } catch (e) {
          setLog(l => l.map(x => x.label === invLabel ? { ...x, status: "err", path: (e as Error).message } : x));
        }

        // --- CZ ---
        const czLabel = `cz-template-${i}`;
        setLog(l => [...l, { label: czLabel, status: "pending" }]);
        try {
          const blob = await exportInvoicePdf(testInvoice, {
            total, title: "FAKTURA (CZ)", includeSpayd: spayd,
            returnBlob: true, ...colors,
          }) as Blob;
          const b64 = await blobToBase64(blob);
          const { path } = await saveToDisk(czLabel, b64);
          setLog(l => l.map(x => x.label === czLabel ? { ...x, status: "ok", path } : x));
        } catch (e) {
          setLog(l => l.map(x => x.label === czLabel ? { ...x, status: "err", path: (e as Error).message } : x));
        }
      }
      setDone(true);
    })();
  }, []);

  const ok = log.filter(x => x.status === "ok").length;
  const err = log.filter(x => x.status === "err").length;

  return (
    <div style={{ fontFamily: "monospace", padding: 24, lineHeight: 1.8 }}>
      <h2>PDF Test Runner</h2>
      <p>
        {done
          ? `✅ Hotovo — ${ok} OK, ${err} chyb`
          : `Generuji... (${ok}/${log.length} hotovo)`}
      </p>
      <table style={{ borderCollapse: "collapse" }}>
        <tbody>
          {log.map((x) => (
            <tr key={x.label}>
              <td style={{ paddingRight: 12 }}>
                {x.status === "ok" ? "✅" : x.status === "err" ? "❌" : "⏳"}
              </td>
              <td style={{ paddingRight: 16 }}>{x.label}</td>
              <td style={{ color: "#666", fontSize: 11 }}>{x.path}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
