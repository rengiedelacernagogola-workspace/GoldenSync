// WHAT: Year level labels (First Year…) and “past semester” using Manila calendar.
// HOW: manilaTodayUtc + compare to semester end date from semester-dates parser.
// SCREEN: Semester picker labels and read-only past terms.
// EDIT: YEAR_NAMES map and YEAR_LEVEL_MIN/MAX.
// KEEP: Asia/Manila timezone for “today” — don’t switch to server local blindly.
// RISK: Low.

/**
 * Semester year-level labels + past-term detection (Asia/Manila).
 */

import { parseSemesterDate } from "@/lib/domain/semester-dates";

export const YEAR_LEVEL_MIN = 1;
export const YEAR_LEVEL_MAX = 6;

const YEAR_NAMES: Record<number, string> = {
  1: "First Year",
  2: "Second Year",
  3: "Third Year",
  4: "Fourth Year",
  5: "Fifth Year",
  6: "Sixth Year",
};

/** Full name for year level (e.g. First Year). */
export function yearLevelName(yearLevel: number): string {
  return YEAR_NAMES[yearLevel] ?? `Year ${yearLevel}`;
}

/** Compact prefix for picker / lists: "Year N". */
export function yearLevelShort(yearLevel: number): string {
  return `Year ${yearLevel}`;
}

/** Display: `Year N · {label}`. */
export function formatSemesterDisplayLabel(
  label: string,
  yearLevel: number,
): string {
  return `${yearLevelShort(yearLevel)} · ${label}`;
}

/** Today as UTC midnight for the Asia/Manila calendar date. */
export function manilaTodayUtc(): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = Number(parts.find((p) => p.type === "year")?.value);
  const m = Number(parts.find((p) => p.type === "month")?.value);
  const d = Number(parts.find((p) => p.type === "day")?.value);
  return new Date(Date.UTC(y, m - 1, d));
}

/**
 * Past semester: endDate (date-only) is before today in Asia/Manila.
 * Current / upcoming otherwise.
 */
export function isSemesterPast(
  endDate: string | Date | null | undefined,
): boolean {
  if (endDate == null) return false;
  const end =
    endDate instanceof Date
      ? new Date(
          Date.UTC(
            endDate.getUTCFullYear(),
            endDate.getUTCMonth(),
            endDate.getUTCDate(),
          ),
        )
      : parseSemesterDate(String(endDate));
  if (!end) return false;
  return end.getTime() < manilaTodayUtc().getTime();
}

export function activeSemesterStorageKey(userId: string): string {
  return `gs-active-semester:${userId}`;
}
