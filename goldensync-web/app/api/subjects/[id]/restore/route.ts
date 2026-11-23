/**
 * POST /api/subjects/:id/restore — restore within ARCHIVE_RESTORE_DAYS.
 */

import { unauthenticated, withApi } from "@/lib/http";
import { restoreSubject } from "@/lib/services/archive";

export const POST = withApi({ auth: "required", rateLimit: "write" }, async (ctx) => {
  if (!ctx.userId) throw unauthenticated();
  ctx.log.info("subject_restore", { subjectId: ctx.params.id });
  return restoreSubject(ctx.userId, ctx.params.id);
});
