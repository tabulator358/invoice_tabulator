"use client";

import { useEffect, useRef, useState } from "react";
import { exportInvoicePdf } from "@/lib/pdfInvoice";
import { generateSPAYD } from "@/lib/spayd";

const OUTPUT_DIR = "/Users/pavelrezabek/Desktop/testy faktur";

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

const buildParams = () => {
  const p = new URLSearchParams({
    invoiceNumber: testInvoice.invoiceNumber,
    supplier: testInvoice.supplier.replace(/\n/g, "\\n"),
    customer: testInvoice.customer.replace(/\n/g, "\\n"),
    issueDate: testInvoice.issueDate,
    dueDate: testInvoice.dueDate,
    bankAccount: testInvoice.bankAccount,
    description: testInvoice.description,
    quantity: String(testInvoice.quantity),
    price: String(testInvoice.price),
    currency: testInvoice.currencyCode,
    comment: testInvoice.comment,
  });
  return p.toString();
};

type LogEntry = { label: string; status: "pending" | "ok" | "err"; detail?: string };

export default function PdfTestCzPage() {
  const [log, setLog] = useState<LogEntry[]>([]);
  const [done, setDone] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const addLog = (label: string) =>
    setLog(l => [...l, { label, status: "pending" }]);
  const updateLog = (label: string, status: "ok" | "err", detail?: string) =>
    setLog(l => l.map(x => x.label === label ? { ...x, status, detail } : x));

  useEffect(() => {
    const total = testInvoice.quantity * testInvoice.price;
    const spayd = generateSPAYD(testInvoice, total);
    const params = buildParams();

    const screenshotIframe = (ifr: HTMLIFrameElement): Promise<string> =>
      new Promise(async (resolve, reject) => {
        try {
          const html2canvas = (await import("html2canvas")).default;
          const iDoc = ifr.contentDocument;
          if (!iDoc) return reject(new Error("no iframe document"));
          // Capture the main invoice wrapper div
          const target = iDoc.querySelector<HTMLElement>(".min-h-screen") ?? iDoc.body;
          const canvas = await html2canvas(target, {
            useCORS: true,
            allowTaint: true,
            scale: 1.5,
            width: 900,
            windowWidth: 900,
          });
          resolve(canvas.toDataURL("image/png").split(",")[1]);
        } catch (e) {
          reject(e);
        }
      });

    const loadIframe = (url: string): Promise<HTMLIFrameElement> =>
      new Promise((resolve, reject) => {
        const ifr = iframeRef.current!;
        ifr.src = url;
        const timer = setTimeout(() => reject(new Error("iframe load timeout")), 8000);
        ifr.onload = () => { clearTimeout(timer); resolve(ifr); };
      });

    (async () => {
      for (let i = 1; i <= 10; i++) {
        const cfg = templateConfigs[i - 1];
        const colors = {
          primaryColor: parseRgb(cfg.primaryColor),
          accentColor: parseRgb(cfg.accentColor),
          templateTextColor: parseRgb(cfg.textColor),
        };

        const screenshotLabel = `screenshot-cz${i}`;
        const pdfLabel = `pdf-cz${i}`;
        addLog(screenshotLabel);
        addLog(pdfLabel);

        try {
          // Load the page in the iframe
          const url = `/invoice/cz${i}?${params}`;
          const ifr = await loadIframe(url);
          // Wait for React hydration
          await new Promise(r => setTimeout(r, 1800));

          // Screenshot
          try {
            const pngB64 = await screenshotIframe(ifr);
            const res = await fetch("/api/save-image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: `screenshot-cz${i}`, data: pngB64, dir: OUTPUT_DIR }),
            });
            const { path } = await res.json();
            updateLog(screenshotLabel, "ok", path);
          } catch (e) {
            updateLog(screenshotLabel, "err", (e as Error).message);
          }

          // PDF
          try {
            const blob = await exportInvoicePdf(testInvoice, {
              total,
              title: "FAKTURA (CZ)",
              includeSpayd: spayd,
              returnBlob: true,
              layoutVariant: (i - 1) % 4,
              ...colors,
            }) as Blob;
            const b64 = await blobToBase64(blob);
            const res = await fetch("/api/save-pdf", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: `pdf-cz${i}`, data: b64, dir: OUTPUT_DIR }),
            });
            const { path } = await res.json();
            updateLog(pdfLabel, "ok", path);
          } catch (e) {
            updateLog(pdfLabel, "err", (e as Error).message);
          }
        } catch (e) {
          updateLog(screenshotLabel, "err", (e as Error).message);
          updateLog(pdfLabel, "err", "přeskočeno (chyba načtení stránky)");
        }
      }
      setDone(true);
    })();
  }, []);

  const ok = log.filter(x => x.status === "ok").length;
  const err = log.filter(x => x.status === "err").length;

  return (
    <div style={{ display: "flex", gap: 0, height: "100vh" }}>
      {/* Live iframe preview */}
      <iframe
        ref={iframeRef}
        style={{ width: 900, minWidth: 900, height: "100vh", border: "none", borderRight: "2px solid #ccc" }}
      />

      {/* Log panel */}
      <div style={{ flex: 1, padding: 20, overflowY: "auto", fontFamily: "monospace", fontSize: 13 }}>
        <h2 style={{ marginTop: 0 }}>PDF + Screenshot Test — cz1–cz10</h2>
        <p style={{ fontWeight: "bold" }}>
          {done
            ? `✅ Hotovo — ${ok} OK, ${err} chyb`
            : `⏳ Generuji... (${ok}/${log.length} hotovo)`}
        </p>
        <p style={{ color: "#666", fontSize: 11 }}>📁 {OUTPUT_DIR}</p>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <tbody>
            {log.map(x => (
              <tr key={x.label} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "4px 8px 4px 0", width: 20 }}>
                  {x.status === "ok" ? "✅" : x.status === "err" ? "❌" : "⏳"}
                </td>
                <td style={{ padding: "4px 12px 4px 0", whiteSpace: "nowrap" }}>{x.label}</td>
                <td style={{ color: "#888", fontSize: 11, wordBreak: "break-all" }}>{x.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
