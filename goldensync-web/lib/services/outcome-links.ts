import "server-only";

/**
 * OutcomeLink — CO→PO I/E/D map; one level per pair (DBDEC-002).
 */

import { db } from "@/lib/db";
import { requireOwnedSubject } from "@/lib/db/ownership-guards";
import { AppError, notFound } from "@/lib/http/errors";
import type { ReplaceOutcomeLinksInput } from "@/lib/validation/outcome-link";

export type OutcomeLinkDto = {
  id: string;
  coId: string;
  poId: string;
  level: "I" | "E" | "D";
};

function mapLink(row: {
  id: string;
  coId: string;
  poId: string;
  level: unknown;
}): OutcomeLinkDto {
  return {
    id: row.id,
    coId: row.coId,
    poId: row.poId,
    level: String(row.level) as "I" | "E" | "D",
  };
}

/** List outcome links for COs/POs belonging to the subject. */
export async function listOutcomeLinks(
  userId: string,
  subjectId: string,
): Promise<OutcomeLinkDto[]> {
  await requireOwnedSubject(userId, subjectId);
  const outcomes = await db.orm.public.Outcome.where({ subjectId }).all();
  const ids = new Set(outcomes.map((o) => o.id));
  if (ids.size === 0) return [];

  const allLinks = await db.orm.public.OutcomeLink.where({}).all();
  return allLinks
    .filter((l) => ids.has(l.coId) && ids.has(l.poId))
    .map(mapLink);
}

/** Replace all CO→PO links for a subject (transactional). */
export async function replaceOutcomeLinks(
  userId: string,
  subjectId: string,
  input: ReplaceOutcomeLinksInput,
): Promise<OutcomeLinkDto[]> {
  await requireOwnedSubject(userId, subjectId);

  const outcomes = await db.orm.public.Outcome.where({ subjectId }).all();
  const byId = new Map(outcomes.map((o) => [o.id, o]));

  for (const link of input.links) {
    const co = byId.get(link.coId);
    const po = byId.get(link.poId);
    if (!co || !po) {
      throw new AppError(
        "VALIDATION_FAILED",
        "Outcome link references unknown outcomes.",
      );
    }
    if (String(co.kind) !== "CO" || String(po.kind) !== "PO") {
      throw new AppError(
        "VALIDATION_FAILED",
        "Links must be CO → PO.",
      );
    }
  }

  const seen = new Set<string>();
  for (const link of input.links) {
    const key = `${link.coId}:${link.poId}`;
    if (seen.has(key)) {
      throw new AppError(
        "VALIDATION_FAILED",
        "Duplicate CO→PO pair in payload.",
      );
    }
    seen.add(key);
  }

  await db.transaction(async (tx) => {
    const existing = await tx.orm.public.OutcomeLink.where({}).all();
    const subjectIds = new Set(outcomes.map((o) => o.id));
    for (const row of existing) {
      if (subjectIds.has(row.coId) || subjectIds.has(row.poId)) {
        await tx.orm.public.OutcomeLink.where({ id: row.id }).delete();
      }
    }
    for (const link of input.links) {
      await tx.orm.public.OutcomeLink.create({
        coId: link.coId,
        poId: link.poId,
        level: link.level,
      });
    }
  });

  return listOutcomeLinks(userId, subjectId);
}
