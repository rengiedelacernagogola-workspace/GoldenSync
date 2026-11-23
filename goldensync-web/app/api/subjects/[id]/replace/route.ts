/**
 * POST /api/subjects/:id/replace — archive + create + copy scores.
 */

import { unauthenticated, withApi } from "@/lib/http";
import { requireIdempotencyKey } from "@/lib/http/idempotency";
import { replaceSubject } from "@/lib/services/replace-subject";
import { replaceSubjectSchema } from "@/lib/validation/replace";

export const POST = withApi(
  { auth: "required", body: replaceSubjectSchema, rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    requireIdempotencyKey(ctx.request);
    ctx.log.info("subject_replace", { subjectId: ctx.params.id });
    return replaceSubject(ctx.userId, ctx.params.id, ctx.body);
  },
);
