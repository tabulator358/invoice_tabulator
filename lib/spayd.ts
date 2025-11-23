import { InvoiceData } from "@/types/invoice";

/**
 * Converts Czech bank account format (123456789/0100) to IBAN format
 * For SPAYD, we can use either IBAN or Czech format, but IBAN is preferred
 */
function formatAccountForSPAYD(account: string): string {
  // If already IBAN format (starts with CZ), return as is (remove spaces)
  if (account.toUpperCase().startsWith("CZ")) {
    return account.replace(/\s/g, "").toUpperCase();
  }

  // For Czech format (123456789/0100), we can use it directly in SPAYD
  // Some banks accept this format, but IBAN is preferred
  // For now, return as-is - user should provide IBAN for best compatibility
  return account.replace(/\s/g, "");
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
    let message = invoiceData.comment
      .replace(/[*]/g, "") // Remove asterisks (SPAYD delimiter)
      .replace(/\n/g, " ") // Replace newlines with spaces
      .trim()
      .substring(0, 60);
    if (message) {
      parts.push(`MSG:${message}`);
    }
  } else if (invoiceData.invoiceNumber) {
    // Use invoice number as fallback message if no comment
    let message = `Faktura ${invoiceData.invoiceNumber}`
      .replace(/[*]/g, "")
      .trim()
      .substring(0, 60);
    if (message) {
      parts.push(`MSG:${message}`);
    }
  }

  return parts.join("*");
}

