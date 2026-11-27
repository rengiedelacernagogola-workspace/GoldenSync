import "server-only";

// WHAT: Maintain CO→PO curriculum map links (Introduce/Enhanced/Demonstrated).
// HOW: CRUD on OutcomeLink after requireOwnedSubject.
// SCREEN: Outcomes matrix / linkage UI.
// EDIT: One link level per CO–PO pair rule.
// KEEP: DBDEC-002 uniqueness expectations.
// RISK: High — database + ownership.

/**
 * OutcomeLink — CO→PO I/E/D map; one level per pair (DBDEC-002).
 */

import { and, or } from "@prisma/orm-postgres/orm-client";

import { db } from "@/lib/db";
import { requireOwnedSubject } from "@/lib/db/ownership-guards";
import { AppError } from "@/lib/http/errors";
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
  const coIds = outcomes
    .filter((o) => String(o.kind) === "CO")
    .map((o) => o.id);
  const poIds = outcomes
    .filter((o) => String(o.kind) === "PO")
    .map((o) => o.id);
  if (coIds.length === 0 || poIds.length === 0) return [];

  const links = await db.orm.public.OutcomeLink.where((l) =>
    and(l.coId.in(coIds), l.poId.in(poIds)),
  ).all();
  return links.map(mapLink);
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

  const outcomeIds = outcomes.map((o) => o.id);

  await db.transaction(async (tx) => {
    if (outcomeIds.length > 0) {
      await tx.orm.public.OutcomeLink.where((l) =>
        or(l.coId.in(outcomeIds), l.poId.in(outcomeIds)),
      ).deleteAll();
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
