/**
 * GET /api/subjects/ingest/:jobId — owner-scoped job status.
 */

import { unauthenticated, withApi } from "@/lib/http";
import { getIngestJob } from "@/lib/services/ingest";

export const GET = withApi({ auth: "required", rateLimit: "read" }, async (ctx) => {
  if (!ctx.userId) throw unauthenticated();
  return getIngestJob(ctx.userId, ctx.params.jobId);
});
