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

export const DELETE = withApi(
  { auth: "required", rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    const id = new URL(ctx.request.url).searchParams.get("id")?.trim();
    if (id) return deleteActivity(ctx.userId, id);
    return clearActivities(ctx.userId);
  },
);
