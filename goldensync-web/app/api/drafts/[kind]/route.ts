// WHAT: Autosaved wizard drafts (Add Subject, etc.) — 7-day TTL per kind slug.

/**
 * GET/PUT /api/drafts/:kind — read / autosave draft (7-day TTL).
 */

import { unauthenticated, validationFailed, withApi } from "@/lib/http";
import { getDraft, putDraft } from "@/lib/services/drafts";
import { draftKindSchema, putDraftSchema } from "@/lib/validation/draft";

function parseKind(raw: string) {
  const parsed = draftKindSchema.safeParse(raw);
  if (!parsed.success) {
    throw validationFailed("Invalid draft kind.");
  }
  return parsed.data;
}

// WHAT: GET — load draft payload for kind (or empty shape).
export const GET = withApi({ auth: "required", rateLimit: "read" }, async (ctx) => {
  if (!ctx.userId) throw unauthenticated();
  const kind = parseKind(ctx.params.kind);
  const draft = await getDraft(ctx.userId, kind);
  return draft ?? { kind, payload: null, updatedAt: null, expiresAt: null };
});

// WHAT: PUT — save draft JSON blob.
export const PUT = withApi(
  { auth: "required", body: putDraftSchema, rateLimit: "write" },
  async (ctx) => {
    if (!ctx.userId) throw unauthenticated();
    const kind = parseKind(ctx.params.kind);
    return putDraft(ctx.userId, kind, ctx.body.payload);
  },
);
