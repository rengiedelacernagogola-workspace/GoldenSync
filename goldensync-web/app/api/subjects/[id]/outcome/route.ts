// WHAT: Computed grade/outcome summary from scores + template. SCREEN: Overview / grade displays.

/**
 * GET /api/subjects/:id/outcome — derived result (Appendix B).
 */

import { unauthenticated, withApi } from "@/lib/http";
import { getDerivedOutcome } from "@/lib/services/derived-outcome";

// WHAT: GET — derived outcome DTO.
export const GET = withApi({ auth: "required", rateLimit: "read" }, async (ctx) => {
  if (!ctx.userId) throw unauthenticated();
  return getDerivedOutcome(ctx.userId, ctx.params.id);
});
