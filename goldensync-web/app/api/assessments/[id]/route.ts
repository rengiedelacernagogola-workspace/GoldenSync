/**
 * PATCH/DELETE /api/assessments/:id — edit or remove owned activity.
 */

import { unauthenticated, withApi } from "@/lib/http";
import {
  deleteAssessment,
  updateAssessment,
} from "@/lib/services/assessments";
import { patchAssessmentSchema } from "@/lib/validation/assessment";

export const PATCH = withApi(
  { auth: "required", body: patchAssessmentSchema, rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    return updateAssessment(ctx.userId, ctx.params.id, ctx.body);
  },
);

export const DELETE = withApi({ auth: "required", rateLimit: "write" }, async (ctx) => {
  if (!ctx.userId) throw unauthenticated();
  await deleteAssessment(ctx.userId, ctx.params.id);
  return { ok: true };
});
