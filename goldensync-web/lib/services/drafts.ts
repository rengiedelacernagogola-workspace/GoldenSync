import "server-only";

// WHAT: Server-side autosave blobs (form drafts) with expiry.
// HOW: get/put by userId + kind; TTL from config limits.
// SCREEN: Long forms that autosave before submit.
// EDIT: draftKind strings and TTL in limits.
// KEEP: Expired drafts return null — UI should handle empty.
// RISK: High — database; drafts may contain partial PII.

/**
 * Draft autosave (architecture Appendix B) — 7-day TTL.
 */

import { limits } from "@/lib/config/limits";
import { db } from "@/lib/db";
import { notFound } from "@/lib/http/errors";

export type DraftDto = {
  kind: string;
  payload: unknown;
  updatedAt: string;
  expiresAt: string;
};

function mapDraft(row: {
  kind: string;
  payload: unknown;
  updatedAt: unknown;
  expiresAt: unknown;
}): DraftDto {
  return {
    kind: row.kind,
    payload: row.payload,
    updatedAt:
      row.updatedAt instanceof Date
        ? row.updatedAt.toISOString()
        : String(row.updatedAt),
    expiresAt:
      row.expiresAt instanceof Date
        ? row.expiresAt.toISOString()
        : String(row.expiresAt),
  };
}

function expiresAtFromNow(): Date {
  return new Date(
    Date.now() + limits.DRAFT_TTL_DAYS * 24 * 60 * 60 * 1000,
  );
}

/** Read draft by kind if owned and not expired. */
export async function getDraft(
  userId: string,
  kind: string,
): Promise<DraftDto | null> {
  const row = await db.orm.public.Draft.where({ userId, kind }).first();
  if (!row) return null;
  const exp =
    row.expiresAt instanceof Date
      ? row.expiresAt
      : new Date(String(row.expiresAt));
  if (exp.getTime() < Date.now()) {
    await db.orm.public.Draft.where({ id: row.id }).delete();
    return null;
  }
  return mapDraft(row);
}

/** Upsert draft payload and refresh TTL. */
export async function putDraft(
  userId: string,
  kind: string,
  payload: unknown,
): Promise<DraftDto> {
  const existing = await db.orm.public.Draft.where({ userId, kind }).first();
  const expiresAt = expiresAtFromNow();

  const jsonPayload = structuredClone(payload) as never;

  if (existing) {
    await db.orm.public.Draft.where({ id: existing.id }).update({
      payload: jsonPayload,
      expiresAt,
    });
    const updated = await db.orm.public.Draft.where({ id: existing.id }).first();
    if (!updated) throw notFound();
    return mapDraft(updated);
  }

  const created = await db.orm.public.Draft.create({
    userId,
    kind,
    payload: jsonPayload,
    expiresAt,
  });
  return mapDraft(created);
}
