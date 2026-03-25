import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import QRCode from "qrcode";

export const runtime = "nodejs";

const MAX_MSG_LEN = 60;

function parseAmountCzk(raw: string): number {
  // Accept inputs like:
  // - "2690,00"
  // - "2 690,00"
  // - "2690.00"
  const normalized = raw.replace(/\s+/g, "").replace(",", ".");
  const amount = Number.parseFloat(normalized);
  if (!Number.isFinite(amount)) throw new Error("Invalid ammount_czk");
  return amount;
}

function sanitizeMsg(raw: string): string {
  // SPAYD delimiter is "*" so we must remove it. Also keep it single-line.
  return raw
    .replace(/\*/g, "")
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, MAX_MSG_LEN);
}

function buildSpaydAcc(payToRaw: string, bankCodePadded: string): string {
  const cleaned = payToRaw
    .trim()
    .replace(/\s+/g, "")
    .replace(/[–—−]/g, "-"); // Normalize copy/paste dashes to '-'
  // If it's already an IBAN, use as-is.
  if (/^CZ[A-Z0-9]{2,}/i.test(cleaned)) {
    return cleaned.toUpperCase();
  }

  // Expected Czech account is commonly represented as:
  //   prefix-accountNumber (input uses '-' between prefix and account number)
  // We convert it to the "prefix+accountNumber(6 digits)" form:
  //   ACC: {10-digit-account}/{bankCode(4 digits)}
  //
  // Example:
  //   pay_to=7720-77628031, bank_code=710
  //   => account=7720 + last6(77628031)=628031 => 7720628031
  // Allow exactly one '-' between prefix and account number; if the input contains
  // multiple '-', we still treat the first '-' as the separator and remove the rest.
  const [prefixRaw, ...rest] = cleaned.split("-");
  if (prefixRaw && rest.length > 0) {
    const prefixDigits = prefixRaw.replace(/\D/g, "");
    const accountDigits = rest.join("").replace(/\D/g, "");

    // Preserve the dash exactly like it is in the URL input:
    // pay_to=7720-77628031 => ACC:7720-77628031/0710
    const czechAccount = `${prefixDigits}-${accountDigits}`;
    return `${czechAccount}/${bankCodePadded}`;
  }

  // Fallback: treat pay_to as already numeric.
  const numeric = cleaned.replace(/\D/g, "");
  // Czech accounts have 10 digits; if longer, take last 10.
  const czechAccount = numeric.length >= 10 ? numeric.slice(-10) : numeric.padStart(10, "0");
  return `${czechAccount}/${bankCodePadded}`;
}

function buildSpaydFromSearchParams(searchParams: URLSearchParams): string {
  const payTo = searchParams.get("pay_to")?.trim();
  const bankCode = searchParams.get("bank_code")?.trim();
  const amountRaw = searchParams.get("ammount_czk")?.trim();
  const variableSymbol = searchParams.get("variable_symbol")?.trim();
  const note = searchParams.get("note")?.trim();

  if (!payTo) throw new Error("Missing pay_to");
  if (!bankCode) throw new Error("Missing bank_code");
  if (!amountRaw) throw new Error("Missing ammount_czk");
  if (!variableSymbol) throw new Error("Missing variable_symbol");
  if (!note) throw new Error("Missing note");

  const bankCodePadded = bankCode.padStart(4, "0");
  const amount = parseAmountCzk(amountRaw);
  const msg = sanitizeMsg(note);
  const acc = buildSpaydAcc(payTo, bankCodePadded);

  // SPAYD fields are '*' delimited; spec expects the descriptor to end with '*'.
  return [
    "SPD*1.0",
    `ACC:${acc}`,
    `AM:${amount.toFixed(2)}`,
    "CC:CZK",
    `VS:${variableSymbol}`,
    `MSG:${msg}`,
  ].join("*") + "*";
}

export async function GET(req: NextRequest) {
  try {
    const spayd = buildSpaydFromSearchParams(req.nextUrl.searchParams);
    const pngBuffer = await QRCode.toBuffer(spayd, {
      type: "png",
      width: 300,
      errorCorrectionLevel: "M",
      margin: 1,
    });

    return new NextResponse(pngBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "QR generation error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function HEAD(req: NextRequest) {
  try {
    // Validate parameters without generating QR (faster for curl -I).
    buildSpaydFromSearchParams(req.nextUrl.searchParams);
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "QR generation error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

