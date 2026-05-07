export type KpcSender = { account: string; bankCode: string };

export type KpcSettings = {
  clientName: string;
  sender: KpcSender;
  creationDateDDMMRR: string;
  dueDateDDMMRR: string;
};

export type KpcPayment = {
  recipientAccount: string;
  recipientBankCode: string;
  amountKc: number;
  vs: string;
  ks: string;
  ss: string;
  message: string;
};

function pad4(s: string): string {
  return (s ?? "").replace(/\D/g, "").padStart(4, "0").slice(-4);
}

function toHalere(amountKc: number): number {
  return Math.round(amountKc * 100);
}

export function buildUhl1Line(creationDateDDMMRR: string, clientName: string): string {
  const date = ensureDdmmrr(creationDateDDMMRR, "creation date");
  const namePadded = clientName.padEnd(20, " ").slice(0, 20);
  const line = `UHL1${date}${namePadded}1234567890001999111111222222`;
  if (line.length !== 58) {
    throw new Error(`UHL1 line length ${line.length}, expected 58`);
  }
  return line;
}

export function buildKpc(settings: KpcSettings, payments: KpcPayment[]): string {
  const creation = ensureDdmmrr(settings.creationDateDDMMRR, "creation date");
  const due = ensureDdmmrr(settings.dueDateDDMMRR, "due date");
  const senderBank = pad4(settings.sender.bankCode);
  const senderAccount = settings.sender.account.trim();

  const lines: string[] = [];
  lines.push(buildUhl1Line(creation, settings.clientName));
  lines.push(`1 1501 111111 ${senderBank}`);

  const totalHalere = payments.reduce((sum, p) => sum + toHalere(p.amountKc), 0);
  lines.push(`2 ${senderAccount} ${totalHalere} ${due}`);

  for (const p of payments) {
    const halere = toHalere(p.amountKc);
    const vs = (p.vs && p.vs !== "0") ? p.vs.replace(/\D/g, "") : "0";
    const ksField = pad4(p.recipientBankCode) + pad4(p.ks);
    const ss = (p.ss && p.ss !== "0") ? p.ss.replace(/\D/g, "") : "0";
    const message = (p.message ?? "").slice(0, 35);
    lines.push(`${p.recipientAccount} ${halere} ${vs} ${ksField} ${ss} AV:${message}`);
  }

  lines.push("3 +");
  lines.push("5 +");

  const content = lines.join("\r\n") + "\r\n";
  assertAscii(content);
  return content;
}

export function buildKpcBlob(content: string): Blob {
  return new Blob([content], { type: "text/plain;charset=us-ascii" });
}

export function suggestKpcFilename(settings: KpcSettings): string {
  const due = settings.dueDateDDMMRR.replace(/\D/g, "") || "platby";
  return `prikazy_${due}.kpc`;
}

export function dateInputToDdmmrr(value: string): string {
  // Accepts "YYYY-MM-DD" from <input type="date">
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "";
  const [, y, mo, d] = m;
  return `${d}${mo}${y.slice(-2)}`;
}

export function todayDdmmrr(now: Date = new Date()): string {
  const d = String(now.getDate()).padStart(2, "0");
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const y = String(now.getFullYear() % 100).padStart(2, "0");
  return `${d}${m}${y}`;
}

function ensureDdmmrr(s: string, label: string): string {
  if (!/^\d{6}$/.test(s)) {
    throw new Error(`Invalid ${label} (expected DDMMRR): ${s}`);
  }
  return s;
}

function assertAscii(s: string): void {
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if (code > 0x7f) {
      throw new Error(`Non-ASCII character at position ${i}: U+${code.toString(16).toUpperCase()}`);
    }
  }
}
