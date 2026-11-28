// WHAT: My Schedule list + create — user-scoped timetable rows.
// SCREEN: /my-schedule. RISK: High — authenticated writes.

/**
 * GET/POST /api/schedule — list / create ScheduleClass for the signed-in user.
 */

import { unauthenticated, withApi } from "@/lib/http";
import {
  createScheduleClass,
  listScheduleClasses,
} from "@/lib/services/schedule";
import { createScheduleClassSchema } from "@/lib/validation/schedule";

/** WHAT: GET — all classes for this user. */
export const GET = withApi(
  { auth: "required", rateLimit: "read" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    return listScheduleClasses(ctx.userId);
  },
);

/** WHAT: POST — create one class (validated + overlap-checked). */
export const POST = withApi(
  { auth: "required", body: createScheduleClassSchema, rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    return createScheduleClass(ctx.userId, ctx.body);
  },
);
