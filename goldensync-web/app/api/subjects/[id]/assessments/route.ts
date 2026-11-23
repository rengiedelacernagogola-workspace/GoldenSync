/**
 * GET/POST /api/subjects/:id/assessments — list / add activity (Appendix B).
 */

import { unauthenticated, withApi } from "@/lib/http";
import {
  createAssessment,
  listAssessmentsForSubject,
} from "@/lib/services/assessments";
import { createAssessmentSchema } from "@/lib/validation/assessment";

export const GET = withApi({ auth: "required", rateLimit: "read" }, async (ctx) => {
  if (!ctx.userId) throw unauthenticated();
  return listAssessmentsForSubject(ctx.userId, ctx.params.id);
});

export const POST = withApi(
  { auth: "required", body: createAssessmentSchema, rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    ctx.log.info("assessment_create", { subjectId: ctx.params.id });
    return createAssessment(ctx.userId, ctx.params.id, ctx.body);
  },
);
