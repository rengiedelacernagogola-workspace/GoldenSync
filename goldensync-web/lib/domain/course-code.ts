/**
 * Course code helpers (architecture §11 / Phase 1).
 * PURE — no I/O.
 */

/** Trim, collapse whitespace, uppercase — backs Subject.courseCodeNorm. */
export function normalizeCourseCode(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").toUpperCase();
}

/** True when confirmation matches stored code (display or normalized). */
export function courseCodeMatches(
  storedCode: string,
  storedNorm: string,
  confirmation: string,
): boolean {
  const n = normalizeCourseCode(confirmation);
  return n === storedNorm || n === normalizeCourseCode(storedCode);
}
