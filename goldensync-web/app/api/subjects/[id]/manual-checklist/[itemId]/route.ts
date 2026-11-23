/**
 * PATCH/DELETE /api/subjects/:id/manual-checklist/:itemId
 */

import { unauthenticated, withApi } from "@/lib/http";
import {
  deleteManualChecklistItem,
  updateManualChecklistItem,
} from "@/lib/services/manual-checklist";
import { updateManualChecklistSchema } from "@/lib/validation/manual-checklist";

export const PATCH = withApi(
  {
    auth: "required",
    body: updateManualChecklistSchema,
    rateLimit: "write",
  },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    return updateManualChecklistItem(
      ctx.userId,
      ctx.params.id,
      ctx.params.itemId,
      ctx.body,
    );
  },
);

export const DELETE = withApi(
  { auth: "required", rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    await deleteManualChecklistItem(
      ctx.userId,
      ctx.params.id,
      ctx.params.itemId,
    );
    return { ok: true };
  },
);
