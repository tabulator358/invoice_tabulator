import test from "node:test";
import assert from "node:assert/strict";
import { buildKpc, buildUhl1Line, dateInputToDdmmrr, suggestKpcFilename } from "@/lib/kpc";

test("UHL1 line is exactly 58 ASCII chars and pads client name", () => {
  const line = buildUhl1Line("070526", "PRAGUE RENTAL SVCS");
  assert.equal(line.length, 58);
  assert.ok(line.startsWith("UHL1070526"));
  assert.ok(line.includes("PRAGUE RENTAL SVCS  ")); // padded with two trailing spaces (18 chars + 2 = 20)
  assert.ok(line.endsWith("1234567890001999111111222222"));
});

test("UHL1 truncates client name longer than 20", () => {
  const line = buildUhl1Line("070526", "AAAAAAAAAAAAAAAAAAAAAAAA");
  assert.equal(line.length, 58);
  assert.ok(line.includes("AAAAAAAAAAAAAAAAAAAA"));
});

test("buildKpc emits correct line layout and CRLF endings", () => {
  const content = buildKpc(
    {
      clientName: "PRAGUE RENTAL SVCS",
      sender: { account: "2801303027", bankCode: "2010" },
      creationDateDDMMRR: "070526",
      dueDateDDMMRR: "070526",
    },
    [
      {
        recipientAccount: "7720-77628031",
        recipientBankCode: "0710",
        amountKc: 3367,
        vs: "6392989",
        ks: "1148",
        ss: "0",
        message: "6392989 2026/03",
      },
      {
        recipientAccount: "4602784023",
        recipientBankCode: "0800",
        amountKc: 11900,
        vs: "601",
        ks: "138",
        ss: "0",
        message: "Natalie Safarikova 2026/03",
      },
    ],
  );

  // Must end with terminator lines
  assert.ok(content.endsWith("3 +\r\n5 +\r\n"));

  // Every byte ASCII
  for (let i = 0; i < content.length; i++) {
    assert.ok(content.charCodeAt(i) <= 0x7f, `non-ASCII at ${i}`);
  }

  const lines = content.split("\r\n");
  // Trailing CRLF after "5 +" produces an empty final element from split
  assert.equal(lines[lines.length - 1], "");

  // UHL1 is line 0, header line 1, group line 2, items 3-4, then 3 + and 5 +
  assert.equal(lines[0].length, 58);
  assert.equal(lines[1], "1 1501 111111 2010");
  assert.equal(lines[2], "2 2801303027 1526700 070526");
  assert.equal(lines[3], "7720-77628031 336700 6392989 07101148 0 AV:6392989 2026/03");
  assert.equal(lines[4], "4602784023 1190000 601 08000138 0 AV:Natalie Safarikova 2026/03");
  assert.equal(lines[5], "3 +");
  assert.equal(lines[6], "5 +");
});

test("buildKpc throws on non-ASCII content slipping through", () => {
  assert.throws(() =>
    buildKpc(
      {
        clientName: "PRAGUE RENTAL SVCS",
        sender: { account: "2801303027", bankCode: "2010" },
        creationDateDDMMRR: "070526",
        dueDateDDMMRR: "070526",
      },
      [
        {
          recipientAccount: "4602784023",
          recipientBankCode: "0800",
          amountKc: 100,
          vs: "1",
          ks: "0",
          ss: "0",
          message: "Šafaříková",
        },
      ],
    ),
  );
});

test("dateInputToDdmmrr converts ISO date", () => {
  assert.equal(dateInputToDdmmrr("2026-05-07"), "070526");
  assert.equal(dateInputToDdmmrr("2026-12-31"), "311226");
  assert.equal(dateInputToDdmmrr("not-a-date"), "");
});

test("suggestKpcFilename uses due date", () => {
  assert.equal(
    suggestKpcFilename({
      clientName: "X",
      sender: { account: "1", bankCode: "0100" },
      creationDateDDMMRR: "070526",
      dueDateDDMMRR: "070526",
    }),
    "prikazy_070526.kpc",
  );
});
