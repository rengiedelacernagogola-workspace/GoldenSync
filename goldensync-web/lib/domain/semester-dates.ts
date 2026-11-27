// WHAT: Parse semester dates and detect overlapping terms for the same user.
// HOW: UTC-midnight dates from YYYY-MM-DD; rangesOverlap for conflict checks.
// SCREEN: Create/edit semester forms.
// EDIT: Overlap rules if product allows touching start/end days differently.
// KEEP: Use these parsers instead of raw new Date(userInput).
// RISK: Medium — overlap bugs let double-booked semesters.

/**
 * Semester date helpers — range checks and overlap detection.
 */

export type DateRange = {
  start: Date;
  end: Date;
  label?: string;
};

/** Parse YYYY-MM-DD or ISO string to a Date at UTC midnight for stable compares. */
export function parseSemesterDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  /* Prefer date-only so local timezone does not shift the calendar day. */
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(Date.UTC(y, m - 1, d));
  }
  const dt = new Date(trimmed);
  if (Number.isNaN(dt.getTime())) return null;
  return new Date(
    Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()),
  );
}

export function isValidSemesterRange(start: Date, end: Date): boolean {
  return start.getTime() < end.getTime();
}

/**
 * Inclusive range overlap: [aStart, aEnd] overlaps [bStart, bEnd]
 * when aStart <= bEnd && bStart <= aEnd.
 */
export function rangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart.getTime() <= bEnd.getTime() && bStart.getTime() <= aEnd.getTime();
}

/** Find the first existing semester that conflicts with the proposed range. */
export function findConflictingSemester(
  start: Date,
  end: Date,
  existing: Array<{
    id?: string;
    label: string;
    startDate: string | Date;
    endDate: string | Date;
  }>,
  excludeId?: string,
): { label: string; startDate: string; endDate: string } | null {
  for (const row of existing) {
    if (excludeId && row.id === excludeId) continue;
    const bStart =
      row.startDate instanceof Date
        ? row.startDate
        : parseSemesterDate(String(row.startDate));
    const bEnd =
      row.endDate instanceof Date
        ? row.endDate
        : parseSemesterDate(String(row.endDate));
    if (!bStart || !bEnd) continue;
    if (rangesOverlap(start, end, bStart, bEnd)) {
      return {
        label: row.label,
        startDate:
          row.startDate instanceof Date
            ? row.startDate.toISOString().slice(0, 10)
            : String(row.startDate).slice(0, 10),
        endDate:
          row.endDate instanceof Date
            ? row.endDate.toISOString().slice(0, 10)
            : String(row.endDate).slice(0, 10),
      };
    }
  }
  return null;
}
