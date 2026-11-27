// WHAT: Update or delete one semester the user owns. RISK: High — deletes subjects under semester.

/**
 * PATCH/DELETE /api/semesters/:id — update or delete owned semester.
 */

import { unauthenticated, withApi } from "@/lib/http";
import {
  deleteSemester,
  updateSemester,
} from "@/lib/services/semesters";
import { patchSemesterSchema } from "@/lib/validation/semester";

// WHAT: PATCH — edit label, dates, skipped weeks, etc.
export const PATCH = withApi(
  { auth: "required", body: patchSemesterSchema, rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    return updateSemester(ctx.userId, ctx.params.id, ctx.body);
  },
);

// WHAT: DELETE — remove semester and related data per service rules.
export const DELETE = withApi({ auth: "required", rateLimit: "write" }, async (ctx) => {
  if (!ctx.userId) throw unauthenticated();
  await deleteSemester(ctx.userId, ctx.params.id);
  return { ok: true };
});
