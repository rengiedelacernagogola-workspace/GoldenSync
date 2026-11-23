# D0 — Gap report (contract vs architecture vs product)

**Piece:** DB-001 (D0 Preflight)  
**Date:** 2026-11-21 (UTC+8)  
**Sources:** `database-tracker.md`, `system-architecture.md` §5.4 / §6–§9 / Appendix A, `prisma/contract.prisma`, live Docker `goldensync-pg`, `new-features.md`, localStorage libs  
**Neon:** NOT VERIFIED (no Neon project wired in this session)  
**Code/schema changes:** none (D0 only)

---

## 1. Summary

| Area | Verdict |
| ---- | ------- |
| Local Docker Postgres | Up; 14 domain tables; schema matches current contract |
| Architecture parity | **Gaps:** missing `OutcomeLink`, `IdempotencyKey`; missing partial unique + Score CHECK; PlanWeek simplified vs Appendix A |
| Product (user-added) | **Gaps:** Plan notes, manual checklist, activity feed are localStorage-only |
| Neon production path | **Not started** — still `localhost:55432` in `.env.local` |
| Production readiness | **Not ready** until D1–D10 complete |

Live snapshot (Docker): User 1 · Semester 1 · Subject 2 · child tables mostly empty · GradeScale 0 rows.

---

## 2. Model-by-model gap

| Model | Contract | Live DB | Architecture | Gap |
| ----- | -------- | ------- | ------------ | --- |
| User | Yes | Yes | Yes | Optional `theme` undecided |
| Semester | Yes | Yes | Yes | `skippedWeeks` is Json (arch: Int[]); no `endDate > startDate` CHECK |
| Subject | Yes | Yes | Yes | No partial unique `(semesterId, courseCodeNorm) WHERE archivedAt IS NULL`; no `(semesterId, archivedAt)` index; Json modules untyped |
| Outcome | Yes | Yes | Yes | No `UNIQUE (subjectId, kind, code)` |
| OutcomeLink | **No** | **No** | **Required** | Must add for I/E/D map |
| PlanWeek | Yes (weekNumber) | Yes | Richer (weekFrom/To, outcomeId, activitiesText) | **Decision:** Option A vs B |
| Assessment | Yes | Yes | Yes | OK for Phase 1 |
| AssessmentOutcome | Yes | Yes | Yes | OK |
| Score | Yes | Yes | Yes | Missing `score_bounds` CHECK |
| ChecklistItem | Yes | Yes | Yes | Week ticks OK; separate from ManualChecklistItem |
| IngestJob | Yes | Yes | Yes | Purge job missing |
| Draft | Yes | Yes | Yes | Purge job missing |
| IdempotencyKey | **No** | **No** | **Required** | Must add |
| GradeScale / Meta | Yes | Yes (empty) | Yes | Must seed; calculator gate |
| AuditLog | Yes | Yes | Yes | Runtime REVOKE UPDATE/DELETE not applied |
| PlanNote | **No** | **No** | Product (new-features) | Must add; replace localStorage |
| ManualChecklistItem | **No** | **No** | Product (new-features) | Must add; I14 isolated |
| ActivityEvent | **No** | **No** | Product (new-features) | Must add |

---

## 3. Client-only → Neon migration gaps

| Client key | Feature | Neon target | Status |
| ---------- | ------- | ----------- | ------ |
| `gs-notes-entries:*` / `gs-notes-meta:*` | All notes library | `PlanNote` | Gap |
| `gs-manual-checklist:*` | My checklist | `ManualChecklistItem` | Gap |
| `gs-activity-log` | Notifications | `ActivityEvent` | Gap |
| `gs-theme` | Theme toggle | `User.theme` or stay client | Decision #4 |

---

## 4. Constraint / index gaps (raw SQL needed)

| Item | Status |
| ---- | ------ |
| `subject_active_code_per_semester` partial unique | Missing |
| `Outcome` unique (subjectId, kind, code) | Missing |
| `score_bounds_chk` | Missing |
| `semester_dates_chk` | Missing |
| AuditLog insert-only for `app_runtime` | Missing (roles not created) |
| Length CHECKs mirroring Zod | Missing |
| `IdempotencyKey` unique (userId, key, route) | Model missing |
| `OutcomeLink` unique (coId, poId) | Model missing |

---

## 5. Jobs / ops gaps

| Job | Architecture | Status |
| --- | ------------ | ------ |
| purge-archived | Yes | Missing |
| purge-ingest | Yes | Missing |
| purge-drafts | Yes | Missing |
| purge-idempotency | Yes | Missing |
| sweep-orphan-blobs | Yes | Missing |
| Neon PITR / restore drill | Tracker §8 / §10 | Not started |
| CI migrate drift check | Tracker / standards | Not started |

---

## 6. Secrets / env gaps (no values recorded here)

| Secret | Prod readiness note |
| ------ | ------------------- |
| `DATABASE_URL` / `DIRECT_URL` | Point at local Docker today; must become Neon pooled + direct + `sslmode=require` |
| `BLOB_READ_WRITE_TOKEN` | Placeholder / incomplete for real deploy |
| `CLERK_WEBHOOK_SECRET` | Empty |
| Neon `app_migrator` / `app_runtime` | Not created |

---

## 7. What is already good (keep)

- Cascade ownership graph User → Semester → Subject → children
- Unique week rows for PlanWeek and ChecklistItem
- Score optimistic `version` field present
- Draft unique `(userId, kind)` + `expiresAt`
- IngestJob status enum + indexes
- Zod at API boundaries for core create/patch/replace routes
- Blob intended as transient PDF only (I2)

---

## 8. Recommended build order (unchanged from constructor)

D1 Neon → D2 migrate + raw SQL → D3 GradeScale seed → D4 OutcomeLink + IdempotencyKey → D5 PlanNote / ManualChecklistItem / ActivityEvent → D6 domain APIs/UI → D7 jobs → D8 AuthZ → D9 cutover → D10 sign-off.

**Blocked until owner answers decisions in `docs/database/open-decisions.md`.**
