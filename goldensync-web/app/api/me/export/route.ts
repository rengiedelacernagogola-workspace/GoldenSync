/**
 * GET /api/me/export — full owned-data export (Appendix B).
 */

import { unauthenticated, withApi } from "@/lib/http";
import { exportAccount } from "@/lib/services/account";

export const GET = withApi({ auth: "required", rateLimit: "read" }, async (ctx) => {
  if (!ctx.userId) throw unauthenticated();
  const data = await exportAccount(ctx.userId);
  const body = JSON.stringify(data, null, 2);
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="goldensync-account-export.json"',
      "X-Content-Type-Options": "nosniff",
      "X-Request-Id": ctx.requestId,
    },
  });
});
