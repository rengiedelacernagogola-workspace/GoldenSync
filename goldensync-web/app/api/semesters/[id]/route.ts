/**
 * PATCH/DELETE /api/semesters/:id — update or delete owned semester.
 */

import { unauthenticated, withApi } from "@/lib/http";
import {
  deleteSemester,
  updateSemester,
} from "@/lib/services/semesters";
import { patchSemesterSchema } from "@/lib/validation/semester";

export const PATCH = withApi(
  { auth: "required", body: patchSemesterSchema, rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    return updateSemester(ctx.userId, ctx.params.id, ctx.body);
  },
);

export const DELETE = withApi({ auth: "required", rateLimit: "write" }, async (ctx) => {
  if (!ctx.userId) throw unauthenticated();
  await deleteSemester(ctx.userId, ctx.params.id);
  return { ok: true };
});
