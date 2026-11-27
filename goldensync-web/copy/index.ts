// WHAT: Re-exports all copy modules from one import path (`@/copy`).
// HOW: Barrel file — forwards `appendixA` and types from `appendix-a.ts`.
// SCREEN: Any feature that needs shared copy imports here instead of deep paths.
// EDIT: Add new `export` lines when you add more copy files (per-screen bundles).
// KEEP: Appendix A stays the canonical locked set until product says otherwise.
// RISK: Low
/**
 * Copy barrel — UI-005.
 * Add screen-specific keys in feature files later; Appendix A is the locked set.
 */

export { appendixA, type AppendixACopy } from "@/copy/appendix-a";
