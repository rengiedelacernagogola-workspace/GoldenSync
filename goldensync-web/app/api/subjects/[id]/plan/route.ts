/**
 * GET/PUT /api/subjects/:id/plan — list or replace plan weeks (Phase 1).
 */

import { unauthenticated, withApi } from "@/lib/http";
import { listPlanWeeksForSubject, replacePlanWeeks } from "@/lib/services/plan";
import { replacePlanSchema } from "@/lib/validation/plan";

export const GET = withApi({ auth: "required", rateLimit: "read" }, async (ctx) => {
  if (!ctx.userId) throw unauthenticated();
  return listPlanWeeksForSubject(ctx.userId, ctx.params.id);
});

export const PUT = withApi(
  { auth: "required", body: replacePlanSchema, rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    ctx.log.info("plan_replace", { subjectId: ctx.params.id });
    return replacePlanWeeks(ctx.userId, ctx.params.id, ctx.body);
  },
);
