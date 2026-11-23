/**
 * POST /api/subjects/ingest — enqueue syllabus parse (202).
 */

import { jsonOk, unauthenticated, withApi } from "@/lib/http";
import { requireIdempotencyKey } from "@/lib/http/idempotency";
import { enqueueIngest } from "@/lib/services/ingest";
import { enqueueIngestSchema } from "@/lib/validation/ingest";

export const POST = withApi(
  { auth: "required", body: enqueueIngestSchema, rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    requireIdempotencyKey(ctx.request);
    ctx.log.info("ingest_enqueue");
    const job = await enqueueIngest(ctx.userId, ctx.body);
    return jsonOk(job, ctx.requestId, { status: 202 });
  },
);
