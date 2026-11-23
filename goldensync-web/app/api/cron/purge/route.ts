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

export const GET = withApi(
  { auth: "none", rateLimit: "none" },
  async (ctx) => handle(ctx.request),
);

export const POST = withApi(
  { auth: "none", rateLimit: "none" },
  async (ctx) => handle(ctx.request),
);
