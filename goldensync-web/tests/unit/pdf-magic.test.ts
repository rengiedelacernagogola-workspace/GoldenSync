/**
 * Phase 4 — PDF magic bytes.
 * Run: npm run test:unit
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import { isPdfMagic, pdfFailureCode } from "../../lib/domain/pdf-magic.ts";

test("isPdfMagic accepts %PDF- header", () => {
  const ok = new TextEncoder().encode("%PDF-1.7\n...");
  assert.equal(isPdfMagic(ok), true);
  assert.equal(isPdfMagic(new TextEncoder().encode("notpdf")), false);
});

test("pdfFailureCode maps size and magic failures", () => {
  const tiny = new TextEncoder().encode("%PDF-");
  assert.equal(
    pdfFailureCode(tiny, { maxBytes: 1 }),
    "PDF_TOO_LARGE",
  );
  const bad = new TextEncoder().encode("XXXXX");
  assert.equal(pdfFailureCode(bad, { maxBytes: 100 }), "PDF_INVALID");
});
