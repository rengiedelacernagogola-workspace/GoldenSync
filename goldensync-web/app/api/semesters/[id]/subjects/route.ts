// WHAT: Subject cards for one semester — dashboard list source. RISK: Medium — read only.

/**
 * GET /api/semesters/:id/subjects — active subjects in an owned semester.
 */

import { unauthenticated, withApi } from "@/lib/http";
import { listSubjectsForSemester } from "@/lib/services/subjects";

// WHAT: GET — non-archived subjects in semester :id.
export const GET = withApi(
  { auth: "required", rateLimit: "read" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    return listSubjectsForSemester(ctx.userId, ctx.params.id);
  },
);
