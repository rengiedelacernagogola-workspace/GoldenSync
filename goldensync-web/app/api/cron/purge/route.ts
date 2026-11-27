// WHAT: Scheduled purge — deletes expired soft-deleted rows per retention jobs.
// HOW: CRON_SECRET bearer token required (not Clerk user). RISK: High — destructive batch job.

/**
 * GET/POST /api/cron/purge — retention sweeps (Vercel Cron).
 * Auth: Authorization: Bearer CRON_SECRET
 */

import { assertCronAuthorized } from "@/lib/http/cron-auth";
import { withApi } from "@/lib/http";
import { runPurgeJobs } from "@/lib/jobs/purge";

async function handle(request: Request) {
  assertCronAuthorized(request);
  const counts = await runPurgeJobs();
  return {
    ok: true,
    ranAt: new Date().toISOString(),
    counts,
  };
}

// WHAT: GET/POST both run same purge handler for Vercel Cron flexibility.
export const GET = withApi(
  { auth: "none", rateLimit: "none" },
  async (ctx) => handle(ctx.request),
);

// WHAT: POST — same purge as GET (Vercel Cron may use either verb).
export const POST = withApi(
  { auth: "none", rateLimit: "none" },
  async (ctx) => handle(ctx.request),
);
