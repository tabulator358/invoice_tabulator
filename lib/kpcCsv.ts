export type RawPayment = {
  recipientAccount: string;
  recipientBankCode: string;
  amountKc: number;
  vs: string;
  ks: string;
  ss: string;
  message: string;
  rawAmount: string;
  rawVsPoznamka: string;
  sourceLine: number;
};

export type ParsedCsv = {
  payments: RawPayment[];
  sender: { account: string; bankCode: string } | null;
  ignoredRows: { lineNumber: number; reason: string }[];
};

const SPECIAL_TRANSLIT: Record<string, string> = {
  đ: "d", Đ: "D", ł: "l", Ł: "L", ø: "o", Ø: "O",
  ß: "ss", æ: "ae", Æ: "AE", œ: "oe", Œ: "OE",
  þ: "th", Þ: "Th",
};

export function asciiTransliterate(input: string): string {
  if (!input) return "";
  const decomposed = input.normalize("NFD").replace(/\p{M}/gu, "");
  let out = "";
  for (const ch of decomposed) {
    const code = ch.codePointAt(0) ?? 0;
    if (code <= 0x7f) {
      out += ch;
    } else if (SPECIAL_TRANSLIT[ch]) {
      out += SPECIAL_TRANSLIT[ch];
    } else {
      out += "?";
    }
  }
  return out.replace(/\s+/g, " ").trim();
}

export function splitVsAndMessage(merged: string): { vs: string; message: string } {
  const trimmed = (merged ?? "").trim();
  if (!trimmed) return { vs: "", message: "" };
  const m = trimmed.match(/^(\d+)\s*([\s\S]*)$/);
  if (!m) return { vs: "", message: trimmed };
  return { vs: m[1], message: m[2].trim() };
}

export function parseCzAmount(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/ /g, "").replace(/\s+/g, "").replace(",", ".");
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function digits(s: string): string {
  return (s ?? "").replace(/\D/g, "");
}

function modulo11Part(value: string, weights: number[]): boolean {
  if (!value) return true;
  const padded = value.padStart(weights.length, "0");
  if (padded.length !== weights.length) return false;
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += weights[i] * Number(padded[i]);
  }
  return sum % 11 === 0;
}

const BASE_WEIGHTS = [6, 3, 7, 9, 10, 5, 8, 4, 2, 1];
const PREFIX_WEIGHTS = [10, 5, 8, 4, 2, 1];

export function isValidModulo11(account: string): boolean {
  if (!account) return false;
  const normalized = account.replace(/[\s–—−]/g, "").replace(/[–—−]/g, "-");
  const parts = normalized.split("-");
  let prefix = "";
  let base = "";
  if (parts.length === 1) {
    base = digits(parts[0]);
  } else if (parts.length === 2) {
    prefix = digits(parts[0]);
    base = digits(parts[1]);
  } else {
    return false;
  }
  if (!base || base.length > 10) return false;
  if (prefix.length > 6) return false;
  return modulo11Part(base, BASE_WEIGHTS) && modulo11Part(prefix, PREFIX_WEIGHTS);
}

function splitDelimitedLine(line: string, delimiter: string): string[] {
  // Minimal splitter — no embedded quotes/delimiters in the supported fixtures.
  const stripped = line.replace(/^﻿/, "");
  return stripped.split(delimiter).map((c) => c.trim());
}

function detectDelimiter(text: string): string {
  // Excel paste produces tab-delimited text; bank CSV exports use ';'.
  // Pick whichever appears more often; prefer ';' on ties.
  const tabs = (text.match(/\t/g) ?? []).length;
  const semis = (text.match(/;/g) ?? []).length;
  return tabs > semis ? "\t" : ";";
}

function isSenderSeparator(cells: string[]): boolean {
  const first = (cells[0] ?? "").toLowerCase();
  return first.startsWith("číslo účtu - příkazce")
    || first.startsWith("cislo uctu - prikazce")
    || /příkazce/.test(first);
}

function isHeaderRow(cells: string[]): boolean {
  const first = (cells[0] ?? "").toLowerCase();
  return first.includes("číslo účtu - příjemce")
    || first.includes("cislo uctu - prijemce")
    || (first.includes("účtu") && first.includes("příjemce"));
}

function normalizeBank(raw: string): string {
  const d = digits(raw);
  return d ? d.padStart(4, "0").slice(-4) : "";
}

export function parsePaymentsCsv(text: string): ParsedCsv {
  const ignoredRows: { lineNumber: number; reason: string }[] = [];
  const payments: RawPayment[] = [];
  let sender: { account: string; bankCode: string } | null = null;

  const delimiter = detectDelimiter(text);
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  let inSenderSection = false;

  for (let i = 0; i < lines.length; i++) {
    const lineNumber = i + 1;
    const raw = lines[i];
    if (!raw) continue;
    const cells = splitDelimitedLine(raw, delimiter);
    const allEmpty = cells.every((c) => c === "");
    if (allEmpty) continue;

    if (isSenderSeparator(cells)) {
      inSenderSection = true;
      continue;
    }
    if (isHeaderRow(cells) && payments.length === 0 && !inSenderSection) {
      continue;
    }

    if (inSenderSection) {
      const account = (cells[0] ?? "").trim();
      const bank = normalizeBank(cells[1] ?? "");
      if (account && bank) {
        sender = { account, bankCode: bank };
        inSenderSection = false;
      } else {
        ignoredRows.push({ lineNumber, reason: "Sender row missing account or bank code" });
      }
      continue;
    }

    const account = (cells[0] ?? "").trim();
    const bank = normalizeBank(cells[1] ?? "");
    const rawAmount = (cells[2] ?? "").trim();
    const rawVsPoznamka = (cells[3] ?? "").trim();
    const ksRaw = digits(cells[4] ?? "");
    const ssRaw = digits(cells[6] ?? cells[5] ?? "");

    if (!account && !bank && !rawAmount) continue;

    if (!account || !bank) {
      ignoredRows.push({ lineNumber, reason: "Missing account or bank code" });
      continue;
    }

    const amountKc = parseCzAmount(rawAmount);
    const { vs, message } = splitVsAndMessage(rawVsPoznamka);

    payments.push({
      recipientAccount: account,
      recipientBankCode: bank,
      amountKc,
      vs: vs || "0",
      ks: ksRaw || "0",
      ss: ssRaw || "0",
      message: asciiTransliterate(message).slice(0, 35),
      rawAmount,
      rawVsPoznamka,
      sourceLine: lineNumber,
    });
  }

  return { payments, sender, ignoredRows };
}

export type ValidationWarning =
  | { kind: "modulo11Recipient"; row: number; account: string }
  | { kind: "modulo11Sender"; account: string }
  | { kind: "messageTransliterated"; row: number; original: string; ascii: string }
  | { kind: "messageTruncated"; row: number; originalLength: number }
  | { kind: "amountZero"; row: number }
  | { kind: "dueDateInPast"; due: string }
  | { kind: "creationDateInFuture"; creation: string }
  | { kind: "clientNameInvalid"; reason: string }
  | { kind: "missingSender" }
  | { kind: "ignoredRow"; row: number; reason: string };

export function validate(input: {
  parsed: ParsedCsv;
  sender: { account: string; bankCode: string };
  clientName: string;
  creationDateDDMMRR: string;
  dueDateDDMMRR: string;
  todayDDMMRR: string;
}): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  if (!input.parsed.sender) {
    warnings.push({ kind: "missingSender" });
  }

  for (const ig of input.parsed.ignoredRows) {
    warnings.push({ kind: "ignoredRow", row: ig.lineNumber, reason: ig.reason });
  }

  for (const p of input.parsed.payments) {
    if (!isValidModulo11(p.recipientAccount)) {
      warnings.push({ kind: "modulo11Recipient", row: p.sourceLine, account: p.recipientAccount });
    }
    const originalMessage = splitVsAndMessage(p.rawVsPoznamka).message;
    const ascii = asciiTransliterate(originalMessage);
    if (ascii && ascii !== originalMessage) {
      warnings.push({ kind: "messageTransliterated", row: p.sourceLine, original: originalMessage, ascii });
    }
    if (ascii.length > 35) {
      warnings.push({ kind: "messageTruncated", row: p.sourceLine, originalLength: ascii.length });
    }
    if (p.amountKc === 0) {
      warnings.push({ kind: "amountZero", row: p.sourceLine });
    }
  }

  if (input.sender.account && !isValidModulo11(input.sender.account)) {
    warnings.push({ kind: "modulo11Sender", account: input.sender.account });
  }

  if (compareDdmmrr(input.dueDateDDMMRR, input.todayDDMMRR) < 0) {
    warnings.push({ kind: "dueDateInPast", due: input.dueDateDDMMRR });
  }
  if (compareDdmmrr(input.creationDateDDMMRR, input.todayDDMMRR) > 0) {
    warnings.push({ kind: "creationDateInFuture", creation: input.creationDateDDMMRR });
  }

  if (input.clientName.length > 0 && !/^[A-Z0-9 ]+$/.test(input.clientName)) {
    warnings.push({ kind: "clientNameInvalid", reason: "Client name must be uppercase letters, digits, and spaces only" });
  } else if (input.clientName.length > 20) {
    warnings.push({ kind: "clientNameInvalid", reason: "Client name longer than 20 characters" });
  }

  return warnings;
}

function compareDdmmrr(a: string, b: string): number {
  const aKey = ddmmrrSortKey(a);
  const bKey = ddmmrrSortKey(b);
  return aKey < bKey ? -1 : aKey > bKey ? 1 : 0;
}

function ddmmrrSortKey(s: string): string {
  if (!/^\d{6}$/.test(s)) return "000000";
  return s.slice(4, 6) + s.slice(2, 4) + s.slice(0, 2);
}
