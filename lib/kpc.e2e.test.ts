import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parsePaymentsCsv, validate } from "@/lib/kpcCsv";
import { buildKpc, todayDdmmrr } from "@/lib/kpc";

const CSV_PATH = "/Users/pavelrezabek/Desktop/invoice_tabulator/zadani/Příkazy PRS 03:26.csv";

test("end-to-end: sample CSV → KPC bytes", () => {
  const text = readFileSync(CSV_PATH, "utf-8");
  const parsed = parsePaymentsCsv(text);

  assert.equal(parsed.payments.length, 28, "expected 28 payment rows");
  assert.deepEqual(parsed.sender, { account: "2801303027", bankCode: "2010" });

  const today = todayDdmmrr();
  const content = buildKpc(
    {
      clientName: "PRAGUE RENTAL SVCS",
      sender: parsed.sender!,
      creationDateDDMMRR: today,
      dueDateDDMMRR: today,
    },
    parsed.payments,
  );

  const lines = content.split("\r\n");
  // 28 payments + UHL1 + 1 + 2 + 3+ + 5+ = 33 actual lines, plus a trailing empty from the final CRLF
  assert.equal(lines.length, 34, `expected 34 split parts, got ${lines.length}`);
  assert.equal(lines[lines.length - 1], "");
  assert.equal(lines[0].length, 58, "UHL1 line must be 58 chars");
  assert.ok(lines[0].startsWith(`UHL1${today}PRAGUE RENTAL SVCS  `));
  assert.equal(lines[1], "1 1501 111111 2010");
  assert.match(lines[2], /^2 2801303027 \d+ \d{6}$/);
  assert.equal(lines[lines.length - 3], "3 +");
  assert.equal(lines[lines.length - 2], "5 +");

  // First payment from the fixture: 7720-77628031;710;3 367,00;6392989 2026/03;1148;;
  // VS is the leading digits of the merged "VS Poznámka" column; the message is the remainder.
  assert.equal(lines[3], "7720-77628031 336700 6392989 07101148 0 AV:2026/03");

  // ASCII-only
  for (let i = 0; i < content.length; i++) {
    assert.ok(content.charCodeAt(i) <= 0x7f, `non-ASCII at index ${i}`);
  }

  // Validation runs without crashing and produces the expected categories
  const warnings = validate({
    parsed,
    sender: parsed.sender!,
    clientName: "PRAGUE RENTAL SVCS",
    creationDateDDMMRR: today,
    dueDateDDMMRR: today,
    todayDDMMRR: today,
  });
  // We expect transliteration warnings for the diacritic names
  const transliterations = warnings.filter((w) => w.kind === "messageTransliterated");
  assert.ok(transliterations.length >= 5, `expected several transliteration warnings, got ${transliterations.length}`);
});
