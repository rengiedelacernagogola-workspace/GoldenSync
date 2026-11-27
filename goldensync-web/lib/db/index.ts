// WHAT: Public import surface for database client and ownership helpers.
// HOW: Re-exports client, ownership filters, and requireOwned* guards.
// EDIT: Add new guards here when new owned resources ship.
// KEEP: App code should import `@/lib/db` not deep paths.
// RISK: High — auth/DB boundary; wrong export encourages unsafe imports.

/**
 * Database access barrel — import from `@/lib/db` only (server).
 */

export { contract, db } from "./client";
export {
  authorizationMatrix,
  ownedSemesterWhere,
} from "./ownership";
export {
  requireOwnedAssessment,
  requireOwnedSubject,
} from "./ownership-guards";
