/**
 * POST /api/subjects — manual create in an owned semester (Phase 1).
 */

import { unauthenticated, withApi } from "@/lib/http";
import { requireIdempotencyKey } from "@/lib/http/idempotency";
import { createSubject } from "@/lib/services/subjects";
import { createSubjectSchema } from "@/lib/validation/subject";

export const POST = withApi(
  { auth: "required", body: createSubjectSchema, rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    requireIdempotencyKey(ctx.request);
    ctx.log.info("subject_create", { semesterId: ctx.body.semesterId });
    return createSubject(ctx.userId, ctx.body);
  },
);
