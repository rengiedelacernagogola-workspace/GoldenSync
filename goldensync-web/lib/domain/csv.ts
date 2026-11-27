// WHAT: Build safe CSV exports (escape cells, block spreadsheet formula injection).
// HOW: neutralizeCsvCell prefixes risky leads; toCsv joins header + rows with CRLF.
// SCREEN: Subject/export flows that download .csv.
// EDIT: Extra dangerous prefixes in neutralizeCsvCell if security review asks.
// KEEP: Pure — no file I/O here.
// RISK: Low; Medium if neutralization is weakened (CSV formula attacks).

/**
 * CSV helpers (architecture §10.4) — PURE formula neutralization.
 */

/** Prefix formula-like cells so spreadsheet apps do not execute them. */
export function neutralizeCsvCell(value: string): string {
  if (value.length === 0) return value;
  const first = value.charAt(0);
  if (
    first === "=" ||
    first === "+" ||
    first === "-" ||
    first === "@" ||
    first === "\t" ||
    first === "\r"
  ) {
    return `'${value}`;
  }
  return value;
}

/** Escape a cell for CSV (neutralize, then quote if needed). */
export function csvEscape(value: unknown): string {
  const raw = value == null ? "" : String(value);
  const safe = neutralizeCsvCell(raw);
  if (/[",\n\r]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

/** Build a CSV document from header + row objects. */
export function toCsv(
  headers: string[],
  rows: Record<string, unknown>[],
): string {
  const lines = [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => headers.map((h) => csvEscape(row[h])).join(",")),
  ];
  return lines.join("\r\n");
}
