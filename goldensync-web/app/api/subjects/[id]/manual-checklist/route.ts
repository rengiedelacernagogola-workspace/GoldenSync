/**
 * GET/POST /api/subjects/:id/manual-checklist — list / add manual items (I14).
 */

import { unauthenticated, withApi } from "@/lib/http";
import {
  createManualChecklistItem,
  listManualChecklist,
} from "@/lib/services/manual-checklist";
import { createManualChecklistSchema } from "@/lib/validation/manual-checklist";

export const GET = withApi(
  { auth: "required", rateLimit: "read" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    return listManualChecklist(ctx.userId, ctx.params.id);
  },
);

export const POST = withApi(
  {
    auth: "required",
    body: createManualChecklistSchema,
    rateLimit: "write",
  },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    return createManualChecklistItem(ctx.userId, ctx.params.id, ctx.body);
  },
);
