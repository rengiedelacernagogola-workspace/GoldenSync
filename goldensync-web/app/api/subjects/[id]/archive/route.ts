/**
 * POST /api/subjects/:id/archive — soft-archive owned subject.
 */

import { unauthenticated, withApi } from "@/lib/http";
import { archiveSubject } from "@/lib/services/archive";

export const POST = withApi({ auth: "required", rateLimit: "write" }, async (ctx) => {
  if (!ctx.userId) throw unauthenticated();
  ctx.log.info("subject_archive", { subjectId: ctx.params.id });
  return archiveSubject(ctx.userId, ctx.params.id);
});
