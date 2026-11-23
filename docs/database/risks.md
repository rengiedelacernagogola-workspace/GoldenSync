# D0 — Risk register

**Piece:** DB-001 · Update as risks open/close in tracker §17.

| ID | Risk | Impact | Likelihood | Mitigation |
| -- | ---- | ------ | ---------- | ---------- |
| R01 | Neon `main` migrated/seeded by mistake | Data loss / downtime | Med if process weak | S1: owner approval only; work on `develop` |
| R02 | Secrets committed or pasted in chat | Account compromise | Med | Never print URLs; rotate immediately |
| R03 | Partial unique blocked by duplicate active codes | Migration fails | Low–Med | Audit duplicates before index; resolve with owner |
| R04 | localStorage cutover loses user notes | User trust | High if users already save notes | Decision #8; optional import; dual-read window |
| R05 | Prisma 8 RC behavior change | Broken migrates / client | Med | N-02 decision; pin version; CI migrate diff |
| R06 | Pooled URL used for migrations / session features | Failed DDL / weird bugs | Med | DIRECT_URL for migrate only; no advisory locks on pool |
| R07 | Outcome map stays seed-only after Neon | Wrong academic mapping | High until D4+D6 | Ship OutcomeLink + ingest/UI wiring together |
| R08 | Empty GradeScale opens Calculator incorrectly | Wrong grades | Med | Seed + `confirmed` gate before enabling UI |
| R09 | Missing IdempotencyKey → double subject create | Duplicate data | Med | D4 before public ingest traffic |
| R10 | Purge jobs delete too aggressively | Data loss | Med | Fixtures on throwaway branch; dry-run flags |
| R11 | Cross-tenant leak via id-only queries | Privacy / DPA | Med | AuthZ matrix on Neon; no id-only repos |
| R12 | Autosuspend cold start latency | Bad UX | Med | Keep-warm decision recorded; timeouts tuned |
| R13 | Json grading/policies/faculty unbounded | Storage abuse | Med | Zod size caps + optional length CHECK |
| R14 | Manual checklist accidentally linked to scores | I14 break | Low if separate table | No FKs to Assessment/Score |

**Highest priority to clear before D9 cutover:** R01, R02, R04, R07, R08, R11.
