"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  type ParsedCsv,
  type ValidationWarning,
  asciiTransliterate,
  parsePaymentsCsv,
  validate,
} from "@/lib/kpcCsv";
import {
  buildKpc,
  buildKpcBlob,
  dateInputToDdmmrr,
  suggestKpcFilename,
  todayDdmmrr,
} from "@/lib/kpc";

type FormState = {
  senderAccount: string;
  senderBank: string;
  clientName: string;
  creationDate: string;
  dueDate: string;
};

type InputMode = "file" | "paste";

const today = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const sanitizeClientName = (raw: string) =>
  asciiTransliterate(raw).toUpperCase().replace(/[^A-Z0-9 ]/g, "").slice(0, 20);

export default function PaymentsPage() {
  const [inputMode, setInputMode] = useState<InputMode>("file");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isNumbersFile, setIsNumbersFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [showAllTranslit, setShowAllTranslit] = useState(false);
  const [form, setForm] = useState<FormState>({
    senderAccount: "",
    senderBank: "",
    clientName: "",
    creationDate: today(),
    dueDate: today(),
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const acceptParsed = useCallback((result: ParsedCsv) => {
    setParsed(result);
    if (result.sender) {
      setForm((f) => ({
        ...f,
        senderAccount: f.senderAccount || result.sender!.account,
        senderBank: f.senderBank || result.sender!.bankCode,
      }));
    }
  }, []);

  const handleText = useCallback((text: string, source: string) => {
    setIsNumbersFile(false);
    setParsed(null);
    setParseError(null);
    setDownloadError(null);
    try {
      const result = parsePaymentsCsv(text);
      if (result.payments.length === 0) {
        setParseError(`No payment rows found in ${source}.`);
        return;
      }
      acceptParsed(result);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Failed to parse text");
    }
  }, [acceptParsed]);

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setIsNumbersFile(false);
    setParsed(null);
    setParseError(null);
    setDownloadError(null);

    if (file.name.toLowerCase().endsWith(".numbers")) {
      setIsNumbersFile(true);
      return;
    }

    try {
      const text = await file.text();
      const result = parsePaymentsCsv(text);
      if (result.payments.length === 0) {
        setParseError("No payment rows found in this file.");
        return;
      }
      acceptParsed(result);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Failed to read file");
    }
  }, [acceptParsed]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  };

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const reset = () => {
    setFileName(null);
    setIsNumbersFile(false);
    setIsDragging(false);
    setPastedText("");
    setParsed(null);
    setParseError(null);
    setDownloadError(null);
    setShowAllTranslit(false);
    setForm({
      senderAccount: "",
      senderBank: "",
      clientName: "",
      creationDate: today(),
      dueDate: today(),
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const creationDdmmrr = useMemo(() => dateInputToDdmmrr(form.creationDate), [form.creationDate]);
  const dueDdmmrr = useMemo(() => dateInputToDdmmrr(form.dueDate), [form.dueDate]);

  const warnings = useMemo<ValidationWarning[]>(() => {
    if (!parsed) return [];
    return validate({
      parsed,
      sender: { account: form.senderAccount, bankCode: form.senderBank },
      clientName: form.clientName,
      creationDateDDMMRR: creationDdmmrr,
      dueDateDDMMRR: dueDdmmrr,
      todayDDMMRR: todayDdmmrr(),
    });
  }, [parsed, form, creationDdmmrr, dueDdmmrr]);

  const transliterationWarnings = useMemo(
    () => warnings.filter((w) => w.kind === "messageTransliterated"),
    [warnings],
  );
  const otherWarnings = useMemo(
    () => warnings.filter((w) => w.kind !== "messageTransliterated"),
    [warnings],
  );

  const totalKc = useMemo(() => {
    if (!parsed) return 0;
    return parsed.payments.reduce((sum, p) => sum + p.amountKc, 0);
  }, [parsed]);

  const warningRows = useMemo(() => {
    const rows = new Set<number>();
    for (const w of warnings) {
      if ("row" in w && typeof w.row === "number") rows.add(w.row);
    }
    return rows;
  }, [warnings]);

  const downloadKpc = () => {
    if (!parsed) return;
    setDownloadError(null);
    try {
      const content = buildKpc(
        {
          clientName: form.clientName.trim() || "CLIENT",
          sender: { account: form.senderAccount, bankCode: form.senderBank },
          creationDateDDMMRR: creationDdmmrr,
          dueDateDDMMRR: dueDdmmrr,
        },
        parsed.payments.map((p) => ({
          recipientAccount: p.recipientAccount,
          recipientBankCode: p.recipientBankCode,
          amountKc: p.amountKc,
          vs: p.vs,
          ks: p.ks,
          ss: p.ss,
          message: p.message,
        })),
      );
      const blob = buildKpcBlob(content);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = suggestKpcFilename({
        clientName: form.clientName,
        sender: { account: form.senderAccount, bankCode: form.senderBank },
        creationDateDDMMRR: creationDdmmrr,
        dueDateDDMMRR: dueDdmmrr,
      });
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : "Failed to build KPC file");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              invoicetable
            </Link>
            <nav className="flex gap-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                Home
              </Link>
              <Link href="/templates" className="text-gray-600 hover:text-gray-900 transition-colors">
                Templates
              </Link>
              <Link href="/guide" className="text-gray-600 hover:text-gray-900 transition-colors">
                Guide
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Hromadné platby (Raiffeisenbank ABO)
          </h1>
          <p className="text-lg text-gray-600">
            Upload your payment CSV or paste rows from Excel, fill in a few details, and download a
            ready-to-import{" "}
            <code className="px-1.5 py-0.5 rounded bg-gray-100 text-sm">.kpc</code> file for RB
            Direct → Hromadné platby → Import. Everything happens in your browser — no upload, no
            storage.
          </p>
        </div>

        {!parsed && !isNumbersFile && (
          <div className="max-w-2xl">
            <div className="inline-flex rounded-lg border border-gray-200 p-1 mb-6 bg-gray-50">
              <button
                type="button"
                onClick={() => setInputMode("file")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  inputMode === "file"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Upload file
              </button>
              <button
                type="button"
                onClick={() => setInputMode("paste")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  inputMode === "paste"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Paste from Excel
              </button>
            </div>

            {inputMode === "file" && (
              <label
                htmlFor="csv-input"
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl px-8 py-12 cursor-pointer transition-colors ${
                  isDragging
                    ? "border-gray-900 bg-gray-100"
                    : "border-gray-300 hover:border-gray-500 bg-gray-50"
                }`}
              >
                <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
                </svg>
                <span className="text-gray-900 font-medium mb-1">
                  {isDragging ? "Drop the CSV file here" : "Drag & drop a CSV file"}
                </span>
                <span className="text-sm text-gray-500">or click to browse</span>
                <span className="mt-4 inline-flex items-center justify-center px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">
                  Browse…
                </span>
                <input
                  id="csv-input"
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv,.numbers"
                  className="hidden"
                  onChange={onFileChange}
                />
              </label>
            )}

            {inputMode === "paste" && (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Select the rows in Excel (including the header and the “Číslo účtu - příkazce” block)
                  and paste here with{" "}
                  <kbd className="px-1.5 py-0.5 border border-gray-300 rounded text-xs bg-gray-50">Cmd/Ctrl + V</kbd>.
                </p>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  onPaste={(e) => {
                    const text = e.clipboardData.getData("text");
                    if (text) {
                      e.preventDefault();
                      setPastedText(text);
                      handleText(text, "pasted text");
                    }
                  }}
                  placeholder={`Číslo účtu - příjemce\tKód banky\tČástka\tVariabilní symbol Poznámka\tKonst.\tsymbol\tSpecifický symbol\n7720-77628031\t710\t3 367,00\t6392989 2026/03\t1148\t\t\n…\nČíslo účtu - příkazce\n2801303027\t2010\t…`}
                  rows={10}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-gray-900"
                />
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleText(pastedText, "pasted text")}
                    disabled={!pastedText.trim()}
                    className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Parse
                  </button>
                  {pastedText && (
                    <button
                      type="button"
                      onClick={() => setPastedText("")}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}

            {parseError && (
              <div className="mt-6 p-4 rounded-lg border border-red-200 bg-red-50 text-red-800 text-sm">
                {parseError}
              </div>
            )}

            <div className="mt-10 text-sm text-gray-600 space-y-2">
              <p className="font-medium text-gray-900">Expected shape</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Header row with columns: account, bank, amount, VS+note, KS, (empty), SS</li>
                <li>One row per payment</li>
                <li>A separator row beginning with “Číslo účtu - příkazce”</li>
                <li>One sender row below: account, bank code, …</li>
              </ul>
              <p className="text-xs text-gray-500 mt-3">
                Both <code>;</code>-separated CSV and tab-separated text (Excel paste) are auto-detected.
              </p>
            </div>
          </div>
        )}

        {isNumbersFile && (
          <div className="max-w-2xl">
            <div className="p-6 rounded-xl border border-amber-300 bg-amber-50 text-amber-900">
              <h2 className="text-lg font-semibold mb-2">Apple Numbers files aren’t parsed in the browser</h2>
              <p className="mb-3 text-sm">
                The <code>.numbers</code> format is a proprietary archive that we don’t parse here.
                Export to CSV first:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Open the file in Numbers</li>
                <li>File → Export To → CSV…</li>
                <li>Choose UTF-8 encoding</li>
                <li>Re-upload the resulting <code>.csv</code> below</li>
              </ol>
              <button
                type="button"
                onClick={reset}
                className="mt-5 inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
              >
                Upload a different file
              </button>
              {fileName && (
                <p className="mt-3 text-xs text-amber-800">Selected: {fileName}</p>
              )}
            </div>
          </div>
        )}

        {parsed && (
          <div className="grid lg:grid-cols-2 gap-10">
            {/* LEFT: form */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-gray-900">{fileName ?? "Pasted data"}</span>
                  {" · "}
                  {parsed.payments.length} payments
                </div>
                <button
                  type="button"
                  onClick={reset}
                  className="ml-auto text-sm text-gray-600 hover:text-gray-900 underline underline-offset-4"
                >
                  Start over
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Sender account
                  </label>
                  <input
                    type="text"
                    value={form.senderAccount}
                    onChange={(e) => setForm({ ...form, senderAccount: e.target.value.trim() })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-gray-900"
                    placeholder="e.g. 1063929890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Sender bank code
                  </label>
                  <input
                    type="text"
                    value={form.senderBank}
                    onChange={(e) => setForm({ ...form, senderBank: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                    className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-gray-900"
                    placeholder="5500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Client name <span className="text-red-600">*</span>
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      {form.clientName.length} / 20
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: sanitizeClientName(e.target.value) })}
                    className={`w-full border rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:border-gray-900 ${
                      form.clientName.trim() ? "border-gray-300" : "border-red-300"
                    }`}
                    placeholder="PRAGUE RENTAL SVCS"
                  />
                  <p className={`mt-1 text-xs ${form.clientName.trim() ? "text-gray-500" : "text-red-600"}`}>
                    {form.clientName.trim()
                      ? "Uppercase ASCII letters, digits, and spaces — max 20."
                      : "Required for the .kpc header."}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Creation date
                    </label>
                    <input
                      type="date"
                      value={form.creationDate}
                      onChange={(e) => setForm({ ...form, creationDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Due date
                    </label>
                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={downloadKpc}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                  >
                    Download .kpc
                  </button>
                  {downloadError && (
                    <p className="mt-3 text-sm text-red-700">{downloadError}</p>
                  )}
                  <p className="mt-3 text-xs text-gray-500">
                    Recipient accounts are written in the <code>prefix-base</code> form they
                    appear in the source. If RB Direct refuses an account, edit the source.
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT: preview + warnings */}
            <div>
              {otherWarnings.length > 0 && (
                <div className="mb-4 p-4 rounded-xl border border-amber-300 bg-amber-50">
                  <h3 className="text-sm font-semibold text-amber-900 mb-2">
                    {otherWarnings.length} warning{otherWarnings.length === 1 ? "" : "s"} — won’t block download
                  </h3>
                  <ul className="space-y-1 text-sm text-amber-900">
                    {otherWarnings.map((w, i) => (
                      <li key={i}>{warningText(w)}</li>
                    ))}
                  </ul>
                </div>
              )}

              {transliterationWarnings.length > 0 && (
                <div className="mb-6 p-4 rounded-xl border border-blue-200 bg-blue-50">
                  <button
                    type="button"
                    onClick={() => setShowAllTranslit((v) => !v)}
                    className="flex items-center justify-between w-full text-left text-sm font-semibold text-blue-900"
                  >
                    <span>
                      {transliterationWarnings.length} message{transliterationWarnings.length === 1 ? "" : "s"} transliterated to ASCII (informational)
                    </span>
                    <span className="text-xs font-normal text-blue-700">
                      {showAllTranslit ? "Hide details" : "Show details"}
                    </span>
                  </button>
                  {showAllTranslit && (
                    <ul className="mt-3 space-y-1 text-sm text-blue-900">
                      {transliterationWarnings.map((w, i) => (
                        <li key={i}>{warningText(w)}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto max-h-[60vh]">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr className="text-left text-gray-700">
                        <th className="px-2 py-2 font-medium">#</th>
                        <th className="px-2 py-2 font-medium">Account</th>
                        <th className="px-2 py-2 font-medium">Bank</th>
                        <th className="px-2 py-2 font-medium text-right">Amount Kč</th>
                        <th className="px-2 py-2 font-medium">VS</th>
                        <th className="px-2 py-2 font-medium">KS</th>
                        <th className="px-2 py-2 font-medium">SS</th>
                        <th className="px-2 py-2 font-medium">Message (ASCII)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-mono">
                      {parsed.payments.map((p, idx) => {
                        const flagged = warningRows.has(p.sourceLine);
                        return (
                          <tr key={idx} className={flagged ? "bg-amber-50" : ""}>
                            <td className="px-2 py-1.5 text-gray-500">{idx + 1}</td>
                            <td className="px-2 py-1.5">{p.recipientAccount}</td>
                            <td className="px-2 py-1.5">{p.recipientBankCode}</td>
                            <td className="px-2 py-1.5 text-right">{p.amountKc.toLocaleString("cs-CZ")}</td>
                            <td className="px-2 py-1.5">{p.vs}</td>
                            <td className="px-2 py-1.5">{p.ks}</td>
                            <td className="px-2 py-1.5">{p.ss}</td>
                            <td className="px-2 py-1.5 truncate max-w-[20ch]" title={p.message}>{p.message}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gray-50 sticky bottom-0">
                      <tr>
                        <td colSpan={3} className="px-2 py-2 font-medium text-gray-700">
                          {parsed.payments.length} payments
                        </td>
                        <td className="px-2 py-2 text-right font-medium text-gray-900">
                          {totalKc.toLocaleString("cs-CZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td colSpan={4} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function warningText(w: ValidationWarning): string {
  switch (w.kind) {
    case "modulo11Recipient":
      return `Row #${w.row}: account ${w.account} fails Modulo 11 — bank may reject.`;
    case "modulo11Sender":
      return `Sender account ${w.account} fails Modulo 11.`;
    case "messageTransliterated":
      return `Row #${w.row}: "${w.original}" → "${w.ascii}".`;
    case "messageTruncated":
      return `Row #${w.row}: message truncated to 35 chars (was ${w.originalLength}).`;
    case "amountZero":
      return `Row #${w.row}: amount is 0.`;
    case "dueDateInPast":
      return `Due date ${w.due} is in the past — bank will reject.`;
    case "creationDateInFuture":
      return `Creation date ${w.creation} is in the future.`;
    case "clientNameInvalid":
      return `Client name: ${w.reason}.`;
    case "missingSender":
      return `No "Číslo účtu - příkazce" row found — fill the sender fields manually.`;
    case "ignoredRow":
      return `Skipped row #${w.row}: ${w.reason}.`;
  }
}
