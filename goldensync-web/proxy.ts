// WHAT: Global request gate — Clerk attaches auth to every matched route (Next.js 16+ proxy.ts).
// HOW: clerkMiddleware() runs before pages/API; soft-lock cookie redirects app HTML to /sign-in.
// KEEP: matcher list — controls which paths run through Clerk. RISK: High — login/security; ask developer first.

import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  isSoftLockedAppPath,
  parseSoftLockAtValue,
  SOFT_LOCK_COOKIE,
} from "@/lib/auth/soft-lock";

/**
 * Clerk middleware (Next 16+ uses proxy.ts).
 * Routes stay public by default — protect with `await auth.protect()` where needed.
 * Soft-lock: if gs_soft_lock_at is set, bounce app HTML pages to /sign-in.
 * Default auth entry: `/sign-in` · `/sign-up` (CDEC-016).
 */

// WHAT: Default export — Clerk runs on each request; soft-lock redirect for app pages.
export default clerkMiddleware(async (_auth, req) => {
  const raw = req.cookies.get(SOFT_LOCK_COOKIE)?.value;
  const lockedAt = parseSoftLockAtValue(raw);
  if (lockedAt == null) return;

  const path = req.nextUrl.pathname;
  // WHAT: While soft-locked (grace or expired-until-hard-logout), keep users off app HTML.
  if (isSoftLockedAppPath(path)) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    url.search = "";
    return NextResponse.redirect(url);
  }
});

// WHAT: URL patterns that run this middleware (pages, /api, /__clerk, excluding static files).
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
