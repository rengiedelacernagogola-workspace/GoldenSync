import "server-only";

// WHAT: Load global grade scale bands + confirmation meta for gating.
// HOW: Reads GradeScale / meta tables — shared across users.
// SCREEN: Grade scale setup and derived outcome display.
// EDIT: confirmed flag behavior with services/derived-outcome.ts.
// KEEP: Not owner-scoped — different auth rules than subjects.
// RISK: High — database; misconfig affects all grade displays.

/**
 * Grade scale reads — global config (not owner-scoped).
 */

import { db } from "@/lib/db";
import type { GradeScaleBand } from "@/lib/domain/grade-scale";

/** Whether the active scale is confirmed for release. */
export async function isGradeScaleConfirmed(): Promise<boolean> {
  const meta = await db.orm.public.GradeScaleMeta.where({}).first();
  return meta?.confirmed === true;
}

/** Active scale bands sorted by position. */
export async function listGradeScaleBands(): Promise<GradeScaleBand[]> {
  const rows = await db.orm.public.GradeScale.where({}).all();
  return rows
    .sort((a, b) => a.position - b.position)
    .map((r) => ({
      minAverage: Number(r.minAverage),
      maxAverage: Number(r.maxAverage),
      grade: Number(r.grade),
    }));
}
