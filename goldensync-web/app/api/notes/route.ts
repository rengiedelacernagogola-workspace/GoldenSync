/**
 * GET /api/notes — all notes across the signed-in user's subjects (Notes hub).
 * ?includeShelved=1 → active + archived + soft-deleted (pre-purge).
 */

import { unauthenticated, withApi } from "@/lib/http";
import { listAllPlanNotesForUser } from "@/lib/services/plan-notes";

export const GET = withApi(
  { auth: "required", rateLimit: "read" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    const url = new URL(ctx.request.url);
    const includeShelved =
      url.searchParams.get("includeShelved") === "1" ||
      url.searchParams.get("includeArchived") === "1";
    return listAllPlanNotesForUser(ctx.userId, { includeShelved });
  },
);
