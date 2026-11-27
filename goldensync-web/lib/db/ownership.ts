// WHAT: Document who may read/write each resource; scalar where-clauses for semesters.
// HOW: ownedSemesterWhere(userId, id) — no nested relation filters (Composer limitation).
// EDIT: authorizationMatrix when new tables get APIs.
// KEEP: Async ownership checks live in ownership-guards.ts, not here.
// RISK: High — auth design; matrix is the security checklist for new endpoints.

/**
 * Ownership filter shapes + auth matrix (architecture §6.3).
 * Async guards that hit the DB live in ownership-guards.ts
 * (Prisma Composer cannot nest relation filters in where()).
 */

/** Semester owned by userId (scalar where — safe for Composer). */
export function ownedSemesterWhere(userId: string, semesterId: string) {
  return {
    id: semesterId,
    userId,
  } as const;
}

/**
 * Authorization matrix scaffold (Phase 0 exit).
 * Rows = resource; columns = who may read/write. Expand as services land.
 */
export const authorizationMatrix = [
  {
    resource: "User",
    read: "self only",
    write: "self / Clerk webhook",
  },
  {
    resource: "Semester",
    read: "owner (userId)",
    write: "owner",
  },
  {
    resource: "Subject",
    read: "owner via semester.userId",
    write: "owner",
  },
  {
    resource: "Outcome | PlanWeek | Assessment | ChecklistItem | Score",
    read: "owner via subject → semester",
    write: "owner; missing → 404",
  },
  {
    resource: "IngestJob | Draft",
    read: "owner (userId)",
    write: "owner; missing → 404",
  },
] as const;
