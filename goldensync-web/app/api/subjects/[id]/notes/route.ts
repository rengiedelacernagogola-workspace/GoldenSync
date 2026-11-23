/**
 * GET/POST /api/subjects/:id/notes — list / create plan notes.
 */

import { unauthenticated, withApi } from "@/lib/http";
import {
  createPlanNote,
  listPlanNotes,
} from "@/lib/services/plan-notes";
import { createPlanNoteSchema } from "@/lib/validation/plan-note";

export const GET = withApi(
  { auth: "required", rateLimit: "read" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    const url = new URL(ctx.request.url);
    const includeShelved =
      url.searchParams.get("includeShelved") === "1" ||
      url.searchParams.get("includeArchived") === "1";
    return listPlanNotes(ctx.userId, ctx.params.id, { includeShelved });
  },
);

export const POST = withApi(
  { auth: "required", body: createPlanNoteSchema, rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    return createPlanNote(ctx.userId, ctx.params.id, ctx.body);
  },
);
