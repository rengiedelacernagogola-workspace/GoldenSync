// WHAT: Public entry for seed data, week rows, and seed TypeScript types.
// HOW: Re-exports from `goldensync.seed`, `weeks`, and `seed-types`.
// SCREEN: App bootstrap, Storybook, tests that need consistent demo content.
// EDIT: Add exports when new seed modules appear.
// KEEP: One import path `@/data/seed` for all prototype data.
// RISK: Low
/**
 * Seed barrel — UI-004.
 */

export { goldenSyncSeed } from "@/data/seed/goldensync.seed";
export { ITE14_WEEKS, type SeedWeek } from "@/data/seed/weeks";
export type {
  GoldenSyncSeed,
  SeedAccount,
  SeedActivity,
  SeedClock,
  SeedOutcome,
  SeedSemester,
  SeedSubjectCard,
  SeedSubjectDetail,
} from "@/data/seed/seed-types";
