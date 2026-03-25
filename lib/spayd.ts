import { InvoiceData } from "@/types/invoice";

function normalizeDashes(input: string): string {
  // Normalize different dash characters (copy/paste) to a simple '-'
  return input.replace(/[–—−]/g, "-");
}

function mod97(value: string): number {
  let remainder = 0;
  for (const char of value) {
    remainder = (remainder * 10 + Number(char)) % 97;
  }
  return remainder;
}

function isValidCzIban(iban: string): boolean {
  if (!/^CZ\d{22}$/.test(iban)) return false;
  const rearranged = `${iban.slice(4)}1235${iban.slice(2, 4)}`;
  return mod97(rearranged) === 1;
}

function parseCzechLocalAccount(account: string, bankCodeOverride?: string): {
  accountNumber: string;
  prefix: string;
  bankCode: string;
} {
  const cleaned = normalizeDashes(account.replace(/\s/g, ""));
  const slashIndex = cleaned.indexOf("/");

  const accountPartRaw = slashIndex === -1 ? cleaned : cleaned.slice(0, slashIndex);
  const bankCodeRaw = slashIndex === -1 ? bankCodeOverride ?? "" : cleaned.slice(slashIndex + 1);

  const bankCodeDigits = bankCodeRaw.replace(/\D/g, "");
  if (!bankCodeDigits || bankCodeDigits.length > 4) {
    throw new Error("Invalid Czech bank code for IBAN conversion");
  }

  const [prefixRaw, ...rest] = accountPartRaw.split("-");
  const hasPrefix = rest.length > 0;

  const prefixDigits = hasPrefix ? prefixRaw.replace(/\D/g, "") : "";
  const accountDigits = (hasPrefix ? rest.join("") : prefixRaw).replace(/\D/g, "");

  if (!accountDigits || accountDigits.length > 10) {
    throw new Error("Invalid Czech account number for IBAN conversion");
  }
  if (prefixDigits.length > 6) {
    throw new Error("Invalid Czech account prefix for IBAN conversion");
  }

  return {
    accountNumber: accountDigits.padStart(10, "0"),
    prefix: prefixDigits.padStart(6, "0"),
    bankCode: bankCodeDigits.padStart(4, "0"),
  };
}

export function formatAccountForSPAYD(account: string, bankCodeOverride?: string): string {
  const normalized = normalizeDashes(account).replace(/\s/g, "").toUpperCase();

  if (normalized.startsWith("CZ")) {
    if (!isValidCzIban(normalized)) {
      throw new Error("Invalid CZ IBAN format");
    }
    return normalized;
  }

  const local = parseCzechLocalAccount(normalized, bankCodeOverride);
  const bban = `${local.bankCode}${local.prefix}${local.accountNumber}`;
  const checksum = 98 - mod97(`${bban}123500`);
  const checksumStr = String(checksum).padStart(2, "0");
  return `CZ${checksumStr}${bban}`;
}

/**
 * Generates SPAYD (Short Payment Descriptor) string for Czech QR payments
 * Format: SPD*1.0*ACC:{IBAN}*AM:{amount}*CC:{currency}*X-VS:{variable_symbol}*MSG:{message}
 * 
 * According to Czech SPAYD specification:
 * - ACC: Account in IBAN format
 * - AM: Amount with 2 decimal places
 * - CC: Currency code (3 letters)
 * - X-VS: Variable symbol (numeric, up to 10 digits)
 * - MSG: Message (UTF-8, max 60 chars, no URL encoding needed)
 */
export function generateSPAYD(invoiceData: InvoiceData, total: number): string {
  const parts: string[] = ["SPD*1.0"];

  // Account (ACC) - required
  if (invoiceData.bankAccount) {
    const account = formatAccountForSPAYD(invoiceData.bankAccount);
    parts.push(`ACC:${account}`);
  }

  // Amount (AM) - required, format with 2 decimal places, no thousands separator
  const amount = total.toFixed(2);
  parts.push(`AM:${amount}`);

  // Currency (CC) - required, default to CZK
  const currency = (invoiceData.currencyCode?.toUpperCase() || "CZK").substring(0, 3);
  parts.push(`CC:${currency}`);

  // Variable Symbol (X-VS) - optional but recommended for Czech payments
  if (invoiceData.invoiceNumber) {
    // Extract numeric part, max 10 digits
    const variableSymbol = invoiceData.invoiceNumber.replace(/\D/g, "").substring(0, 10);
    if (variableSymbol && variableSymbol.length > 0) {
      parts.push(`X-VS:${variableSymbol}`);
    }
  }

  // Message (MSG) - optional, max 60 characters, UTF-8 (no URL encoding)
  // Remove special characters that might cause issues
  if (invoiceData.comment) {
    const message = invoiceData.comment
      .replace(/[*]/g, "") // Remove asterisks (SPAYD delimiter)
      .replace(/\n/g, " ") // Replace newlines with spaces
      .trim()
      .substring(0, 60);
    if (message) {
      parts.push(`MSG:${message}`);
    }
  } else if (invoiceData.invoiceNumber) {
    // Use invoice number as fallback message if no comment
    const message = `Faktura ${invoiceData.invoiceNumber}`
      .replace(/[*]/g, "")
      .trim()
      .substring(0, 60);
    if (message) {
      parts.push(`MSG:${message}`);
    }
  }

  return parts.join("*");
}

