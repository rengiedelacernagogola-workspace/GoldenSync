# GOLDENSYNC: DATABASE STANDARDS

> The engineering standard for the GoldenSync database (Neon Postgres, Prisma) and everything that touches it.
> Written the way a 30-year database engineer works: constraints first, changes reversible, evidence for every claim, and data protected above all.
> Read this file at the start of every database session together with `database-tracker.md` and `database-constructore.md`. `stack-code-standards.md` covers the application layers above the database. The checker audits against both.

| Field      | Value |
| ---------- | --- |
| Version    | 1.0 |
| Created    | 2026-11-21 |
| Applies to | Neon Postgres (`goldensync`), Prisma schema and migrations, raw SQL, repositories, services, API routes, scheduled jobs |

---

## 0. PRECEDENCE AND SCOPE

1. **The product defines the data, not the standards.** These rules decide how the database is built. They never add features, tables or columns the product does not need.
2. **Source order:** `database-tracker.md` > `system-architecture.md` (sections 5.4, 6, 7 to 9, Appendix A, invariants I2, I8, I14) > `contract.prisma` and the live schema > this file. On conflict, stop, log a drift, ask the owner.
3. **The stack is fixed:** Neon Postgres, Prisma 8 (`prisma.config.ts`), Zod, Clerk webhook, Vercel Blob (transient PDF hand-off only), Trigger.dev. No new database tool, extension, ORM, test runner or service without the owner's approval.
4. **A standard that cannot be met is recorded, not bent.** Log a `DBDEC` in `database-tracker.md` with the rule, the reason, the alternative and the approver.

---

## 1. ENGINEERING PRINCIPLES

| Principle | What it means for GoldenSync |
| --- | --- |
| **The database is the last line of defense** | Any rule that must always hold is a constraint (NOT NULL, FK, UNIQUE, CHECK, partial unique index). The service enforces it too, for good error messages, but never instead of the database |
| **Correctness before performance** | Get the model and constraints right first. Tune with measured evidence, never by guess |
| **Data outlives code** | Schema decisions are expensive to undo. Think twice, migrate once. Every migration has a rollback plan |
| **Least privilege** | The app can only do what it needs. The runtime role cannot change the schema or rewrite the audit log |
| **Derive, don't duplicate** | Store each fact once. Computed values (averages, grade results) are computed, never stored (invariant I8) |
| **Make illegal states unrepresentable** | Closed sets are enums or CHECKs. Relations are foreign keys. Impossible combinations get a CHECK |
| **Explicit over implicit** | Every FK has a chosen ON DELETE rule. Every nullable column has a reason. Every JSON column has a schema |
| **Evidence over assertion** | "Done" means verified on a real Neon branch with recorded output |
| **Small reversible steps** | One migration, one concern. Expand, then contract. Never a big-bang change |
| **Privacy by design** | Collect the minimum. Delete completely. Never log personal data |

---

## 2. ENVIRONMENTS AND BRANCHING (NEON)

| Environment | Neon branch | Purpose | Rules |
| --- | --- | --- | --- |
| Production | `main` | Real user data | No write, migration, seed or purge without the owner's explicit approval for that exact action |
| Preview / staging | `develop` | Integration testing, PR previews, migration rehearsal | Every migration lands here first |
| Scratch | throwaway branches from `develop` | Experiments, destructive tests, load tests | Delete after use. Never share their URLs |
| Local | Docker `goldensync-pg` (demos only) | Offline demos | Not a source of truth. No production data. Retire from the prod path after cutover |

Rules:
- Create a throwaway branch (from `develop`) for any risky or destructive test. Never test destructive operations on `develop` directly.
- Promote only through `develop` to `main`. Never skip.
- Record the Neon branch used and the timeline bookmark (or migration hash) after every production apply, in the tracker's CURRENT STATE.
- Neon compute may autosuspend. Design for cold starts (section 15). The production keep-warm policy is a recorded decision.

### 2.1 Secrets and connections

- `DATABASE_URL` = **pooled** host, used by the app and jobs. `DIRECT_URL` = **direct** host, used only by migrations and admin tooling. Both require `sslmode=require`.
- Secrets live only in `.env.local` (git-ignored) and Vercel / Neon secret storage. Never in code, tracker, logs, screenshots, issue text or chat. A leaked string is rotated immediately.
- Validate environment variables with Zod at startup in one module (`lib/env.ts`). The app fails fast on a missing or malformed value.
- Use separate credentials per role (section 8) and per environment. Never reuse a production credential in `develop`.

---

## 3. NAMING CONVENTIONS

Match the existing `contract.prisma` first. Where it is inconsistent, propose one rule, get approval, and apply it going forward through a recorded migration, never ad hoc.

| Object | Convention | Example |
| --- | --- | --- |
| Prisma model | `PascalCase`, singular | `Subject`, `PlanNote` |
| Prisma field | `camelCase` | `courseCodeNorm`, `archivedAt` |
| Table / column in Postgres | As mapped by Prisma (keep the existing mapping rule). Quoted identifiers are acceptable when matching existing tables, but do not mix styles inside one table | `"Subject"."semesterId"` |
| Primary key | `id` | |
| Foreign key column | `<relation>Id` | `subjectId`, `coId`, `poId` |
| Boolean | `isX`, `hasX`, or a nullable timestamp `xAt` when the time matters | `archivedAt` rather than `isArchived` |
| Timestamps | `createdAt`, `updatedAt`, `<event>At` | `consentAt`, `readAt` |
| Enum type | `PascalCase`, values `UPPER_SNAKE_CASE` | `OutcomeKind`, `LinkLevel` (`I`, `E`, `D`) |
| Unique index / constraint | `<table>_<columns>_key` or a descriptive name for partial indexes | `subject_active_code_per_semester` |
| Check constraint | `<table>_<rule>_chk` | `score_bounds_chk`, `semester_dates_chk` |
| Index | `<table>_<columns>_idx` | `subject_semesterId_archivedAt_idx` |
| Migration folder | timestamp + imperative snake case | `20261121_add_outcome_link` |

- Names explain themselves. No abbreviations the team would have to look up (`co`/`po` are domain terms already used by the product, document them in the data dictionary).
- No reserved words as names. No names that differ only by case.
- Plural or singular is consistent across the schema.

---

## 4. DATA TYPES

| Data | Type | Rule |
| --- | --- | --- |
| Identifiers | One strategy across all tables (keep the contract's existing ID type) | Never mix ID types. IDs are opaque. Never expose a sequential ID if the architecture says IDs must be non-guessable |
| Timestamps | `timestamptz`, stored in UTC | Never `timestamp` without time zone. Convert to Asia/Manila only at the display layer |
| Dates without time (semester start/end) | `date` | Confirm the contract uses it. Validate `endDate > startDate` with a CHECK |
| Scores, units, max scores, grade bands | `numeric(p,s)` with the precision recorded in the data dictionary | Never `float`/`real`. Same precision for the same concept everywhere (section 7 of the tracker) |
| Counts, week numbers, positions | `integer` | With CHECK ranges (week number >= 1, position >= 0) |
| Short text | `varchar(n)` or text with a CHECK on length | Length mirrors the Zod cap |
| Long text (notes body) | `text` with a CHECK on `length()` | Cap mirrors Zod and the service constant |
| Closed sets | Postgres enum or `text` with a CHECK | Prefer enum for stable sets (`LinkLevel`), CHECK for sets that may grow. Decision recorded per column |
| Flexible documents | `jsonb` | Only for genuinely document-shaped data (section 11) |
| Arrays | Native array only for small, bounded, value-like lists (`skippedWeeks Int[]` if approved) | Never for relations |
| Booleans | `boolean NOT NULL DEFAULT ...` | Never a nullable boolean (three-valued logic) |

- Every column states NOT NULL or NULL on purpose. Default is NOT NULL. A nullable column needs a written reason in the data dictionary.
- Defaults are explicit. No hidden defaults in application code that the database does not know about.

---

## 5. SCHEMA DESIGN RULES

### 5.1 Modeling

- Model to **third normal form**. Denormalize only with a measured reason, recorded as a `DBDEC`, and keep the source of truth clear.
- One table per entity. No "type" column that makes a table hold unrelated things.
- Many-to-many relations use an explicit join table with its own primary key or composite unique, and extra columns where the relation has attributes (`OutcomeLink.level`, `AssessmentOutcome`).
- **No derived data stored** (I8): averages, grade results, progress percentages are computed from source rows. If a cache is ever approved, it is clearly named, rebuildable, and never the source of truth.
- Manual checklist items never feed the calculator (I14): they live in their own table (`ManualChecklistItem`) with no relation to scores or assessments.

### 5.2 Primary keys

- Every table has a single-column primary key. Natural keys become UNIQUE constraints, not primary keys.
- The ID strategy is one decision, recorded once.

### 5.3 Foreign keys and delete behavior

Every foreign key states its `ON DELETE` rule on purpose, and the choice is documented in the data dictionary.

| Relationship type | Rule |
| --- | --- |
| Child owned by the parent (a Subject's outcomes, plan weeks, assessments, scores, checklist items, notes) | `ON DELETE CASCADE`, so deleting a subject or the account leaves no orphans |
| Reference to shared reference data (grade scale) | `RESTRICT` |
| Optional link where the child should survive (e.g. `PlanWeek.outcomeId` under Option B) | `SET NULL` |
| User-owned root data | Cascade from `User`, so account deletion is complete (architecture section 6.6) |

- Every foreign key column used in a join or delete cascade has an index. Postgres does not create these automatically.
- Cross-tenant integrity: where a child references two parents that must belong to the same user (for example `OutcomeLink` linking a CO and a PO of the same subject), enforce it with a composite foreign key or a CHECK-backed pattern, or in the service inside a transaction. The choice is recorded.

### 5.4 Constraints (what to enforce in the database)

| Rule from the tracker | Database mechanism |
| --- | --- |
| One active subject code per semester | Partial unique index on `("semesterId","courseCodeNorm") WHERE "archivedAt" IS NULL` |
| Outcome unique per subject, kind and code | `UNIQUE ("subjectId","kind","code")` |
| One checklist tick row per subject and week | `UNIQUE ("subjectId","weekNumber")` |
| One draft per user and kind | `UNIQUE ("userId","kind")` |
| Score within bounds | CHECK `score_bounds_chk` (score between 0 and the assessment max, per architecture 7.3) |
| Semester dates ordered | CHECK `endDate > startDate` |
| Plan week range ordered (Option B) | CHECK `weekFrom <= weekTo` |
| Idempotency per user, key and route | `UNIQUE ("userId","key","route")` |
| Note importance 1 to 3 | CHECK |
| One level per CO to PO pair (if approved) | `UNIQUE ("coId","poId")` |
| Pin up to 3 notes per subject | Service in a transaction. Optionally a database guard (decision 6). Partial unique indexes cannot express "at most 3" |

- Example of a partial unique index (raw SQL migration, because Prisma cannot declare it):
  ```sql
  CREATE UNIQUE INDEX subject_active_code_per_semester
    ON "Subject" ("semesterId", "courseCodeNorm")
    WHERE "archivedAt" IS NULL;
  ```
- Example of a CHECK added safely to a table that already has data:
  ```sql
  ALTER TABLE "Semester"
    ADD CONSTRAINT semester_dates_chk CHECK ("endDate" > "startDate") NOT VALID;
  -- fix or review existing rows, then:
  ALTER TABLE "Semester" VALIDATE CONSTRAINT semester_dates_chk;
  ```
- Constraints that cannot be expressed in Prisma live in raw SQL migrations, are listed in the data dictionary, and are checked by the drift test (section 9.5).

### 5.5 Soft delete, archive and retention

- GoldenSync uses **archive** (a nullable `archivedAt`) where the product has an archive state (subjects, notes), and **hard delete** where it does not.
- Archived subjects are hard-deleted after 30 days by the `purge-archived` job. Active-only constraints use partial indexes on `archivedAt IS NULL`.
- Every list query states whether it includes archived rows. No accidental inclusion.
- Retention per table is written down (section 14) and enforced by a scheduled job.

---

## 6. INDEXING STANDARDS

- **Every index is justified by a query the app actually runs.** Record the query next to the index in the data dictionary. No speculative indexes: each one slows writes and uses storage.
- Index every foreign key used in joins or cascades.
- Composite index column order: equality columns first, then range or sort columns (`(semesterId, archivedAt)`, `(subjectId, savedAt)`, `(userId, createdAt DESC)`).
- Use partial indexes where the tracker specifies a subset (active rows).
- Unique constraints already create an index. Do not add a duplicate.
- Check plans with `EXPLAIN (ANALYZE, BUFFERS)` on realistic data volume, not on empty tables. Record the plan summary in the verification log. Watch for sequential scans on large tables, row-estimate errors, and sorts that need an index.
- Review unused and duplicate indexes (`pg_stat_user_indexes`) after load testing.
- Build indexes on populated tables with `CREATE INDEX CONCURRENTLY` in a raw SQL migration (outside a transaction) when the table has real data.

---

## 7. MIGRATION STANDARDS

### 7.1 Rules

1. **Forward-only and immutable.** Never edit an applied migration. Fix forward with a new migration.
2. **`prisma/contract.prisma` is the source of truth** for the schema. Anything Prisma cannot express goes in a raw SQL migration, listed in the schema changelog.
3. **Read the generated SQL line by line** before applying. Prisma may generate a destructive change (drop and recreate, data loss on rename) that the diff hides.
4. **One concern per migration**, small and named for what it does.
5. **Rehearse on `develop` first.** Apply from an empty branch AND from the current state. Then `prisma migrate diff` must show no drift.
6. **Migrations run from CI or a controlled command with `DIRECT_URL`**, never inside the running app or a job worker.
7. **Every migration has a written rollback** (how to reverse, or how to restore from Neon PITR or a branch snapshot), recorded in the changelog before it is applied to `main`.
8. **No data and schema change that cannot be undone** without a Neon branch snapshot first and the owner's explicit approval.

### 7.2 Safe change patterns (expand, then contract)

| Change | Safe sequence |
| --- | --- |
| Add a column | Add nullable (or with a constant default) > deploy code that writes it > backfill in batches > add NOT NULL / constraint (`NOT VALID`, then `VALIDATE`) |
| Rename a column or table | Add the new name > write to both > backfill > switch reads > stop writing the old > drop the old in a later release. Never a plain rename on a live table |
| Drop a column or table | First stop all reads and writes in code and deploy > wait a release > then drop (needs backup, rollback plan, explicit approval) |
| Change a column type | New column > backfill > switch > drop old. Avoid in-place type rewrites on large tables |
| Add a foreign key | `NOT VALID` first, then `VALIDATE CONSTRAINT` to limit locking |
| Add an index on real data | `CREATE INDEX CONCURRENTLY` |
| Add a unique index | Check existing data for duplicates first and resolve them with the owner, then create |

- Backfills run in small batches, are idempotent, and can be resumed. Never one giant UPDATE.
- Set a `lock_timeout` (and `statement_timeout`) for migration sessions so a blocked DDL fails fast instead of queuing behind long queries and stalling the app.
- Never combine a risky DDL and a data rewrite in one transaction on a large table.

### 7.3 Prisma-specific rules

- Prisma 8 is a release candidate. Before relying on any behavior, read the installed version's documentation. Record anything surprising in the tracker. The Prisma 8 RC vs 7.x decision (tracker N-02) is the owner's.
- Do not hand-edit generated migration SQL beyond adding the raw SQL the contract cannot express, and note each edit in the changelog.
- Run `prisma migrate diff` in CI to detect drift between the contract, the migrations and the Neon branch.
- Never run `npm audit fix`. Run all npm and prisma commands from `goldensync-web/`.
- Generate the client in CI and locally the same way. Do not commit generated client output unless the project already does.

---

## 8. SECURITY AND ACCESS CONTROL

### 8.1 Roles (least privilege)

| Role | Used by | Privileges |
| --- | --- | --- |
| `app_migrator` | CI and migration commands via `DIRECT_URL` | DDL (create, alter, drop) on the app schema |
| `app_runtime` | The app and scheduled jobs via `DATABASE_URL` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` on app tables as needed. No DDL. On `AuditLog`: `INSERT` and `SELECT` only |

```sql
-- Audit log is insert-only for the runtime role (architecture 7.3)
REVOKE UPDATE, DELETE, TRUNCATE ON "AuditLog" FROM app_runtime;
GRANT INSERT, SELECT ON "AuditLog" TO app_runtime;
```

- Verify privileges with tests that attempt the forbidden operation as `app_runtime` and expect an error. Record the output.
- Grant on specific tables and sequences. Set default privileges so new tables do not become over-privileged by accident.
- Never use the project owner or admin role from the app.

### 8.2 Multi-tenant isolation

- Every owned row is reachable only through the owning user. Every repository query filters by the authenticated `User.id` (resolved from Clerk). **No id-only reads or writes.**
- Child tables are scoped through their parent chain (subject belongs to semester belongs to user). Queries join up or carry `userId` so ownership is checked in the same statement, not in a separate step that can race.
- Cross-tenant requests return "not found", never "forbidden", so existence is not leaked.
- The authorization matrix test (section 13.4) runs against Neon: user B must get nothing from user A's resources on every route.
- Row Level Security is a planned phase 2 (`app.user_id`). It is not enabled without the owner's approval. If enabled later, note that session settings do not survive transaction-mode pooling unless set per transaction (`SET LOCAL`), so it must be designed for the pooled URL.

### 8.3 Injection and input safety

- Use Prisma's parameterized API. If raw SQL is unavoidable, use parameterized `$queryRaw` tagged templates. Never build SQL by string concatenation or `$queryRawUnsafe` with user input.
- All user input passes Zod before reaching a repository. Mirror critical limits in the database (lengths, ranges).
- JSON documents are validated with Zod on write and on read from untrusted sources. Cap the payload size.

### 8.4 Secrets and data exposure

- No secrets in the repository, logs, error messages or API responses.
- Errors returned to clients carry a safe code and the prototype's copy, never SQL text, table names or stack traces.
- No personal data in logs or in `AuditLog.metadata` (store IDs and action types, not names, emails, scores or text bodies).

---

## 9. CONSISTENCY, TRANSACTIONS AND CONCURRENCY

### 9.1 Transactions

- A business operation that writes more than one row is one transaction: subject create with children, ingest confirm (subject tree + outcomes + links), replace-subject with score copy (architecture 7.4), subject delete with dependents, account deletion.
- Keep transactions short. No network calls (Blob, Clerk, email) and no user waits inside a transaction.
- Use the interactive transaction with an explicit timeout, and handle the failure path so partial work never commits.
- Default isolation is `READ COMMITTED`. Use a stronger level or an explicit row lock (`SELECT ... FOR UPDATE`) only where a documented race exists, and write the reason down.
- Acquire locks in a consistent order (parent before child, ascending ID) to avoid deadlocks. Retry on serialization failure and deadlock (`40001`, `40P01`) with a small bounded retry.
- Do not rely on session-level features (advisory locks, temp tables, `SET` without `LOCAL`) through the pooled URL. Neon's pooler runs in transaction mode.

### 9.2 Optimistic concurrency (Score)

- `Score.version` increments on every update. An update states the version it read:
  ```sql
  UPDATE "Score"
     SET "value" = $1, "version" = "version" + 1, "updatedAt" = now()
   WHERE "id" = $2 AND "version" = $3 AND <ownership condition>;
  -- 0 rows affected => conflict; the service returns the Conflict result (prototype state)
  ```
- A conflict is a normal **result** (the prototype has a Conflict state with a Reload path), not an exception.
- Batch score upserts are one transaction. If any row conflicts, the response names which rows, and nothing partial is committed unless the architecture says otherwise.

### 9.3 Idempotency

- Create, replace and ingest endpoints require an `Idempotency-Key` header.
- Flow: look up `(userId, key, route)`. If found and `requestHash` matches, return the stored response. If found and the hash differs, reject (conflict). If not found, execute the operation and store the response in the **same transaction** as the write, so a crash cannot leave a done operation without a stored response (or the reverse).
- Rows expire after 24 hours (`purge-idempotency`).
- Concurrent requests with the same key are serialized by the unique constraint. Handle the unique violation by re-reading the stored response.

### 9.4 Audit

- Every mutating route writes an `AuditLog` row in the same transaction as the change. Insert-only (section 8.1). Metadata holds IDs and action codes only.

### 9.5 Drift and integrity checks

- CI runs `prisma migrate diff` against the target Neon branch, and a script that confirms the raw SQL objects exist (partial unique indexes, CHECKs, role grants) by querying `pg_indexes`, `pg_constraint` and `information_schema.role_table_grants`. A missing object fails the build.

---

## 10. QUERY AND ACCESS-LAYER STANDARDS

- All database access goes through **repositories** (interface in `data/repositories`, Prisma implementation behind it). No Prisma calls in components, route handlers' business logic, or the UI. Services call repositories. Follow `stack-code-standards.md` section 4.
- Repositories return domain models and typed results, never raw Prisma rows. Expected failures (not found, conflict, duplicate, cap reached) are values, unexpected failures throw typed errors.
- `select` only the columns needed. Never `SELECT *` into the UI layer. Never return internal columns (`version`, `userId`) unless the API contract needs them.
- No N+1: load related data with a single query using relations (`include`/`select`) or a join, and verify with query logging in `develop`.
- **Pagination** on every list that can grow: cursor-based using an indexed, unique ordering (`(createdAt, id)`). Offset pagination only for small bounded sets. Every list has a maximum page size.
- Deterministic ordering: every list query has an `ORDER BY` that ends in a unique column.
- Bulk work uses batch statements (`createMany`, `updateMany`, single `INSERT ... ON CONFLICT`) in chunks, not loops of single statements.
- Upserts use `ON CONFLICT` on a real unique constraint. Never read-then-write for uniqueness.
- Queries run with a statement timeout set on the runtime role. Long reports and exports are streamed or chunked, not loaded in memory.
- Raw SQL is rare, lives in the repository file that needs it, is parameterized, and has a comment explaining why Prisma was not enough.

---

## 11. JSON COLUMNS

- Allowed only for document-shaped data that is read and written as a whole: `Subject.grading`, `policies`, `faculty`, `IngestJob.result`. Anything you filter, join, sort or constrain on becomes real columns.
- Every JSON column has: a Zod schema in `lib/validation/*`, a **maximum size** (checked in Zod and with a CHECK on `octet_length(col::text)` or `pg_column_size`), a documented shape in the data dictionary, and a `schemaVersion` field if its shape may change.
- Validate on write, and validate (or parse with a safe default) on read when the data came from ingest or an older version.
- Never store secrets or personal data beyond what the product needs inside JSON.

---

## 12. SEED AND REFERENCE DATA

- Seed only reference data: `GradeScale` bands and `GradeScaleMeta`. Seeds are idempotent (safe to run twice) and run through a controlled command, never automatically in the app.
- `GradeScaleMeta.confirmed` is set only on the owner's confirmation. The calculator stays blocked until it is true (release gate).
- No fake or demo users in `main`. Test fixtures live in `develop` or throwaway branches only.
- Seed data is versioned in the repository and reviewed like code.

---

## 13. TESTING AND VERIFICATION

No test runner is approved yet (decision 10 in `database-constructore.md`). Until the owner chooses one, verify with SQL scripts and typed Node scripts against a real Neon branch, and record the output in the verification log. Once approved, the same checks become automated tests.

### 13.1 Every migration

- Applies from an empty branch and from the current state.
- `prisma migrate diff` shows no drift.
- Constraints and indexes exist (`pg_constraint`, `pg_indexes`).
- Rollback was rehearsed or the restore path was confirmed.

### 13.2 Every constraint

- A failing INSERT or UPDATE is run and rejected with the expected error. A constraint that was never proven to reject bad data is not verified.

### 13.3 Every repository and service

- Happy path, validation failure, not found, duplicate, cap reached, conflict, and rollback of a failed multi-row operation.

### 13.4 Authorization matrix

- For every route and every owned resource: user B receives not found for user A's data, for read, update, delete and list. Generate the matrix from the route list so new routes cannot be forgotten.

### 13.5 Concurrency

- Two simultaneous score updates: exactly one wins, the other gets Conflict.
- Two simultaneous creates with the same Idempotency-Key: one write, both get the same response.
- Two simultaneous creates of the same active subject code: the partial unique index rejects the second.

### 13.6 Jobs

- Each purge job is run against fixtures with old and fresh rows and blobs: old data removed, fresh data untouched, a second run changes nothing (idempotent).

### 13.7 Performance and scale

- Load test with realistic volumes (growth projections from the architecture document) in a scratch branch. Review slow queries, plans, connection counts and pool behavior. Record results.

### 13.8 Privacy

- Account deletion removes every owned row (verify by counting rows in every table before and after), and the export path returns everything and only the user's data.

---

## 14. DATA LIFECYCLE, PRIVACY AND RETENTION

| Data | Retention | Mechanism |
| --- | --- | --- |
| Archived subjects | 30 days, then hard delete with all children | `purge-archived` (daily) |
| Ingest job `result` JSON | 24 hours | `purge-ingest` (hourly), also removes orphan blobs |
| Syllabus PDF in Blob | Transient. Deleted after processing or on expiry | Blob delete + `sweep-orphan-blobs` (hourly) |
| Drafts | 7 days (`expiresAt`) | `purge-drafts` (daily) |
| Idempotency keys | 24 hours | `purge-idempotency` (hourly) |
| Activity events | Period set by the owner (decision 5) | `purge-activity` (optional) |
| Audit log | Per the owner's policy. Never edited or deleted by the runtime role | Manual, privileged, logged |
| Everything owned by a user | Deleted on account deletion | `ON DELETE CASCADE` from `User`, driven by the Clerk webhook |

- Treat grades, course data and notes as **personal data** under the Philippine Data Privacy Act (Republic Act 10173): collect only what the product needs, use it only for the stated purpose, keep it only as long as needed, protect it, and honor access and deletion requests. Consent is recorded (`consentAt`) where the product requires it.
- Purge jobs use the pooled URL, delete in bounded batches, are idempotent, and alert on failure. Migrations never run inside job workers.
- Blob storage never holds long-term structured data (invariant I2). Neon is the system of record.

---

## 15. SERVERLESS, POOLING AND PERFORMANCE ON NEON

- Runtime uses the **pooled** connection string (PgBouncer, transaction mode). Use the Prisma settings documented for pooled connections in the installed version. Migrations and admin tools use the **direct** string.
- Keep the Prisma client a singleton per runtime instance, with a small connection limit per instance so many serverless instances cannot exhaust the pool.
- Avoid session state (advisory locks, `SET` without `LOCAL`, temp tables, `LISTEN/NOTIFY`) on the pooled URL.
- Design for cold starts: the first query after autosuspend is slower. Health checks and user-facing screens show loading states (the prototype has them). Decide the production autosuspend policy on cost and latency evidence.
- Keep transactions short and indexes tight. Watch connection count, compute, storage growth and slow queries in the Neon dashboard.
- Performance budgets are recorded per key query (for example list subjects, load subject modules, calculator inputs) and checked in the verification log. Optimize only with measured evidence.

---

## 16. BACKUP, RECOVERY AND OPERATIONS

- **PITR retention** on `main` is at least 7 days (or the longest the plan allows) and is a recorded setting.
- **Restore drills** are performed and dated: restore to a point in time into a new branch, verify row counts and constraints, record the time taken. Quarterly. `Last drill: ____` is kept in the tracker.
- **Rollback plan** for every production release: previous app release + Neon PITR to the pre-migration point, with who runs it and how.
- **Runbook** in `docs/database/`: apply a migration, roll back, restore from PITR, rotate credentials, run and monitor purge jobs, handle a failed job, handle a connection exhaustion incident.
- **Monitoring and alerts:** migration failure, job failure, disk or storage growth, connection saturation, slow queries, error rate on database errors.
- **Incident handling:** record what happened, the impact, the fix and the prevention in the tracker's drift and blockers section.
- Production data is never copied to a developer machine or to the local Docker database. If a copy is ever required, it is anonymized and approved by the owner.

---

## 17. DOCUMENTATION STANDARDS

Maintained in `docs/database/` and updated **in the same piece** that changes the schema:

| Document | Content |
| --- | --- |
| ERD (Mermaid) | All tables, keys, relations, cardinalities |
| Data dictionary | Every table and column: type, nullability, default, meaning, constraints, the index and the query that justifies it, retention, PII flag, JSON shape |
| Constraint and index register | Name, table, definition, the rule it enforces, where it is created (Prisma or raw SQL) |
| Migration changelog | Name, date, what changed, risk, rollback |
| Runbook | Operational procedures (section 16) |
| Decision log | `DBDEC-nnn` entries in `database-tracker.md` |

Documentation that disagrees with the database is a defect. The drift check covers the schema, and a human review covers the documents.

---

## 18. CODE REVIEW CHECKLIST (EVERY DATABASE CHANGE)

- [ ] Matches a tracker item and the architecture. No scope creep
- [ ] Constraints enforce every rule that must always hold
- [ ] Every FK has an `ON DELETE` rule and an index
- [ ] Types are correct (`timestamptz`, `numeric`, bounded text, enum or CHECK)
- [ ] Nullability is deliberate and documented
- [ ] Indexes are justified by a real query, plans checked with `EXPLAIN (ANALYZE, BUFFERS)`
- [ ] Migration is small, forward-only, read line by line, with a rollback plan
- [ ] Safe change pattern used (expand then contract, `NOT VALID` then `VALIDATE`, `CONCURRENTLY`)
- [ ] Rehearsed on `develop`, no drift
- [ ] Ownership filter on every query, authorization tests pass
- [ ] Multi-row operations are transactions, conflicts are results
- [ ] Idempotency and audit handled where required
- [ ] Zod schema mirrors the database limits, JSON has size cap and schema
- [ ] No derived data stored, no personal data logged
- [ ] No secrets anywhere. No `main` write without approval
- [ ] Data dictionary, ERD and tracker updated

---

## 19. BANNED PRACTICES

| Banned | Why |
| --- | --- |
| Writes, migrations, seeds or purges on `main` without explicit approval | Protects production data |
| Editing an applied migration | Breaks history and environments |
| Plain column rename or drop on a live table | Breaks running code. Use expand and contract |
| `float` for scores or grades | Rounding errors |
| `timestamp` without time zone | Time bugs |
| Storing derived values (averages, results) | Drift from source data (I8) |
| Id-only reads or writes for owned data | Cross-tenant leaks |
| `$queryRawUnsafe` or string-built SQL with user input | SQL injection |
| `SELECT *` into the UI layer, N+1 queries, unbounded lists | Leaks and slow pages |
| Network calls inside a transaction | Long locks and timeouts |
| Session features through the pooled URL | Break under transaction pooling |
| Running migrations from the app or job workers | Unsafe and unreviewed |
| Speculative indexes | Write cost without benefit |
| Secrets in files, logs or chat | Credential exposure |
| Personal data in logs or audit metadata | Privacy breach |
| `npm audit fix` | Project rule (Prisma 8 RC) |
| Adding databases, extensions, ORMs or test tools without approval | Stack is fixed |
| Marking work done without evidence | Honesty rule |

---

## 20. DEFINITION OF DONE (PER DATABASE PIECE)

- [ ] Tracker items addressed, checkboxes ticked only after verification on the Neon branch that will ship
- [ ] Prisma contract and any raw SQL updated, migration generated and read line by line
- [ ] Migration applies from empty and from current state, `prisma migrate diff` clean
- [ ] Every new constraint rejected bad data in a recorded test
- [ ] Indexes justified, plans recorded
- [ ] Authorization and concurrency checks recorded where relevant
- [ ] Repository, service, Zod schema and API follow `stack-code-standards.md`
- [ ] Lint, build and type check pass in `goldensync-web/`
- [ ] Data dictionary, ERD and changelog updated
- [ ] Rollback plan written
- [ ] BUILD LEDGER, DECISION LOG, VERIFICATION LOG and CURRENT STATE updated in `database-tracker.md`
- [ ] No secret exposed, nothing written to `main` without approval

---

## 21. DEVIATIONS

If a standard here cannot be followed, do not bend it silently. Record a `DBDEC` in `database-tracker.md` with the standard, the reason, the alternative, the risk and the owner's approval. The checker treats an unrecorded deviation as a finding.

_GoldenSync Database Standards v1.0 · works with `database-tracker.md`, `database-constructore.md`, `stack-code-standards.md` and the architecture document `system-architecture.md`_
