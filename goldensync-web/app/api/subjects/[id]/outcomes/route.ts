/**
 * GET/PUT /api/subjects/:id/outcomes — list or replace outcome set (Phase 1).
 */

import { unauthenticated, withApi } from "@/lib/http";
import {
  listOutcomesForSubject,
  replaceOutcomes,
} from "@/lib/services/outcomes";
import { replaceOutcomesSchema } from "@/lib/validation/outcome";

export const GET = withApi({ auth: "required", rateLimit: "read" }, async (ctx) => {
  if (!ctx.userId) throw unauthenticated();
  return listOutcomesForSubject(ctx.userId, ctx.params.id);
});

export const PUT = withApi(
  { auth: "required", body: replaceOutcomesSchema, rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    ctx.log.info("outcomes_replace", { subjectId: ctx.params.id });
    return replaceOutcomes(ctx.userId, ctx.params.id, ctx.body);
  },
);
