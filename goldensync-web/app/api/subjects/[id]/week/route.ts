/**
 * GET /api/subjects/:id/week — derived planner state (Asia/Manila).
 */

import { unauthenticated, withApi } from "@/lib/http";
import { getSubjectWeekState } from "@/lib/services/week";

export const GET = withApi({ auth: "required", rateLimit: "read" }, async (ctx) => {
  if (!ctx.userId) throw unauthenticated();
  return getSubjectWeekState(ctx.userId, ctx.params.id);
});
