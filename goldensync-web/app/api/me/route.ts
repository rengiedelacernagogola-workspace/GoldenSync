// WHAT: Current user profile (GET) or full account delete (DELETE).
// SCREEN: Account page and app bootstrap use GET. DELETE wipes user data per Appendix B.
// RISK: High — DELETE is destructive; ask developer before changing validation.

/**
 * GET /api/me — profile · DELETE /api/me — account wipe (Appendix B).
 */

import { getMe } from "@/lib/services/me";
import { deleteAccount } from "@/lib/services/account";
import { unauthenticated, withApi } from "@/lib/http";
import { deleteAccountSchema } from "@/lib/validation/account";

// WHAT: GET /api/me — id, email, name for signed-in user.
export const GET = withApi({ auth: "required", rateLimit: "read" }, async (ctx) => {
  if (!ctx.userId) throw unauthenticated();
  ctx.log.info("me_get");
  return getMe(ctx.userId);
});

// WHAT: DELETE /api/me — permanently delete account after body validation.
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
