// WHAT: Archived subjects list for Account history section. SCREEN: Account page.

/**
 * GET /api/me/archived-subjects — archived subjects history for Account.
 */

import { unauthenticated, withApi } from "@/lib/http";
import { listArchivedSubjectsForUser } from "@/lib/queries/subjects";

// WHAT: GET — subjects with archivedAt set, scoped to user.
export const GET = withApi(
  { auth: "required", rateLimit: "read" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    ctx.log.info("me_archived_subjects");
    return listArchivedSubjectsForUser(ctx.userId);
  },
);
