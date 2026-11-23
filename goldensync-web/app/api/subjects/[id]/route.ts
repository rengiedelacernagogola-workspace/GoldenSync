/**
 * GET/PATCH/DELETE /api/subjects/:id — owned subject read / edit / archive.
 */

import { unauthenticated, withApi } from "@/lib/http";
import {
  deleteSubject,
  getSubjectDetailForUser,
  updateSubject,
} from "@/lib/services/subjects";
import {
  deleteSubjectSchema,
  patchSubjectSchema,
} from "@/lib/validation/subject";

export const GET = withApi({ auth: "required", rateLimit: "read" }, async (ctx) => {
  if (!ctx.userId) throw unauthenticated();
  return getSubjectDetailForUser(ctx.userId, ctx.params.id);
});

export const PATCH = withApi(
  { auth: "required", body: patchSubjectSchema, rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    return updateSubject(ctx.userId, ctx.params.id, ctx.body);
  },
);

export const DELETE = withApi(
  { auth: "required", body: deleteSubjectSchema, rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    await deleteSubject(ctx.userId, ctx.params.id, ctx.body);
    return { ok: true };
  },
);
