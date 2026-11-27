// WHAT: TypeScript shapes for prototype seed JSON (account, semester, subjects, activities).
// HOW: Readonly interfaces using branded domain IDs; no classes or DB mapping here.
// SCREEN: Documents what demo screens expect before Prisma models are loaded.
// EDIT: Extend interfaces when seed fields grow; keep in sync with `goldensync.seed.ts`.
// KEEP: Stays free of React/Prisma — pure data contracts (UI-004).
// RISK: Low — mismatched types fail compile when seed object is updated.
/**
 * Seed DTOs — plain data mirroring prototype plan §7.
 * UI-004: repositories will map these to domain models later.
 */

import type {
  ActivityId,
  OutcomeId,
  SemesterId,
  SubjectId,
} from "@/domain/types";

/** Demo account shown across auth/account screens. */
export interface SeedAccount {
  readonly email: string;
  readonly displayName: string;
}

/** Static “today” for This Week math (Asia/Manila). */
export interface SeedClock {
  readonly todayIso: string;
  readonly timeZone: "Asia/Manila";
}

export interface SeedSemester {
  readonly id: SemesterId;
  readonly label: string;
  readonly startIso: string;
  readonly endIso: string;
  readonly skippedWeeks: readonly number[];
  /** Derived in prototype: week 13 on 2026-11-10. */
  readonly currentWeek: number;
  readonly planWeeks: number;
}

export interface SeedSubjectCard {
  readonly id: SubjectId;
  readonly code: string;
  readonly title: string;
  readonly units: number;
  readonly weeksDone: number;
  readonly weeksTotal: number;
  readonly isActive: boolean;
}

export interface SeedOutcome {
  readonly id: OutcomeId;
  readonly code: string;
  readonly label: string;
}

export interface SeedActivity {
  readonly id: ActivityId;
  readonly label: string;
  readonly maxScore: number;
  readonly outcomeIds: readonly OutcomeId[];
}

export interface SeedSubjectDetail {
  readonly id: SubjectId;
  readonly prerequisite: string;
  readonly effectivity: string;
  readonly peos: readonly string[];
  readonly pos: readonly string[];
  readonly outcomes: readonly SeedOutcome[];
  readonly activities: readonly SeedActivity[];
  readonly gradingBlurb: string;
  readonly policiesBlurb: string;
  readonly facultyBlurb: string;
}

export interface GoldenSyncSeed {
  readonly account: SeedAccount;
  readonly clock: SeedClock;
  readonly semester: SeedSemester;
  readonly subjects: readonly SeedSubjectCard[];
  readonly activeSubject: SeedSubjectDetail;
}
