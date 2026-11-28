/**
 * WHAT: Soft-lock after Log out — keep Clerk session briefly, then force hard sign-out.
 * HOW: Cookie `gs_soft_lock_at` stores lock time; grace comes from limits.SOFT_LOCK_GRACE_MINUTES.
 * SCREEN: /sign-in shows Continue within grace; after grace user must password + email OTP.
 * EDIT: Change SOFT_LOCK_GRACE_MINUTES in limits.ts (default 10).
 * KEEP: Cookie must outlive the grace window so an expired lock still forces hard logout.
 * RISK: High — auth/security; ask a developer before changing.
 */

/**
 * WHAT: Default grace minutes — keep equal to limits.SOFT_LOCK_GRACE_MINUTES.
 * HOW: Pure helpers use this so unit tests need no path aliases; app code should pass limits when calling softLockGraceMs.
 * EDIT: Change limits.SOFT_LOCK_GRACE_MINUTES and this constant together.
 */
export const SOFT_LOCK_GRACE_MINUTES_DEFAULT = 10;

/** Cookie name: epoch ms when the user soft-logged out. */
export const SOFT_LOCK_COOKIE = "gs_soft_lock_at";

/** Keep the cookie until cleared (or 7 days) so expiry still triggers hard logout. */
export const SOFT_LOCK_COOKIE_MAX_AGE_SEC = 7 * 24 * 60 * 60;

/** WHAT: Browser event so SoftLockGate can re-arm timers when logout sets the cookie. */
export const SOFT_LOCK_CHANGE_EVENT = "gs:soft-lock-change";

function emitSoftLockChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SOFT_LOCK_CHANGE_EVENT));
}

/**
 * WHAT: Grace window length in milliseconds.
 * EDIT: Pass limits.SOFT_LOCK_GRACE_MINUTES from app code; default matches that limit.
 */
export function softLockGraceMs(
  minutes: number = SOFT_LOCK_GRACE_MINUTES_DEFAULT,
): number {
  return minutes * 60 * 1000;
}

/**
 * WHAT: True while lock age is still inside the grace window.
 * HOW: now - lockedAt < graceMs.
 */
export function isWithinSoftLockGrace(
  lockedAt: number,
  now: number = Date.now(),
  graceMs: number = softLockGraceMs(),
): boolean {
  if (!Number.isFinite(lockedAt) || lockedAt <= 0) return false;
  return now - lockedAt < graceMs;
}

/**
 * WHAT: True when a soft-lock cookie exists and grace has already ended.
 */
export function softLockNeedsHardLogout(
  lockedAt: number,
  now: number = Date.now(),
  graceMs: number = softLockGraceMs(),
): boolean {
  if (!Number.isFinite(lockedAt) || lockedAt <= 0) return false;
  return !isWithinSoftLockGrace(lockedAt, now, graceMs);
}

/**
 * WHAT: Parse epoch ms from a raw cookie header or single cookie value.
 */
export function parseSoftLockAtValue(
  raw: string | null | undefined,
): number | null {
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

/**
 * WHAT: Find gs_soft_lock_at inside a Cookie request header string.
 */
export function parseSoftLockAtFromHeader(
  cookieHeader: string | null | undefined,
): number | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [name, ...rest] = part.trim().split("=");
    if (name === SOFT_LOCK_COOKIE) {
      return parseSoftLockAtValue(rest.join("="));
    }
  }
  return null;
}

/**
 * WHAT: App HTML paths that must not load while soft-locked.
 * HOW: Used by SoftLockGate and proxy redirect.
 */
export function isSoftLockedAppPath(pathname: string): boolean {
  const roots = [
    "/dashboard",
    "/account",
    "/notes",
    "/my-schedule",
    "/calculator",
    "/grading-system",
    "/subjects",
  ];
  return roots.some(
    (root) => pathname === root || pathname.startsWith(`${root}/`),
  );
}

/**
 * WHAT: Read soft-lock timestamp from document.cookie (browser only).
 */
export function readSoftLockAtClient(): number | null {
  if (typeof document === "undefined") return null;
  return parseSoftLockAtFromHeader(document.cookie);
}

/**
 * WHAT: Arm soft lock — set cookie to now; do not call Clerk signOut.
 * SCREEN: Caller then sends the user to /sign-in.
 */
export function armSoftLock(): void {
  if (typeof document === "undefined") return;
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${SOFT_LOCK_COOKIE}=${Date.now()}; Path=/; Max-Age=${SOFT_LOCK_COOKIE_MAX_AGE_SEC}; SameSite=Lax${secure}`;
  emitSoftLockChange();
}

/**
 * WHAT: Clear soft-lock cookie after Continue unlock or hard sign-out.
 */
export function clearSoftLock(): void {
  if (typeof document === "undefined") return;
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${SOFT_LOCK_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
  emitSoftLockChange();
}

/**
 * WHAT: Soft logout helper — arm cookie then go to /sign-in (Clerk session stays).
 */
export function performSoftLogout(navigate: (url: string) => void): void {
  armSoftLock();
  navigate("/sign-in");
}
