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
