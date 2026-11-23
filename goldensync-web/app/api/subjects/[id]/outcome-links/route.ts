/**
 * GET/PUT /api/subjects/:id/outcome-links — CO→PO map.
 */

import { unauthenticated, withApi } from "@/lib/http";
import {
  listOutcomeLinks,
  replaceOutcomeLinks,
} from "@/lib/services/outcome-links";
import { replaceOutcomeLinksSchema } from "@/lib/validation/outcome-link";

export const GET = withApi(
  { auth: "required", rateLimit: "read" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    return listOutcomeLinks(ctx.userId, ctx.params.id);
  },
);

export const PUT = withApi(
  {
    auth: "required",
    body: replaceOutcomeLinksSchema,
    rateLimit: "write",
  },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    ctx.log.info("outcome_links_replace", { subjectId: ctx.params.id });
    return replaceOutcomeLinks(ctx.userId, ctx.params.id, ctx.body);
  },
);
