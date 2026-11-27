// WHAT: Poll one ingest job — status, result draft, errors. HOW: Client pollIngestJob calls this.

/**
 * GET /api/subjects/ingest/:jobId — owner-scoped job status.
 */

import { unauthenticated, withApi } from "@/lib/http";
import { getIngestJob } from "@/lib/services/ingest";

// WHAT: GET — job must belong to signed-in user.
export const GET = withApi({ auth: "required", rateLimit: "read" }, async (ctx) => {
  if (!ctx.userId) throw unauthenticated();
  return getIngestJob(ctx.userId, ctx.params.jobId);
});
