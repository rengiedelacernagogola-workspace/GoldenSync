import "server-only";

/**
 * Asia/Manila calendar helpers (architecture §7.6 / I13).
 * Inject YYYY-MM-DD into pure domain — never call new Date() inside lib/domain.
 */

import { limits } from "@/lib/config/limits";

/** Today's calendar date in Asia/Manila as YYYY-MM-DD. */
export function getTodayManilaISO(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: limits.TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Format a Date/string as YYYY-MM-DD in Asia/Manila. */
export function toManilaDateISO(value: Date | string): string {
  const d = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: limits.TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}
