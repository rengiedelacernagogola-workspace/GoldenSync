/**
 * GET /api/me — profile · DELETE /api/me — account wipe (Appendix B).
 */

import { getMe } from "@/lib/services/me";
import { deleteAccount } from "@/lib/services/account";
import { unauthenticated, withApi } from "@/lib/http";
import { deleteAccountSchema } from "@/lib/validation/account";

export const GET = withApi({ auth: "required", rateLimit: "read" }, async (ctx) => {
  if (!ctx.userId) throw unauthenticated();
  ctx.log.info("me_get");
  return getMe(ctx.userId);
});

export const DELETE = withApi(
  { auth: "required", body: deleteAccountSchema, rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId || !ctx.clerkUserId) throw unauthenticated();
    ctx.log.info("me_delete");
    await deleteAccount(ctx.userId, ctx.clerkUserId, ctx.body);
    return new Response(null, {
      status: 204,
      headers: { "X-Request-Id": ctx.requestId },
    });
  },
);
