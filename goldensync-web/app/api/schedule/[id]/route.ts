// WHAT: My Schedule update + delete for one owned class id.
// SCREEN: Edit / Delete on /my-schedule. RISK: High — ownership via userId.

/**
 * PATCH/DELETE /api/schedule/:id — update or delete owned ScheduleClass.
 */

import { unauthenticated, withApi } from "@/lib/http";
import {
  deleteScheduleClass,
  updateScheduleClass,
} from "@/lib/services/schedule";
import { updateScheduleClassSchema } from "@/lib/validation/schedule";

/** WHAT: PATCH — replace fields; overlap ignores this id. */
export const PATCH = withApi(
  { auth: "required", body: updateScheduleClassSchema, rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    return updateScheduleClass(ctx.userId, ctx.params.id, ctx.body);
  },
);

/** WHAT: DELETE — remove owned class. */
export const DELETE = withApi(
  { auth: "required", rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    await deleteScheduleClass(ctx.userId, ctx.params.id);
    return { ok: true };
  },
);
