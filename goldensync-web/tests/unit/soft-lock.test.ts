import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isSoftLockedAppPath,
  isWithinSoftLockGrace,
  parseSoftLockAtFromHeader,
  parseSoftLockAtValue,
  softLockGraceMs,
  softLockNeedsHardLogout,
} from "../../lib/auth/soft-lock.ts";

describe("soft-lock helpers", () => {
  it("treats lock age under grace as within grace", () => {
    const now = 1_000_000;
    const lockedAt = now - softLockGraceMs() + 1_000;
    assert.equal(isWithinSoftLockGrace(lockedAt, now), true);
    assert.equal(softLockNeedsHardLogout(lockedAt, now), false);
  });

  it("requires hard logout once grace has ended", () => {
    const now = 1_000_000;
    const lockedAt = now - softLockGraceMs() - 1;
    assert.equal(isWithinSoftLockGrace(lockedAt, now), false);
    assert.equal(softLockNeedsHardLogout(lockedAt, now), true);
  });

  it("parses cookie header and rejects junk", () => {
    assert.equal(
      parseSoftLockAtFromHeader("a=1; gs_soft_lock_at=12345; b=2"),
      12345,
    );
    assert.equal(parseSoftLockAtValue("nope"), null);
    assert.equal(parseSoftLockAtFromHeader(null), null);
  });

  it("recognizes soft-locked app paths", () => {
    assert.equal(isSoftLockedAppPath("/dashboard"), true);
    assert.equal(isSoftLockedAppPath("/my-schedule"), true);
    assert.equal(isSoftLockedAppPath("/subjects/abc/plan"), true);
    assert.equal(isSoftLockedAppPath("/sign-in"), false);
    assert.equal(isSoftLockedAppPath("/api/me"), false);
  });
});
