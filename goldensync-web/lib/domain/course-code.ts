// WHAT: Normalize and compare subject course codes (e.g. CSC 106).
// HOW: Pure string helpers — trim, uppercase, match confirmation to stored value.
// EDIT: Matching rules in courseCodeMatches if syllabus codes change format.
// KEEP: No database or HTTP here; services call these before saves.
// RISK: Low — display/normalization only.

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
