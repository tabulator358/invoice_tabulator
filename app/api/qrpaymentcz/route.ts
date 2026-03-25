import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { formatAccountForSPAYD } from "@/lib/spayd";

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

  const bankCodePadded = bankCode.replace(/\D/g, "").padStart(4, "0");
  const amount = parseAmountCzk(amountRaw);
  const msg = sanitizeMsg(note);
  const acc = formatAccountForSPAYD(payTo, bankCodePadded);
  const vsDigits = variableSymbol.replace(/\D/g, "").substring(0, 10);
  if (!vsDigits) throw new Error("Invalid variable_symbol");

  // SPAYD fields are '*' delimited; spec expects the descriptor to end with '*'.
  return [
    "SPD*1.0",
    `ACC:${acc}`,
    `AM:${amount.toFixed(2)}`,
    "CC:CZK",
    `X-VS:${vsDigits}`,
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

