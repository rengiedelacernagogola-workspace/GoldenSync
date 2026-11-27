// WHAT: Branded string IDs so Subject/Semester/Activity/Outcome ids aren’t swapped by mistake.
// HOW: TypeScript `Brand` alias + `as*Id()` casts from stable string keys (seed, later DB cuid).
// SCREEN: Every domain feature passing subject or activity ids in props and seed.
// EDIT: Add new brands only for new entity types — don’t weaken to plain `string`.
// KEEP: No React/Next imports — safe for server, seed, and tests (UI-004).
// RISK: Medium — `as*Id` does not validate format; bad strings still compile.
/**
 * Shared domain brands and IDs.
 * UI-004: used by seed data; keep free of React/Next.
 */

type Brand<T, B extends string> = T & { readonly __brand: B };

export type SubjectId = Brand<string, "SubjectId">;
export type SemesterId = Brand<string, "SemesterId">;
export type ActivityId = Brand<string, "ActivityId">;
export type OutcomeId = Brand<string, "OutcomeId">;

/** Builds a SubjectId from a stable string (seed / later DB). */
export function asSubjectId(value: string): SubjectId {
  return value as SubjectId;
}

/** Builds a SemesterId from a stable string. */
export function asSemesterId(value: string): SemesterId {
  return value as SemesterId;
}

/** Builds an ActivityId from a stable string. */
export function asActivityId(value: string): ActivityId {
  return value as ActivityId;
}

/** Builds an OutcomeId from a stable string. */
export function asOutcomeId(value: string): OutcomeId {
  return value as OutcomeId;
}
