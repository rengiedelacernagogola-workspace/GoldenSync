// WHAT: Global request gate — Clerk attaches auth to every matched route (Next.js 16+ proxy.ts).
// HOW: clerkMiddleware() runs before pages/API; individual routes still call auth.protect() as needed.
// KEEP: matcher list — controls which paths run through Clerk. RISK: High — login/security; ask developer first.

import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Clerk middleware (Next 16+ uses proxy.ts).
 * Routes stay public by default — protect with `await auth.protect()` where needed.
 * Default auth entry: `/sign-in` · `/sign-up` (CDEC-016).
 */

// WHAT: Default export — Clerk runs on each request in matcher paths.
export default clerkMiddleware();

// WHAT: URL patterns that run this middleware (pages, /api, /__clerk, excluding static files).
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
