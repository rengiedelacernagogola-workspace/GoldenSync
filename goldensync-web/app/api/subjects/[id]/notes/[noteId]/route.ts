/**
 * PATCH/DELETE /api/subjects/:id/notes/:noteId — update / delete plan note.
 */

import { unauthenticated, withApi } from "@/lib/http";
import {
  deletePlanNote,
  updatePlanNote,
} from "@/lib/services/plan-notes";
import { updatePlanNoteSchema } from "@/lib/validation/plan-note";

export const PATCH = withApi(
  { auth: "required", body: updatePlanNoteSchema, rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    return updatePlanNote(
      ctx.userId,
      ctx.params.id,
      ctx.params.noteId,
      ctx.body,
    );
  },
);

export const DELETE = withApi(
  { auth: "required", rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    await deletePlanNote(ctx.userId, ctx.params.id, ctx.params.noteId);
    return { ok: true };
  },
);
