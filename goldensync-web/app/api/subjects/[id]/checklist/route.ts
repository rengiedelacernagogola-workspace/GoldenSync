/**
 * GET/PUT /api/subjects/:id/checklist — list / toggle week done (Appendix B).
 */

import { unauthenticated, withApi } from "@/lib/http";
import {
  listChecklistForSubject,
  toggleChecklistWeek,
} from "@/lib/services/checklist";
import { toggleChecklistSchema } from "@/lib/validation/checklist";

export const GET = withApi({ auth: "required", rateLimit: "read" }, async (ctx) => {
  if (!ctx.userId) throw unauthenticated();
  return listChecklistForSubject(ctx.userId, ctx.params.id);
});

export const PUT = withApi(
  { auth: "required", body: toggleChecklistSchema, rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    return toggleChecklistWeek(ctx.userId, ctx.params.id, ctx.body);
  },
);
