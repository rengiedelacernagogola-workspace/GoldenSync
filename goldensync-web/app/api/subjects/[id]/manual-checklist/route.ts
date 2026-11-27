// WHAT: Personal checklist items (not plan weeks). SCREEN: Checklist page manual card.

/**
 * GET/POST /api/subjects/:id/manual-checklist — list / add manual items (I14).
 */

import { unauthenticated, withApi } from "@/lib/http";
import {
  createManualChecklistItem,
  listManualChecklist,
} from "@/lib/services/manual-checklist";
import { createManualChecklistSchema } from "@/lib/validation/manual-checklist";

// WHAT: GET — manual items for subject.
export const GET = withApi(
  { auth: "required", rateLimit: "read" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    return listManualChecklist(ctx.userId, ctx.params.id);
  },
);

// WHAT: POST — add one manual checklist line.
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
