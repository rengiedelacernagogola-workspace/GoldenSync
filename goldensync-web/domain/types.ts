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
