import test from "node:test";
import assert from "node:assert/strict";
import {
  asciiTransliterate,
  splitVsAndMessage,
  parseCzAmount,
  isValidModulo11,
  parsePaymentsCsv,
  validate,
} from "@/lib/kpcCsv";

test("parseCzAmount handles thousands separator and comma decimal", () => {
  assert.equal(parseCzAmount("3 367,00"), 3367);
  assert.equal(parseCzAmount("11 900,00"), 11900);
  assert.equal(parseCzAmount("100,00"), 100);
  assert.equal(parseCzAmount(""), 0);
});

test("parseCzAmount handles non-breaking space thousands separator", () => {
  assert.equal(parseCzAmount("3 367,00"), 3367);
});

test("splitVsAndMessage extracts leading digits as VS", () => {
  assert.deepEqual(
    splitVsAndMessage("601 Natalie Šafaříková 2026/03"),
    { vs: "601", message: "Natalie Šafaříková 2026/03" },
  );
  assert.deepEqual(
    splitVsAndMessage("6392989 2026/03"),
    { vs: "6392989", message: "2026/03" },
  );
  assert.deepEqual(splitVsAndMessage(""), { vs: "", message: "" });
  assert.deepEqual(splitVsAndMessage("text only"), { vs: "", message: "text only" });
});

test("asciiTransliterate strips Czech diacritics", () => {
  assert.equal(asciiTransliterate("Šafaříková"), "Safarikova");
  assert.equal(asciiTransliterate("čďěňřšťúůýž"), "cdenrstuuyz");
  assert.equal(asciiTransliterate("ČĎĚŇŘŠŤÚŮÝŽ"), "CDENRSTUUYZ");
  assert.equal(asciiTransliterate("Dobrovodský"), "Dobrovodsky");
});

test("asciiTransliterate maps non-NFD-decomposable letters", () => {
  assert.equal(asciiTransliterate("łódź"), "lodz");
});

test("isValidModulo11 accepts known valid Czech accounts", () => {
  // From the sample CSV — these are real RB-style accounts with valid checksums
  assert.equal(isValidModulo11("7720-77628031"), true);
  assert.equal(isValidModulo11("4602784023"), true);
  assert.equal(isValidModulo11("2801303027"), true);
  assert.equal(isValidModulo11("131-3229180277"), true);
  assert.equal(isValidModulo11("123-8482220247"), true);
});

test("isValidModulo11 rejects bad checksum", () => {
  assert.equal(isValidModulo11("1234567890"), false);
  assert.equal(isValidModulo11(""), false);
});

test("parsePaymentsCsv extracts payments and sender from sample shape", () => {
  const csv = [
    "Číslo účtu - příjemce;Kód banky;Částka;Variabilní symbol Poznámka;Konst.;symbol;Specifický symbol",
    "7720-77628031;710;3 367,00;6392989 2026/03;1148;;",
    "4602784023;800;11 900,00;601 Natalie Šafaříková 2026/03;138;;",
    "Číslo účtu - příkazce;;;;;;",
    "2801303027;2010;303495;;ZEPTAT SE CO TO JE;;",
  ].join("\r\n");

  const parsed = parsePaymentsCsv(csv);
  assert.equal(parsed.payments.length, 2);
  assert.deepEqual(parsed.sender, { account: "2801303027", bankCode: "2010" });

  const first = parsed.payments[0];
  assert.equal(first.recipientAccount, "7720-77628031");
  assert.equal(first.recipientBankCode, "0710");
  assert.equal(first.amountKc, 3367);
  assert.equal(first.vs, "6392989");
  assert.equal(first.ks, "1148");
  assert.equal(first.ss, "0");
  assert.equal(first.message, "2026/03");

  const second = parsed.payments[1];
  assert.equal(second.message, "Natalie Safarikova 2026/03");
  assert.equal(second.vs, "601");
});

test("parsePaymentsCsv auto-detects tab delimiter (Excel paste)", () => {
  const tsv = [
    "Číslo účtu - příjemce\tKód banky\tČástka\tVariabilní symbol Poznámka\tKonst.\tsymbol\tSpecifický symbol",
    "7720-77628031\t710\t3 367,00\t6392989 2026/03\t1148\t\t",
    "Číslo účtu - příkazce\t\t\t\t\t\t",
    "2801303027\t2010\t303495\t\tnote\t\t",
  ].join("\n");
  const parsed = parsePaymentsCsv(tsv);
  assert.equal(parsed.payments.length, 1);
  assert.deepEqual(parsed.sender, { account: "2801303027", bankCode: "2010" });
  assert.equal(parsed.payments[0].amountKc, 3367);
});

test("parsePaymentsCsv handles missing sender row", () => {
  const csv = [
    "Číslo účtu - příjemce;Kód banky;Částka;Variabilní symbol Poznámka;Konst.;symbol;Specifický symbol",
    "4602784023;800;11 900,00;601 Test 2026/03;138;;",
  ].join("\n");
  const parsed = parsePaymentsCsv(csv);
  assert.equal(parsed.payments.length, 1);
  assert.equal(parsed.sender, null);
});

test("validate produces warning for missing sender and bad client name", () => {
  const csv = [
    "Číslo účtu - příjemce;Kód banky;Částka;Variabilní symbol Poznámka;Konst.;symbol;Specifický symbol",
    "4602784023;800;11 900,00;601 Test 2026/03;138;;",
  ].join("\n");
  const parsed = parsePaymentsCsv(csv);
  const warnings = validate({
    parsed,
    sender: { account: "2801303027", bankCode: "2010" },
    clientName: "lower case",
    creationDateDDMMRR: "070526",
    dueDateDDMMRR: "010101",
    todayDDMMRR: "070526",
  });
  assert.ok(warnings.some((w) => w.kind === "missingSender"));
  assert.ok(warnings.some((w) => w.kind === "clientNameInvalid"));
  assert.ok(warnings.some((w) => w.kind === "dueDateInPast"));
});
