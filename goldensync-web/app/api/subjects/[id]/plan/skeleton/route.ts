// WHAT: Auto-create empty plan week rows from semester start/end. HOW: Idempotent if weeks exist.

/**
 * POST /api/subjects/:id/plan/skeleton — ensure blank PlanWeek rows from semester dates.
 * Idempotent when plan weeks already exist.
 */

import { unauthenticated, withApi } from "@/lib/http";
import { ensurePlanWeekSkeleton } from "@/lib/services/plan-skeleton";

// WHAT: POST — fill missing week skeleton for new subjects.
export const POST = withApi(
  { auth: "required", rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    ctx.log.info("plan_skeleton", { subjectId: ctx.params.id });
    return ensurePlanWeekSkeleton(ctx.userId, ctx.params.id);
  },
);
