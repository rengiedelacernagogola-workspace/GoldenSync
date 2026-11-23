/**
 * GET /api/me/archived-subjects — archived subjects history for Account.
 */

import { unauthenticated, withApi } from "@/lib/http";
import { listArchivedSubjectsForUser } from "@/lib/queries/subjects";

export const GET = withApi(
  { auth: "required", rateLimit: "read" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    ctx.log.info("me_archived_subjects");
    return listArchivedSubjectsForUser(ctx.userId);
  },
);
