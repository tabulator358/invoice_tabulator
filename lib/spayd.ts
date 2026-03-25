import { InvoiceData } from "@/types/invoice";

/**
 * Converts Czech bank account format (123456789/0100) to IBAN format
 * For SPAYD, we can use either IBAN or Czech format, but IBAN is preferred
 */
function normalizeDashes(input: string): string {
  // Normalize different dash characters (copy/paste) to a simple '-'
  return input.replace(/[–—−]/g, "-");
}

function normalizeCzechBankAccountWithPrefix(account: string): string {
  // Expected input formats (after trimming/spaces removal):
  // - 123456789/0100
  // - prefix-accountNumber/0100  (předčíslí-číslo účtu)
  //   Pomlčka: mezi předčíslím a číslem účtu musí být právě jedna pomlčka (mínus).
  const cleaned = normalizeDashes(account.replace(/\s/g, ""));

  // If no bank code separator, we can't normalize the prefix/account reliably.
  const slashIndex = cleaned.indexOf("/");
  if (slashIndex === -1) return cleaned;

  const accountPartRaw = cleaned.slice(0, slashIndex);
  const bankCodeRaw = cleaned.slice(slashIndex + 1);

  const bankCodeDigits = bankCodeRaw.replace(/\D/g, "");
  const bankCodePadded = bankCodeDigits.padStart(4, "0").slice(-4);

  // If it's in prefix-accountNumber format, convert it to the 10-digit account
  // used by SPAYD (prefix(4 digits) + last6(accountNumber)).
  if (accountPartRaw.includes("-")) {
    const [prefixRaw, ...rest] = accountPartRaw.split("-");
    const accountDigitsRaw = rest.join(""); // remove extra '-' if any

    const prefixDigits = prefixRaw.replace(/\D/g, "");
    const accountDigits = accountDigitsRaw.replace(/\D/g, "");

    // Preserve the dash exactly like in the input:
    // 7720-77628031/0710
    const czechAccount = `${prefixDigits}-${accountDigits}`;
    return `${czechAccount}/${bankCodePadded}`;
  }

  // Fallback: keep as Czech account, but remove non-digits from the account number.
  const accountDigits = accountPartRaw.replace(/\D/g, "");
  return `${accountDigits}/${bankCodePadded}`;
}

function formatAccountForSPAYD(account: string): string {
  const cleaned = normalizeDashes(account);

  // If already IBAN format (starts with CZ), return as is (remove spaces)
  if (cleaned.toUpperCase().startsWith("CZ")) {
    return cleaned.replace(/\s/g, "").toUpperCase();
  }

  // For Czech format, normalize potential "předčíslí-číslo účtu/XXXX" into SPAYD-compatible
  // 10-digit account (prefix(4 digits) + last6(accountNumber)).
  return normalizeCzechBankAccountWithPrefix(cleaned);
}

/**
 * Generates SPAYD (Short Payment Descriptor) string for Czech QR payments
 * Format: SPD*1.0*ACC:{account}*AM:{amount}*CC:{currency}*VS:{variable_symbol}*MSG:{message}
 * 
 * According to Czech SPAYD specification:
 * - ACC: Account in IBAN format (preferred) or Czech format
 * - AM: Amount with 2 decimal places
 * - CC: Currency code (3 letters)
 * - VS: Variable symbol (numeric, up to 10 digits)
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

  // Variable Symbol (VS) - optional but recommended
  if (invoiceData.invoiceNumber) {
    // Extract numeric part, max 10 digits
    const variableSymbol = invoiceData.invoiceNumber.replace(/\D/g, "").substring(0, 10);
    if (variableSymbol && variableSymbol.length > 0) {
      parts.push(`VS:${variableSymbol}`);
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

