/**
 * GET /api/subjects/:id/outcome — derived result (Appendix B).
 */

import { unauthenticated, withApi } from "@/lib/http";
import { getDerivedOutcome } from "@/lib/services/derived-outcome";

export const GET = withApi({ auth: "required", rateLimit: "read" }, async (ctx) => {
  if (!ctx.userId) throw unauthenticated();
  return getDerivedOutcome(ctx.userId, ctx.params.id);
});
