// WHAT: Detect real PDFs vs junk uploads; map failures to ingest error codes.
// HOW: Checks %PDF- header, size cap, minimum extracted text for “scanned” PDFs.
// EDIT: Limits passed in opts from config; error code strings match ingest UI.
// KEEP: PURE — no disk/network.
// RISK: Medium — weak checks allow bad uploads; stricter checks may reject scans.

/**
 * PDF magic-byte checks (architecture §9.4) — PURE.
 */

/** True when the buffer starts with %PDF- */
export function isPdfMagic(bytes: Uint8Array | ArrayBuffer): boolean {
  const view =
    bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (view.length < 5) return false;
  return (
    view[0] === 0x25 && // %
    view[1] === 0x50 && // P
    view[2] === 0x44 && // D
    view[3] === 0x46 && // F
    view[4] === 0x2d // -
  );
}

/** Map validation failure to ingest errorCode. */
export function pdfFailureCode(
  bytes: Uint8Array,
  opts: { maxBytes: number; minChars?: number; extractedChars?: number },
): string | null {
  if (bytes.byteLength > opts.maxBytes) return "PDF_TOO_LARGE";
  if (!isPdfMagic(bytes)) return "PDF_INVALID";
  if (
    opts.minChars != null &&
    opts.extractedChars != null &&
    opts.extractedChars < opts.minChars
  ) {
    return "PDF_SCANNED";
  }
  return null;
}
