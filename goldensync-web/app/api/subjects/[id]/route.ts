// WHAT: Single subject — full detail (GET), metadata edit (PATCH), soft delete (DELETE).
// SCREEN: All subject module pages load via GET. RISK: High — core entity.

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

// WHAT: GET — detail DTO with nested plan, outcomes, assessments, checklist.
export const GET = withApi({ auth: "required", rateLimit: "read" }, async (ctx) => {
  if (!ctx.userId) throw unauthenticated();
  return getSubjectDetailForUser(ctx.userId, ctx.params.id);
});

// WHAT: PATCH — update basics, grading JSON, policies, faculty blobs.
export const PATCH = withApi(
  { auth: "required", body: patchSubjectSchema, rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    return updateSubject(ctx.userId, ctx.params.id, ctx.body);
  },
);

// WHAT: DELETE — archive/delete with confirmCourseCode in body.
export const DELETE = withApi(
  { auth: "required", body: deleteSubjectSchema, rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    await deleteSubject(ctx.userId, ctx.params.id, ctx.body);
    return { ok: true };
  },
);
