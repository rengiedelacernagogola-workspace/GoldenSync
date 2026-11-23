/**
 * Study streak — consecutive Manila calendar days with app activity.
 * Client-only (localStorage); no DB.
 */

const STORAGE_KEY = "gs-study-streak";

export type StreakState = {
  /** Current consecutive days (at least 1 after first touch today). */
  days: number;
  /** Last active calendar day YYYY-MM-DD (Asia/Manila). */
  lastDateISO: string;
};

function manilaTodayISO(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function shiftManilaDay(iso: string, deltaDays: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const utc = Date.UTC(y!, m! - 1, d!) + deltaDays * 86_400_000;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(utc));
}

function readRaw(): StreakState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StreakState;
    if (
      typeof parsed?.days !== "number" ||
      typeof parsed?.lastDateISO !== "string"
    ) {
      return null;
    }
    return {
      days: Math.max(0, Math.floor(parsed.days)),
      lastDateISO: parsed.lastDateISO,
    };
  } catch {
    return null;
  }
}

function writeRaw(state: StreakState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** Current streak without mutating (0 if never started). */
export function getStreakDays(): number {
  const today = manilaTodayISO();
  const state = readRaw();
  if (!state || state.days <= 0) return 0;
  if (state.lastDateISO === today) return state.days;
  if (state.lastDateISO === shiftManilaDay(today, -1)) return state.days;
  return 0;
}

/**
 * Record activity for today. Extends streak if yesterday was active,
 * resets to 1 if the chain broke, no-ops if already counted today.
 */
export function touchStreak(now = new Date()): number {
  const today = manilaTodayISO(now);
  const prev = readRaw();
  if (!prev || prev.days <= 0) {
    writeRaw({ days: 1, lastDateISO: today });
    return 1;
  }
  if (prev.lastDateISO === today) return prev.days;
  if (prev.lastDateISO === shiftManilaDay(today, -1)) {
    const next = { days: prev.days + 1, lastDateISO: today };
    writeRaw(next);
    return next.days;
  }
  writeRaw({ days: 1, lastDateISO: today });
  return 1;
}

/** Label for UI — small copy next to the flame. */
export function streakLabel(days: number): string {
  if (days <= 0) return "0 days";
  if (days === 1) return "1 day";
  return `${days} days`;
}
