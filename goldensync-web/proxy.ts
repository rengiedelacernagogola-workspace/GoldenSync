import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Clerk middleware (Next 16+ uses proxy.ts).
 * Routes stay public by default — protect with `await auth.protect()` where needed.
 * Default auth entry: `/sign-in` · `/sign-up` (CDEC-016).
 */

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
