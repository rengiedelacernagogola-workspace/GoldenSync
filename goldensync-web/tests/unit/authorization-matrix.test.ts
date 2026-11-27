// WHAT: Ensures ownership auth matrix lists core resources and semester where-clause helper.
// HOW: Asserts resource keys exist on static `authorizationMatrix` export.
// SCREEN: N/A — guards server routes that scope data by user.
// EDIT: Add resource rows when new owned tables ship in `lib/db/ownership.ts`.
// KEEP: Matrix must stay complete or routes may skip authorization checks.
// RISK: Medium — passing tests don’t prove runtime enforcement, only scaffold completeness.
/**
 * Phase 0 — authorization matrix scaffold stays complete and consistent.
 * Run: `node --experimental-strip-types --test tests/unit/authorization-matrix.test.ts`
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  authorizationMatrix,
  ownedSemesterWhere,
} from "../../lib/db/ownership.ts";

test("authorization matrix lists core owned resources", () => {
  const resources = authorizationMatrix.map((r) => r.resource);
  assert.ok(resources.includes("User"));
  assert.ok(resources.includes("Semester"));
  assert.ok(resources.includes("Subject"));
});

test("semester ownership where uses scalar userId", () => {
  const semester = ownedSemesterWhere("user_1", "sem_1");
  assert.equal(semester.id, "sem_1");
  assert.equal(semester.userId, "user_1");
});
