// WHAT: Tests CSV export escapes formulas so Excel won’t execute injected cells.
// HOW: `neutralizeCsvCell`, `csvEscape`, `toCsv` output assertions.
// SCREEN: Export/download CSV from tables (grades, plans).
// EDIT: When export columns or delimiter rules change in `lib/domain/csv.ts`.
// KEEP: Prefix `=`, `+`, `-`, `@` per architecture §10.4.
// RISK: Low — missing neutralization is a spreadsheet injection risk in production.
/**
 * Phase 3 — CSV formula neutralization (architecture §10.4).
 * Run: npm run test:unit
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  csvEscape,
  neutralizeCsvCell,
  toCsv,
} from "../../lib/domain/csv.ts";

test("neutralizeCsvCell prefixes formula starters", () => {
  assert.equal(neutralizeCsvCell("=CMD()"), "'=CMD()");
  assert.equal(neutralizeCsvCell("+1+1"), "'+1+1");
  assert.equal(neutralizeCsvCell("-1+1"), "'-1+1");
  assert.equal(neutralizeCsvCell("@SUM(A1)"), "'@SUM(A1)");
  assert.equal(neutralizeCsvCell("\tTAB"), "'\tTAB");
  assert.equal(neutralizeCsvCell("\rCR"), "'\rCR");
  assert.equal(neutralizeCsvCell("safe"), "safe");
});

test("toCsv quotes commas and neutralizes hostile cells", () => {
  const csv = toCsv(["code", "note"], [
    { code: "CIS 101", note: "=1+1" },
    { code: "a,b", note: "ok" },
  ]);
  assert.ok(csv.includes("'=1+1"));
  assert.ok(csv.includes('"a,b"'));
});

test("csvEscape doubles embedded quotes", () => {
  assert.equal(csvEscape('say "hi"'), '"say ""hi"""');
});
