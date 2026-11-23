# D0 — Decisions the owner must make (before / during build)

**Piece:** DB-001 → applied under owner override 2026-11-21 (“do it… everything is specified” = adopt recommendations).

| # | Topic | Options | Recommendation | Your answer |
| - | ----- | ------- | -------------- | ----------- |
| 1 | **PlanWeek shape** | **A** keep `weekNumber` + `topic` + `notes` (current UI) · **B** add `weekFrom`/`weekTo`/`outcomeId?`/`activitiesText` + CHECK | **A** for speed; schedule B only if Plan UI needs ranges | **A** (DBDEC-001) |
| 2 | **OutcomeLink cardinality** | One `level` per `(coId, poId)` · allow multiple rows | **One** level per pair + UNIQUE | **One** (DBDEC-002) |
| 3 | **`Semester.skippedWeeks`** | Native `Int[]` · keep Json + Zod | **Json + Zod** now (less migration risk); Int[] later if needed | **Json + Zod** (DBDEC-003) |
| 4 | **`User.theme`** | Sync in Neon · keep `gs-theme` client-only | **Client-only** (document N/A); sync only if multi-device theme is required | **Client-only** (DBDEC-004) |
| 5 | **`ActivityEvent.kind` + retention** | Postgres enum · constrained text; retention 30 / 90 / 365 days | **Constrained text** + **90 days** purge | **Text + 90d** (DBDEC-005) |
| 6 | **PlanNote pin ≤3** | Service-only · service + DB trigger/guard | **Service-only** first; add DB guard if abuse appears | **Service-only** (DBDEC-006) |
| 7 | **Prisma version** | Stay on Prisma 8 RC · pin Prisma 7.x stable | **Stay 8** if CI green; else record N-02 risk and discuss | **Stay 8** (DBDEC-007) |
| 8 | **localStorage import** | Signed-in “Import local data” tool · document “demo data will not sync” | **Document no sync** for MVP cutover; import tool optional later | **No sync** (DBDEC-008) |
| 9 | **RLS phase 2** | Enable now · later | **Later** (app-layer ownership first) | **Later** (DBDEC-009) |
| 10 | **Integration test runner** | Vitest + Neon `develop` · other | **Vitest + Neon develop** (matches architecture §16) | **Vitest + Neon** (DBDEC-010) |

Logged in `database-tracker.md` §14.
