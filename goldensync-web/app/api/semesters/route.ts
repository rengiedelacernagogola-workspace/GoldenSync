// WHAT: User's semesters — list (GET) or create new semester (POST).
// SCREEN: Semester picker and create-semester dialog. RISK: High — owns academic structure.

/**
 * GET/POST /api/semesters — list and create (architecture Appendix B).
 */

import { unauthenticated, withApi } from "@/lib/http";
import { requireIdempotencyKey } from "@/lib/http/idempotency";
import {
  createSemester,
  listSemestersForUser,
} from "@/lib/services/semesters";
import { createSemesterSchema } from "@/lib/validation/semester";

// WHAT: GET — all semesters for signed-in user.
export const GET = withApi({ auth: "required", rateLimit: "read" }, async (ctx) => {
  if (!ctx.userId) throw unauthenticated();
  return listSemestersForUser(ctx.userId);
});

// WHAT: POST — create semester; requires idempotency key header.
export const POST = withApi(
  { auth: "required", body: createSemesterSchema, rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    requireIdempotencyKey(ctx.request);
    ctx.log.info("semester_create");
    return createSemester(ctx.userId, ctx.body);
  },
);
