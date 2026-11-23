# GoldenSync — Database production tracker (Neon)

**Purpose:** End-to-end checklist to make storage **100% production-ready** on **Neon Postgres**, aligned with:

- System architecture (`context/prototype-plan/goldensync-context/system-architecture.md` §7–§9, Appendix A)
- Current Prisma contract (`goldensync-web/prisma/contract.prisma`)
- Live local Postgres snapshot (Docker `goldensync-pg`)
- User-added features (`context/user-added-features/new-features.md`) that still use `localStorage`

**Target provider:** [Neon](https://neon.tech) (managed Postgres + pooled connection string).  
**App ORM:** Prisma 8 (`goldensync-web/prisma.config.ts` → `DATABASE_URL` / `DIRECT_URL`).

**Status legend**

| Mark | Meaning |
| ---- | ------- |
| `[ ]` | Not started |
| `[~]` | In progress / partial |
| `[x]` | Done & verified on Neon |
| `N/A` | Explicitly deferred with reason |

**How to use:** Check boxes as you complete each item on Neon. Do not mark Done until the verification step passes against the Neon branch you will ship.

---

## 0. Current baseline (do not skip)

### 0.1 What already exists in Postgres (local Docker — migrate to Neon)

| Model | Present | Notes |
| ----- | ------- | ----- |
| `User` | Yes | `clerkUserId` unique |
| `Semester` | Yes | `skippedWeeks` Json (DBDEC-003); `semester_dates_chk` on local Docker |
| `Subject` | Yes | Partial unique `subject_active_code_per_semester` on local Docker; index `(semesterId, archivedAt)` |
| `Outcome` | Yes | Unique `(subjectId, kind, code)` applied |
| `OutcomeLink` | **Yes** | `LinkLevel` enum I/E/D; unique `(coId, poId)` — local Docker |
| `PlanWeek` | Yes | Editable + multi-row weeks: `weekNumber` · `position` · `topic` · `outcome` · `activities` · `status` · `notes`; unique `(subjectId, weekNumber)` dropped (`2026-11-21-plan-week-duplicate.sql`) |
| `PlanNote` | **Yes** | Local Docker + API cutover |
| `ManualChecklistItem` | **Yes** | Local Docker + API cutover |
| `ActivityEvent` | **Yes** | Local Docker + API cutover; 90d purge stub |
| `Assessment` | Yes | |
| `AssessmentOutcome` | Yes | |
| `Score` | Yes | `score_bounds_chk` on local Docker |
| `ChecklistItem` | Yes | Week ticks only |
| `IngestJob` | Yes | |
| `Draft` | Yes | TTL field exists; purge stub in `lib/jobs/purge.ts` |
| `IdempotencyKey` | **Yes** | Unique `(userId, key, route)` — local Docker; wire header usage still partial |
| `GradeScale` / `GradeScaleMeta` | Yes | 3 bands on Neon; **`confirmed=true`** (2026-11-23 prod prep) |
| `AuditLog` | Yes | Insert-only policy not enforced at DB role level (needs Neon roles) |

### 0.2 Client-only storage that must move to Neon (or stay client with sign-off)

| Client key / feature | Must be in Neon for prod? | Target model |
| -------------------- | ------------------------- | ------------ |
| `gs-notes-entries:*` / `gs-notes-meta:*` (All notes library) | **Yes** | `PlanNote` (+ optional meta columns) |
| `gs-manual-checklist:*` (My checklist) | **Yes** | `ManualChecklistItem` |
| `gs-activity-log` (Notifications bell) | **Yes** | `ActivityEvent` |
| `gs-theme` (light/dark) | Optional | `User.theme` or keep client |
| Proto / seed-only UI | N/A | Not persisted |

### 0.3 Artifact storage (not Neon)

| Artifact | Store | Rule |
| -------- | ----- | ---- |
| Syllabus PDF | Vercel Blob (private) | Transient; only `IngestJob.blobPathname` in Neon |
| Exports CSV/JSON | Generated on demand | Do not store blobs long-term unless product requires |

---

## 1. Neon project setup

- [ ] Create Neon **project** `goldensync` (region closest to Vercel deployment)
- [ ] Create branches: `main` (prod), `develop` (preview), optional `local-shadow`
- [ ] Enable **connection pooling** (Neon pooled host for serverless)
- [ ] Copy connection strings into secrets (never commit):
  - [ ] `DATABASE_URL` = **pooled** Neon URL (`?sslmode=require`)
  - [ ] `DIRECT_URL` = **direct** Neon URL for migrations (`?sslmode=require`)
- [ ] Confirm SSL required (`sslmode=require`) on both URLs
- [ ] Set Neon compute autosuspend policy acceptable for prod latency (or keep warm)
- [ ] Configure Neon **point-in-time restore** / backup retention (min 7 days prod)
- [ ] Document restore drill steps in this folder (who runs, which branch)
- [ ] Restrict Neon IP allowlist if using Neon IP allowlisting (or rely on strong passwords + SSL)
- [ ] Create DB roles if following architecture §7.3:
  - [ ] `app_migrator` (DDL / migrations)
  - [ ] `app_runtime` (DML only; used by app `DATABASE_URL`)
- [ ] Verify Prisma can connect: `npx prisma db pull` / health query from app
- [ ] Wire CI: migrate against Neon `develop` branch on PR; apply to `main` on release

**Verify:** App `/api/health` (or equivalent) succeeds against Neon; `SELECT 1` via pooled URL.

---

## 2. Schema parity with architecture (Prisma contract + raw SQL)

### 2.1 Align / extend existing models

- [ ] **Semester**
  - [x] Prefer `skippedWeeks` as `Int[]` (or document Json shape + Zod validate) — **Json + Zod (DBDEC-003)**; local Docker
  - [~] CHECK / service rule: `endDate > startDate` — applied local Docker; pending Neon
  - [ ] Cap max 30 semesters per user (service)
- [ ] **Subject**
  - [~] Add **partial unique index** (architecture §7.3) — **local Docker done**; pending Neon:
    ```sql
    CREATE UNIQUE INDEX subject_active_code_per_semester
      ON "Subject" ("semesterId", "courseCodeNorm")
      WHERE "archivedAt" IS NULL;
    ```
  - [ ] Zod-validate `grading` / `policies` / `faculty` Json (typed schemas + size caps)
  - [~] Index `(semesterId, archivedAt)` for list queries — local Docker via contract
- [ ] **Outcome**
  - [~] Unique `(subjectId, kind, code)` — local Docker
  - [ ] Enforce max COs (≤20) in service (already partially Zod-capped)
- [ ] **PlanWeek**
  - [x] Decide ship shape: **Option A** (DBDEC-001)
  - [x] Keep unique `(subjectId, weekNumber)`
- [ ] **Score**
  - [~] Add CHECK `score_bounds` (architecture §7.3) — local Docker; pending Neon
  - [ ] Confirm optimistic `version` flow on Neon under concurrency
- [ ] **ChecklistItem**
  - [ ] Confirm unique `(subjectId, weekNumber)` and “writes only this table” for week ticks (I14)
- [ ] **Draft**
  - [ ] Confirm unique `(userId, kind)` and 7-day `expiresAt` policy
- [ ] **IngestJob**
  - [ ] Index `(userId, createdAt)` (exists)
  - [ ] Document `result` Json shape + 24h retention
- [ ] **AuditLog**
  - [ ] REVOKE UPDATE/DELETE/TRUNCATE from `app_runtime` (architecture §7.3)
  - [ ] Ensure no PII in `metadata`
- [x] **GradeScale / GradeScaleMeta**
  - [x] Seed bands on Neon (3 contiguous bands)
  - [x] Release gate: calculator uses `GradeScaleMeta.confirmed`
  - [x] Owner prod prep: `confirmed=true` on Neon (`2026-11-23-grade-scale-confirm.sql`)

### 2.2 Models missing from contract (must add for architecture + product)

- [~] **`OutcomeLink`** — **in contract + local Docker + API**
  - Fields: `id`, `coId` → Outcome, `poId` → Outcome, `level` enum `I|E|D`
  - Unique `(coId, poId)` (DBDEC-002)
  - Cascade with Outcome
  - [~] Outcomes UI reads live links when present; falls back to seed map
  - [ ] Wire ingest confirm to write OutcomeLink rows
- [~] **`IdempotencyKey`** — **in contract + local Docker**
  - Fields per §5.4; unique `(userId, key, route)`
  - [ ] Require header on create/replace/ingest POSTs + persist responses
- [~] **`PlanNote`** — **in contract + local Docker + API + UI cutover**
  - Pin ≤3 service-only (DBDEC-006); importance CHECK 1–3
  - No localStorage import (DBDEC-008)
- [~] **`ManualChecklistItem`** — **in contract + local Docker + API + UI cutover**
  - Never writes scores / never feeds Calculator (I14)
- [~] **`ActivityEvent`** — **in contract + local Docker + API + UI cutover**
  - Constrained text kind + 90d purge stub (DBDEC-005)
- [x] **`User` preferences (optional)**
  - `theme` — **N/A client-only** `gs-theme` (DBDEC-004)

### 2.3 Prisma migrate workflow (Neon)

- [~] Ensure `prisma/contract.prisma` is source of truth — updated; emit hash `0e991704…`
- [~] Generate migration SQL for all new models + indexes + CHECKs — applied via `prisma db update` on local Docker
- [~] Apply raw SQL for §7.3 — `prisma/sql/2026-11-21-constraints-and-grade-scale.sql` (local)
- [ ] Run migrate on Neon `develop` → smoke test → promote to `main`
- [ ] Record migration hash / Neon timeline bookmark after each prod apply
- [ ] Add CI step: `prisma migrate diff` / drift check against Neon

**Verify:** Local Docker schema matches contract; Neon still **NOT VERIFIED**.

---

## 3. End-to-end data domains (every user input → Neon)

Complete each domain only when: **schema + Zod + service + API + UI** use Neon (not localStorage).

### 3.1 Account / auth

- [ ] Clerk webhook upserts/deletes `User` (`CLERK_WEBHOOK_SECRET` set in prod)
- [ ] `clerkUserId` unique; email updated from Clerk
- [ ] `consentAt` recorded when required by product
- [ ] Account deletion cascades all owned data (architecture §6.6)
- [ ] Export-my-data path reads only Neon + regenerates files (no orphan Blob deps)

### 3.2 Semester

- [ ] Create / patch / list from Neon
- [ ] Validate label, dates, skipped weeks
- [ ] Ownership scoped by `userId`

### 3.3 Subject lifecycle

- [ ] Create (manual + from ingest confirm) in one transaction with children
- [ ] Patch course fields + module Json (grading/policies/faculty) with typed Zod
- [ ] Archive / restore / hard-delete after 30 days (`purge-archived`)
- [ ] Replace-subject copies matching scores (architecture §7.4)
- [ ] Active code uniqueness enforced at DB (partial index)

### 3.4 Outcomes + map

- [~] Replace outcomes set on Neon — API exists; Neon pending
- [~] Persist **OutcomeLink** I/E/D — API `GET/PUT …/outcome-links`; ingest write pending
- [~] Outcomes page reads live outcomes + links (seed fallback when empty/demo)
- [ ] Assessment Map / derived outcome uses Neon mappings

### 3.5 Learning plan + notes

- [~] Plan weeks CRUD / replace — API exists
- [~] **PlanNote** CRUD — API + UI cutover (local Docker)
- [x] Pin ≤3 enforced server-side
- [ ] Undo / latest-body sync rules documented (PlanWeek.notes vs PlanNote)
- [x] Client localStorage notes no longer source of truth (API-backed; DBDEC-008 no import)

### 3.6 Checklist

- [~] Week `ChecklistItem` toggle — API exists
- [~] Dashboard ring progress from checklist counts
- [~] **ManualChecklistItem** CRUD — API + UI cutover (local Docker)
- [x] Manual items never affect Calculator (I14-equivalent)

### 3.7 Assessments + scores + calculator

- [ ] Assessment create/patch/delete on Neon
- [ ] AssessmentOutcome mappings
- [ ] Batch score upsert with version conflicts
- [x] GradeScale seeded + confirmed on Neon
- [ ] Derived averages computed — never stored (I8)

### 3.8 Syllabus ingest

- [ ] Blob upload token valid in prod
- [ ] `IngestJob` state machine on Neon
- [ ] Confirm creates Subject tree + OutcomeLinks in one transaction
- [ ] `purge-ingest` clears `result` + orphan blobs
- [ ] Rate limit via counting `IngestJob` rows (architecture §5)

### 3.9 Drafts

- [ ] Autosave Draft to Neon
- [ ] `purge-drafts` daily (expiresAt)
- [ ] Unique `(userId, kind)`

### 3.10 Activity / notifications

- [~] Client mutations POST `/api/activity` (notes, checklist, dashboard helpers)
- [~] Top bar reads from API (`NotificationsMenu`)
- [~] Mark-all-read updates `readAt` via PATCH `/api/activity`
- [x] Retention 90 days (DBDEC-005); purge stub in `lib/jobs/purge.ts`
- [ ] Wire more server-side writes from every mutation path

### 3.11 Theme

- [x] Decide: **client-only** `gs-theme` (DBDEC-004)
- [x] Document as non-authoritative preference (not synced)

### 3.12 Audit + idempotency

- [ ] All mutating routes write `AuditLog`
- [ ] Idempotency-Key required on create/replace/ingest + persist to `IdempotencyKey`
- [~] `purge-idempotency` (24h) stub ready
- [ ] Runtime role cannot UPDATE/DELETE AuditLog

---

## 4. Scheduled jobs (Trigger.dev → Neon + Blob)

- [ ] `purge-archived` (daily) — hard-delete subjects archived > 30 days
- [ ] `purge-ingest` (hourly) — clear old `IngestJob.result` + delete blobs
- [~] `purge-drafts` (daily) — stub `purgeExpiredDrafts`
- [~] `purge-idempotency` (hourly) — stub `purgeIdempotencyKeys`
- [ ] `sweep-orphan-blobs` (hourly)
- [~] `purge-activity` 90d — stub `purgeOldActivities`
- [ ] Jobs use Neon **pooled** URL; migrations never run inside job workers
- [ ] Alerting on job failure (email/Slack)

**Verify:** Run each job once against Neon `develop` with fixtures; confirm row/blob deletion.

---

## 5. Security & multi-tenant correctness (Neon)

- [ ] Every owned query filters by Clerk → `User.id` (no raw id-only reads)
- [ ] Authorization matrix tests against Neon (user B → 404 on user A resources)
- [ ] Optional phase-2: Postgres RLS with `app.user_id` (architecture §6.3)
- [ ] Secrets only in Vercel/Neon env — rotate `DATABASE_URL` after any leak
- [ ] No production data in local Docker after cutover (or anonymized only)
- [ ] Parameterized queries only (Prisma)
- [ ] Rate limits still enforced at API (ingest, writes)

---

## 6. App cutover from local Docker / localStorage → Neon

### 6.1 Connection cutover

- [ ] Point local `.env.local` at Neon `develop` for integration testing
- [ ] Point Vercel Preview at Neon `develop`
- [ ] Point Vercel Production at Neon `main` (pooled + direct)
- [ ] Decommission Docker Postgres for prod path (keep optional for offline demos)

### 6.2 Feature cutover (localStorage → Neon)

For each feature: API ready → UI wired → dual-read optional → Neon-only → delete localStorage writers.

- [~] Plan notes (`gs-notes-entries` / `gs-notes-meta`) — API + UI; localStorage writers removed
- [~] Manual checklist (`gs-manual-checklist`) — API + UI; writers removed
- [~] Activity log (`gs-activity-log`) — API + UI; writers removed
- [x] Theme — keep client-only (DBDEC-004)
- [~] Outcomes map — live outcomes + OutcomeLink when present; seed fallback

### 6.3 Data migration (if users already have localStorage data)

- [ ] One-time “Import local data” tool (signed-in) OR document “local demo data will not sync”
- [ ] Export/backup any critical local notes before wipe
- [ ] Validate counts after import (notes, manual checklist items)

---

## 7. Validation, limits, and defense in depth

- [ ] All user inputs pass Zod before write (existing + new models)
- [ ] Mirror critical max lengths in DB where practical (`varchar` / CHECK)
- [ ] Json fields: max payload size + schema validation
- [ ] Service caps: MAX_OUTCOMES, MAX_PLAN_WEEKS, MAX_ASSESSMENTS, pin ≤3, etc.
- [ ] Decimal precision consistent for `units`, `maxScore`, `score`, grade bands

---

## 8. Observability & ops on Neon

- [ ] Neon metrics dashboard bookmarked (connections, storage, compute)
- [ ] Slow query review after load test
- [ ] Connection pool sizing for Vercel serverless (avoid exhaustion)
- [ ] Alert on migration failure / disk growth
- [ ] Document rollback: Neon PITR + app redeploy previous release
- [ ] Quarterly restore drill recorded here: `Last drill: ____`

---

## 9. Testing gates (must pass before “100% ready”)

- [ ] Unit: Zod schemas for every new model
- [ ] Integration (real Neon `develop`): transactions, partial unique, version conflict, replace+copy scores
- [ ] Authorization matrix generated tests
- [ ] Ingest happy + failure paths against Neon job rows
- [ ] Purge job tests (draft/ingest/idempotency/archived)
- [ ] E2E: add subject → plan notes → checklist → scores → calculator uses Neon only
- [ ] E2E: outcomes map shows Neon OutcomeLinks after ingest confirm
- [ ] No `localStorage` writes for signed-in live subjects (assert in E2E or lint)

---

## 10. Definition of Done — 100% production-ready

Mark the system **100% ready for production storage on Neon** only when all are true:

1. [ ] Neon `main` is the sole production database (pooled + direct URLs, SSL).
2. [ ] Prisma contract + raw SQL constraints match architecture needs (including `OutcomeLink`, `IdempotencyKey`, partial unique subject code, Score CHECK).
3. [ ] Every user-input feature that must sync across devices/browsers persists in Neon (notes, manual checklist, activity, core subject tree, scores, ingest, drafts).
4. [ ] Blob remains transient PDF hand-off only; Neon holds structured data (I2).
5. [x] Purge jobs scheduled (`vercel.json` → `/api/cron/purge`); Blob orphan sweep still deferred.
6. [x] GradeScale seeded & confirmed; Calculator unblocked.
7. [ ] Clerk webhook + Blob tokens configured for production.
8. [ ] AuthZ matrix + migrate drift checks green in CI against Neon.
9. [ ] Backup/PITR restore drill completed and dated in this file.
10. [ ] localStorage is not the source of truth for any production user data (theme optional exception documented).

**Sign-off**

| Role | Name | Date | Neon project / branch |
| ---- | ---- | ---- | --------------------- |
| Owner | | | |
| Eng | | | |

---

## 11. Suggested implementation order (Neon)

Work top-to-bottom to reduce rework:

1. Neon project + env + migrate existing contract to Neon  
2. Raw SQL: partial unique subject code, Score CHECK, AuditLog privileges  
3. Seed GradeScale on Neon  
4. Add `OutcomeLink` + `IdempotencyKey`  
5. Add `PlanNote`, `ManualChecklistItem`, `ActivityEvent` + APIs  
6. Wire UI off localStorage  
7. Purge jobs + Blob orphan sweep  
8. Clerk webhook + secrets hardening  
9. CI drift + AuthZ tests on Neon  
10. Prod cutover + restore drill → sign-off §10  

---

## 12. File / code map (where to implement)

| Area | Primary paths |
| ---- | ------------- |
| Prisma contract | `goldensync-web/prisma/contract.prisma` |
| Prisma config | `goldensync-web/prisma.config.ts` |
| Env | `goldensync-web/.env.local` → Vercel / Neon secrets |
| Zod | `goldensync-web/lib/validation/*` |
| Services | `goldensync-web/lib/services/*` |
| API routes | `goldensync-web/app/api/**` |
| Notes (API) | `lib/notes/saved-notes.ts`, `lib/api/notes.ts`, `app/api/subjects/[id]/notes/**` |
| Manual checklist (API) | `lib/checklist/manual-items.ts`, `lib/api/manual-checklist.ts`, `app/api/subjects/[id]/manual-checklist/**` |
| Activity (API) | `lib/activity/activity-log.ts`, `lib/api/activity.ts`, `app/api/activity/route.ts` |
| Outcome links (API) | `lib/services/outcome-links.ts`, `lib/api/outcome-links.ts`, `app/api/subjects/[id]/outcome-links/route.ts` |
| Raw SQL constraints + seed | `prisma/sql/2026-11-21-constraints-and-grade-scale.sql` |
| Purge stubs | `lib/jobs/purge.ts` |
| Architecture reference | `context/prototype-plan/goldensync-context/system-architecture.md` |
| User-added features log | `context/user-added-features/new-features.md` |
| D0 docs (gap, ERD, dictionary, plan, risks, decisions, runbook) | `docs/database/*` |

---

## 13. BUILD LEDGER

| ID | When (UTC+8) | Phase | Piece | Tracker items | Migration | Neon branch | Files | Status | Evidence | Notes |
| -- | ------------ | ----- | ----- | ------------- | --------- | ----------- | ----- | ------ | -------- | ----- |
| DB-001 | 2026-11-21 14:05 | D0 | Preflight audit — gap report, ERD, index/constraint plan, risks, open decisions, docs skeleton; **no schema/code changes** | D0 deliverables | — | NOT VERIFIED | `docs/database/*` | **BUILT** | `docs/database/gap-report.md` | — |
| DB-002 | 2026-11-21 14:20 | D1–D6 | Owner override: adopt DBDEC recommendations; emit contract; `db update` local; raw SQL CHECKs/partial unique; GradeScale seed (`confirmed=false`); services+APIs+UI cutover for PlanNote / ManualChecklist / Activity / OutcomeLink; purge stubs | §2.2, §3.4–3.6, §3.10–3.11, §6.2 | storageHash `0e991704…` via `prisma db update` + raw SQL file | local Docker only | `prisma/contract.prisma`, `prisma/sql/*`, `lib/services/*`, `app/api/**`, UI clients | **BUILT** (local) | Tables created; seed 3 bands; APIs wired | Superseded by DB-003 on Neon |
| DB-003 | 2026-11-21 17:50 | D1 | Neon connect + full schema apply on owner Neon project; raw SQL constraints + GradeScale seed | §1, §2.3, §15–18 | `prisma db update` → `0e991704…` + `apply-constraints.mjs` | Neon (app env) | `.env.local` Neon URLs; same contract/SQL | **BUILT** | All tables; 3 bands; CHECKs; partial unique | Superseded confirm by DB-004 |
| DB-004 | 2026-11-23 04:35 | Prod | GradeScale confirm; `/api/cron/purge` + `vercel.json`; deep health; prod deploy checklist | BLOCK-03, §4, §6 | `2026-11-23-grade-scale-confirm.sql` | Neon | `lib/jobs/purge.ts`, `app/api/cron/purge`, `app/api/health`, `docs/production-deploy-checklist.md` | **BUILT** | `confirmed=true`; cron route | BLOCK-04 Vercel secrets still owner |
| DB-005 | 2026-11-23 05:40 | Ops | Full Neon `pg_dump` snapshots + pgAdmin-friendly INSERT dump; E2E UX fixes (plan/checklist/overview); ProtoFab Suspense; handoff `docs/NEXT-SESSION.md` | §18 dumps | — (read-only dump) | Neon | `docs/database/goldensync-neondb-*.sql`, Desktop `*-for-pgadmin.sql`, app UX files | **BUILT** | `psql` 19 public tables; dump ~245KB | pgAdmin live ERD deferred to next session |

---

## 14. DECISION LOG

| ID | Topic | Options | Owner answer | Reason | Date |
| -- | ----- | ------- | ------------ | ------ | ---- |
| DBDEC-001 | PlanWeek shape | A minimal / B arch ranges | **A** | Match current Plan UI; schedule B later | 2026-11-21 |
| DBDEC-002 | OutcomeLink cardinality | one level / many | **One** `(coId,poId)` UNIQUE | Arch §7.2 I/E/D | 2026-11-21 |
| DBDEC-003 | skippedWeeks | Int[] / Json+Zod | **Json + Zod** | Less migration risk | 2026-11-21 |
| DBDEC-004 | User.theme | Neon / client | **Client-only** `gs-theme` | Multi-device sync not required | 2026-11-21 |
| DBDEC-005 | Activity kind + retention | enum / text; 30/90/365 | **Text + 90d** | Flexible kinds; purge stub | 2026-11-21 |
| DBDEC-006 | PlanNote pin ≤3 | service / DB guard | **Service-only** | Add DB guard if abuse | 2026-11-21 |
| DBDEC-007 | Prisma version | 8 RC / 7.x | **Stay 8** | Project already on Prisma 8 | 2026-11-21 |
| DBDEC-008 | localStorage import | import tool / no sync | **No sync** MVP | Demo data stays local | 2026-11-21 |
| DBDEC-009 | RLS | now / later | **Later** | App-layer ownership first | 2026-11-21 |
| DBDEC-010 | Integration tests | Vitest+Neon / other | **Vitest + Neon develop** | Arch §16 | 2026-11-21 |

Owner override 2026-11-21: “do it and do not wait… everything is specified” → recommendations applied as answers.

---

## 15. SCHEMA CHANGELOG

| Migration | What changed | Risk | Rollback | Applied to |
| --------- | ------------ | ---- | -------- | ---------- |
| `prisma db update` → `0e991704…` | Added `LinkLevel`, `OutcomeLink`, `PlanNote`, `ManualChecklistItem`, `ActivityEvent`, `IdempotencyKey`; Outcome unique; Subject archived index | Low (additive) | Drop new tables / re-emit prior contract | **local Docker** + **Neon (DB-003)** |
| `prisma/sql/2026-11-21-constraints-and-grade-scale.sql` | Partial unique subject code; Score/Semester CHECKs; PlanNote importance CHECK; GradeScale 3-band seed + meta `confirmed=false` | Low | Drop index/constraints; delete seed rows | **local Docker** + **Neon (DB-003)** |

---

## 16. VERIFICATION LOG

| When | Command / query | Branch | Result | Summary |
| ---- | --------------- | ------ | ------ | ------- |
| 2026-11-21 | `docker ps` + `\dt` baseline | local Docker | OK | Pre-D1 baseline |
| 2026-11-21 | `prisma contract emit` | local | OK | storageHash `0e991704d0471b64…` |
| 2026-11-21 | `prisma db update --yes` | local Docker | OK | 26 ops — new tables/indexes/FKs |
| 2026-11-21 | raw SQL constraints + GradeScale seed | local Docker | OK | 3 bands; meta unconfirmed; partial unique present |
| 2026-11-21 | Neon project / `SELECT 1` | Neon | **NOT VERIFIED** | No Neon credentials (pre DB-003) |
| 2026-11-21 17:48 | `.env.local` Neon pooled + direct | Neon | OK | DATABASE_URL=pooled; DIRECT_URL=direct |
| 2026-11-21 17:50 | `prisma db update --yes --db $DIRECT_URL` | Neon | OK | Full contract bootstrap; marker `0e991704…` |
| 2026-11-21 17:51 | `apply-constraints.mjs` (CHECKs + GradeScale seed) | Neon | OK | 3 bands; confirmed=false; partial unique + 3 CHECKs |
| 2026-11-23 04:35 | `2026-11-23-grade-scale-confirm.sql` | Neon | OK | `GradeScaleMeta.confirmed=true` |
| 2026-11-23 05:08 | `pg_dump` full plain SQL | Neon | OK | `docs/database/goldensync-neondb-full-2026-11-23-050854.sql` (~249KB; has `\restrict`) |
| 2026-11-23 05:30 | `pg_dump --inserts` stripped restrict | Neon | OK | Desktop + `docs/database/goldensync-neondb-for-pgadmin.sql` |
| 2026-11-23 05:38 | `psql` connectivity | Neon | OK | `neondb` / `neondb_owner` / 19 public tables |

---

## 17. DRIFT AND BLOCKERS

| ID | Type | Detail | Resolution |
| -- | ---- | ------ | ---------- |
| DRIFT-01 | Arch vs contract | OutcomeLink + IdempotencyKey | **Resolved** DB-002 + Neon DB-003 |
| DRIFT-02 | Arch vs contract | PlanWeek Option B deferred | **Accepted** DBDEC-001 |
| DRIFT-03 | Product vs DB | Notes / manual / activity localStorage | **Resolved** API cutover + Neon |
| BLOCK-01 | Neon | No Neon project/secrets | **Resolved** DB-003 — `.env.local` Neon URLs + schema applied |
| BLOCK-02 | Decisions | Was blocking D1 | **Resolved** via owner override + DBDEC-001…010 |
| BLOCK-03 | GradeScale | `confirmed=false` | **Resolved** 2026-11-23 — `confirmed=true` on Neon |
| BLOCK-04 | Vercel | Prod/preview env not set to Neon | Owner: copy URLs + Clerk prod + Blob + `CRON_SECRET` (see `docs/production-deploy-checklist.md`) |
| BLOCK-05 | Tooling | pgAdmin ERD from `.sql` file | **Deferred** — connect live Neon next session (see `docs/NEXT-SESSION.md`); Mermaid ERD already in `docs/database/erd.md` |

---

## 18. CURRENT STATE

| Field | Value |
| ----- | ----- |
| Last verified piece | DB-005 dumps + E2E UX fixes; DB-004 prod prep still stands |
| NOW WORKING ON | **Session active 2026-11-23 11:57** — wake complete; ready for BLOCK-04 / pgAdmin ERD / E2E re-smoke |
| Next action | Owner pick: (1) Vercel/Clerk Production secrets (2) pgAdmin Neon ERD (3) re-smoke create→plan→checklist |
| Neon migrations | contract marker `0e991704…` + plan-week SQLs + GradeScale confirm |
| Neon `main` last migration hash | same project branch used for DB-003 (owner `production` branch in console) |
| Last restore drill | none (dumps exist for offline read; not a PITR drill) |
| Local Docker | still available offline; app env now Neon |
| Cron | `vercel.json` → `/api/cron/purge` daily 16:00 UTC |
| SQL snapshots | `docs/database/goldensync-neondb-full-*.sql` · `*-for-pgadmin.sql` · Desktop copy |

---

*Last updated: 2026-11-23 05:40 — Shutdown handoff. Neon live + dumps OK. BLOCK-04 + pgAdmin ERD deferred.*
