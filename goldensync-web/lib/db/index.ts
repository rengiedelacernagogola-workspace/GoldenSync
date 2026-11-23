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
