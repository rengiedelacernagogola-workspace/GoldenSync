// WHAT: "This week" planner slice — current week number and matching plan row. SCREEN: This Week page.

/**
 * GET /api/subjects/:id/week — derived planner state (Asia/Manila).
 */

import { unauthenticated, withApi } from "@/lib/http";
import { getSubjectWeekState } from "@/lib/services/week";

// WHAT: GET — week state using Manila calendar.
export const GET = withApi({ auth: "required", rateLimit: "read" }, async (ctx) => {
  if (!ctx.userId) throw unauthenticated();
  return getSubjectWeekState(ctx.userId, ctx.params.id);
});
