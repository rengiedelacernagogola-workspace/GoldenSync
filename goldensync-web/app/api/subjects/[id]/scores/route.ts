// WHAT: Save many assessment scores at once (optimistic versioning). SCREEN: Calculator score grid.

/**
 * PUT /api/subjects/:id/scores — batch upsert with versions (Appendix B).
 */

import { unauthenticated, withApi } from "@/lib/http";
import { upsertScores } from "@/lib/services/scores";
import { batchScoresSchema } from "@/lib/validation/score";

// WHAT: PUT — batch score upsert body.items.
export const PUT = withApi(
  { auth: "required", body: batchScoresSchema, rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    ctx.log.info("scores_upsert", {
      subjectId: ctx.params.id,
      count: ctx.body.items.length,
    });
    return upsertScores(ctx.userId, ctx.params.id, ctx.body);
  },
);
