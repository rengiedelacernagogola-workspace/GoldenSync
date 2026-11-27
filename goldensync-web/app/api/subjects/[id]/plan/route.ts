// WHAT: Weekly course plan rows — read all weeks or replace entire plan. SCREEN: Plan page table.

/**
 * GET/PUT /api/subjects/:id/plan — list or replace plan weeks (Phase 1).
 */

import { unauthenticated, withApi } from "@/lib/http";
import { listPlanWeeksForSubject, replacePlanWeeks } from "@/lib/services/plan";
import { replacePlanSchema } from "@/lib/validation/plan";

// WHAT: GET — plan weeks for subject.
export const GET = withApi({ auth: "required", rateLimit: "read" }, async (ctx) => {
  if (!ctx.userId) throw unauthenticated();
  return listPlanWeeksForSubject(ctx.userId, ctx.params.id);
});

// WHAT: PUT — replace all plan weeks atomically.
export const PUT = withApi(
  { auth: "required", body: replacePlanSchema, rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    ctx.log.info("plan_replace", { subjectId: ctx.params.id });
    return replacePlanWeeks(ctx.userId, ctx.params.id, ctx.body);
  },
);
