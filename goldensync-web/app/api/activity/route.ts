// WHAT: Notification activity feed — list, create, mark read, delete one, clear all.
// SCREEN: In-app bell / activity panel. RISK: Medium — user-scoped writes.

/**
 * GET/POST /api/activity — list / create activity events.
 * PATCH /api/activity — mark all read.
 * DELETE /api/activity?id= — delete one; DELETE /api/activity — clear all.
 */

import { unauthenticated, withApi } from "@/lib/http";
import {
  clearActivities,
  createActivity,
  deleteActivity,
  listActivities,
  markActivitiesRead,
} from "@/lib/services/activity";
import { createActivitySchema } from "@/lib/validation/activity";

// WHAT: GET — all activity rows for this user.
export const GET = withApi(
  { auth: "required", rateLimit: "read" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    return listActivities(ctx.userId);
  },
);

// WHAT: POST — append one activity (validated body).
export const POST = withApi(
  { auth: "required", body: createActivitySchema, rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    return createActivity(ctx.userId, ctx.body);
  },
);

// WHAT: PATCH — mark every activity as read.
export const PATCH = withApi(
  { auth: "required", rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    return markActivitiesRead(ctx.userId);
  },
);

// WHAT: DELETE — remove one (?id=) or clear entire list if no id.
export const DELETE = withApi(
  { auth: "required", rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    const id = new URL(ctx.request.url).searchParams.get("id")?.trim();
    if (id) return deleteActivity(ctx.userId, id);
    return clearActivities(ctx.userId);
  },
);
