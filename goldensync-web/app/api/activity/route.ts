/**
 * GET/POST /api/activity — list / create activity events.
 * PATCH /api/activity — mark all read (via ?action=read).
 */

import { unauthenticated, withApi } from "@/lib/http";
import {
  createActivity,
  listActivities,
  markActivitiesRead,
} from "@/lib/services/activity";
import { createActivitySchema } from "@/lib/validation/activity";

export const GET = withApi(
  { auth: "required", rateLimit: "read" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    return listActivities(ctx.userId);
  },
);

export const POST = withApi(
  { auth: "required", body: createActivitySchema, rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    return createActivity(ctx.userId, ctx.body);
  },
);

export const PATCH = withApi(
  { auth: "required", rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    return markActivitiesRead(ctx.userId);
  },
);
