/**
 * GET /api/semesters/:id/subjects — active subjects in an owned semester.
 */

import { unauthenticated, withApi } from "@/lib/http";
import { listSubjectsForSemester } from "@/lib/services/subjects";

export const GET = withApi(
  { auth: "required", rateLimit: "read" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    return listSubjectsForSemester(ctx.userId, ctx.params.id);
  },
);
