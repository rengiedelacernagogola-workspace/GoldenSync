# D0 — Index and constraint plan

**Piece:** DB-001  
**Rule:** Every index justified by a real app query. Partial uniques / CHECKs via raw SQL when Prisma cannot express them.

---

## 1. Constraints to add (Neon `develop` first)

| Name | Table | Definition | Why |
| ---- | ----- | ---------- | --- |
| `subject_active_code_per_semester` | Subject | `UNIQUE (semesterId, courseCodeNorm) WHERE archivedAt IS NULL` | Arch §7.3; retake after archive |
| `Outcome_subjectId_kind_code_key` | Outcome | `UNIQUE (subjectId, kind, code)` | No duplicate codes |
| `score_bounds_chk` | Score | `max > 0 AND max <= 10000 AND (score IS NULL OR (score >= 0 AND score <= max))` | Arch §7.3 |
| `semester_dates_chk` | Semester | `endDate > startDate` | Arch §7.2 |
| `OutcomeLink_coId_poId_key` | OutcomeLink | `UNIQUE (coId, poId)` | One level per pair **if** decision #2 = one |
| `PlanNote_importance_chk` | PlanNote | `importance BETWEEN 1 AND 3` | Product |
| `IdempotencyKey_userId_key_route_key` | IdempotencyKey | `UNIQUE (userId, key, route)` | Arch §5.4 |
| AuditLog privileges | AuditLog | REVOKE UPDATE/DELETE/TRUNCATE FROM `app_runtime` | Arch §7.3 |

**Pin ≤3:** service transaction (decision #6 may add DB guard later).

---

## 2. Indexes to keep (already present)

| Index | Query |
| ----- | ----- |
| `Semester_userId_idx` | List semesters for user |
| `Subject_semesterId_idx` | List subjects in semester |
| `Outcome_subjectId_idx` | List outcomes |
| `PlanWeek_subjectId_idx` + unique week | Plan module |
| `ChecklistItem_subjectId_idx` + unique week | Checklist + dashboard ring |
| `Assessment_subjectId_idx` | Grading |
| `AssessmentOutcome_outcomeId_idx` | Derived outcome |
| `IngestJob_userId_createdAt_idx` | Ingest poll + rate limit |
| `Draft_userId_idx` + unique kind | Autosave |
| `AuditLog_userId_createdAt_idx` | Audit browse |
| `GradeScale_position_idx` | Calculator bands |
| `Score_assessmentId_key` | 1:1 score |

---

## 3. Indexes to add with new models

| Index | Query |
| ----- | ----- |
| `Subject (semesterId, archivedAt)` | Dashboard / list active subjects |
| `OutcomeLink (coId)`, `(poId)` | Map + join |
| `PlanNote (subjectId, savedAt DESC)` | All notes list |
| `PlanNote (subjectId) WHERE pinned AND archivedAt IS NULL` | Pin list (optional partial) |
| `ManualChecklistItem (subjectId, position)` | My checklist order |
| `ActivityEvent (userId, createdAt DESC)` | Notifications dropdown |
| `IdempotencyKey (userId, createdAt)` | Purge older than 24h |
| `IngestJob (createdAt)` | Purge by age (optional) |

---

## 4. Access-path verification (after D2+)

For each new index, on Neon `develop` with realistic volume:

```sql
EXPLAIN (ANALYZE, BUFFERS)
-- paste the app query
;
```

Record plan summary in tracker §16. Reject sequential scans on large tables without justification.
