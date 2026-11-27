// WHAT: Create a new subject manually (Add Subject wizard). RISK: High — writes DB rows.

/**
 * POST /api/subjects — manual create in an owned semester (Phase 1).
 */

import { unauthenticated, withApi } from "@/lib/http";
import { requireIdempotencyKey } from "@/lib/http/idempotency";
import { createSubject } from "@/lib/services/subjects";
import { createSubjectSchema } from "@/lib/validation/subject";

// WHAT: POST — create subject body includes semesterId, course code, plan, outcomes, etc.
export const POST = withApi(
  { auth: "required", body: createSubjectSchema, rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    requireIdempotencyKey(ctx.request);
    ctx.log.info("subject_create", { semesterId: ctx.body.semesterId });
    return createSubject(ctx.userId, ctx.body);
  },
);
