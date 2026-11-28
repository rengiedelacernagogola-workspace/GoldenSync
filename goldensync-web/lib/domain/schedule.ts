/**
 * WHAT: Pure helpers for My Schedule — times, duration, overlap, live status.
 * HOW: HH:mm → minutes; overlap on same day; status for “today” only.
 * SCREEN: Class cards show duration; Ongoing (green) / Next · in Xh Ym (orange).
 * EDIT: Day labels / status copy here. KEEP: Duration and status are never stored.
 * RISK: Medium — wrong overlap lets double-booked classes through.
 */

/** Day of week: 1 = Monday … 7 = Sunday (matches tabs). */
export type ScheduleDayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const SCHEDULE_DAY_LABELS: Record<ScheduleDayOfWeek, string> = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  7: "Sun",
};

export const SCHEDULE_DAY_FULL: Record<ScheduleDayOfWeek, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

export type ScheduleModeValue = "FACE_TO_FACE" | "ONLINE";

export function scheduleModeLabel(mode: ScheduleModeValue): string {
  return mode === "ONLINE" ? "Online" : "Face-to-face";
}

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * WHAT: Parse "HH:mm" into minutes from midnight; null if invalid.
 */
export function parseTimeToMinutes(value: string): number | null {
  const m = TIME_RE.exec(value.trim());
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

/**
 * WHAT: True when end is strictly after start (same calendar day).
 */
export function isEndAfterStart(startTime: string, endTime: string): boolean {
  const a = parseTimeToMinutes(startTime);
  const b = parseTimeToMinutes(endTime);
  if (a == null || b == null) return false;
  return b > a;
}

/**
 * WHAT: Duration in minutes; null if times invalid or end ≤ start.
 */
export function durationMinutes(startTime: string, endTime: string): number | null {
  const a = parseTimeToMinutes(startTime);
  const b = parseTimeToMinutes(endTime);
  if (a == null || b == null || b <= a) return null;
  return b - a;
}

/**
 * WHAT: Human duration like "1h 30m" or "45m".
 */
export function formatDuration(startTime: string, endTime: string): string {
  const mins = durationMinutes(startTime, endTime);
  if (mins == null) return "";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export type ScheduleInterval = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  courseCode: string;
  courseTitle: string;
};

/**
 * WHAT: True if two intervals on the same day overlap (half-open [start, end)).
 */
export function intervalsOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * WHAT: Find first overlapping class on the same day (excludes excludeId).
 */
export function findOverlapConflict(
  candidate: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    excludeId?: string;
  },
  existing: ScheduleInterval[],
): ScheduleInterval | null {
  const cStart = parseTimeToMinutes(candidate.startTime);
  const cEnd = parseTimeToMinutes(candidate.endTime);
  if (cStart == null || cEnd == null || cEnd <= cStart) return null;

  for (const row of existing) {
    if (row.dayOfWeek !== candidate.dayOfWeek) continue;
    if (candidate.excludeId && row.id === candidate.excludeId) continue;
    const rStart = parseTimeToMinutes(row.startTime);
    const rEnd = parseTimeToMinutes(row.endTime);
    if (rStart == null || rEnd == null) continue;
    if (intervalsOverlap(cStart, cEnd, rStart, rEnd)) return row;
  }
  return null;
}

export type ClassLiveStatus =
  | { kind: "ongoing" }
  | { kind: "next"; minutesUntil: number }
  | { kind: "later" }
  | { kind: "finished" }
  | { kind: "none" };

/**
 * WHAT: Status for a class on “today” given nowMinutes (0–1439).
 * HOW: Ongoing if now in [start, end); next is nearest upcoming; else later/finished.
 */
export function classStatusForNow(
  startTime: string,
  endTime: string,
  nowMinutes: number,
): ClassLiveStatus {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  if (start == null || end == null) return { kind: "none" };
  if (nowMinutes >= start && nowMinutes < end) return { kind: "ongoing" };
  if (nowMinutes < start) {
    return { kind: "next", minutesUntil: start - nowMinutes };
  }
  return { kind: "finished" };
}

/**
 * WHAT: Pick which class is the single “Next” among today’s upcoming list.
 */
export function pickNextClassId(
  rows: { id: string; startTime: string; endTime: string }[],
  nowMinutes: number,
): string | null {
  let bestId: string | null = null;
  let bestStart = Infinity;
  for (const row of rows) {
    const start = parseTimeToMinutes(row.startTime);
    const end = parseTimeToMinutes(row.endTime);
    if (start == null || end == null) continue;
    if (nowMinutes >= end) continue; // finished
    if (nowMinutes >= start && nowMinutes < end) continue; // ongoing not “next”
    if (start < bestStart) {
      bestStart = start;
      bestId = row.id;
    }
  }
  return bestId;
}

/**
 * WHAT: Format "Next · in Xh Ym" from minutes until start.
 */
export function formatNextIn(minutesUntil: number): string {
  const h = Math.floor(minutesUntil / 60);
  const m = minutesUntil % 60;
  if (h <= 0) return `Next · in ${m}m`;
  if (m === 0) return `Next · in ${h}h`;
  return `Next · in ${h}h ${m}m`;
}

/**
 * WHAT: Manila (or any Date) → ScheduleDayOfWeek 1=Mon … 7=Sun.
 * HOW: Uses weekday short name in the given time zone (default Asia/Manila).
 */
export function dayOfWeekFromDate(
  now: Date = new Date(),
  timeZone = "Asia/Manila",
): ScheduleDayOfWeek {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(now);
  const map: Record<string, ScheduleDayOfWeek> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };
  return map[weekday] ?? 1;
}

/**
 * WHAT: Minutes since midnight in a time zone (for status clock).
 */
export function nowMinutesInZone(
  now: Date = new Date(),
  timeZone = "Asia/Manila",
): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return hour * 60 + minute;
}

/**
 * WHAT: Calendar date label for a day-of-week tab relative to “today” in zone.
 * HOW: Finds the date in the current Mon–Sun week that matches dayOfWeek.
 */
export function dateLabelForDayOfWeek(
  dayOfWeek: ScheduleDayOfWeek,
  now: Date = new Date(),
  timeZone = "Asia/Manila",
): string {
  const todayDow = dayOfWeekFromDate(now, timeZone);
  const delta = dayOfWeek - todayDow;
  // Calendar Y/M/D in the target zone — avoid fixed 24h offsets across DST.
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const y = Number(parts.find((p) => p.type === "year")?.value ?? "1970");
  const m = Number(parts.find((p) => p.type === "month")?.value ?? "1");
  const d = Number(parts.find((p) => p.type === "day")?.value ?? "1");
  const target = new Date(Date.UTC(y, m - 1, d + delta, 12, 0, 0));
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(target);
}
