# Data dictionary (skeleton)

**Piece:** DB-001 — fill column-level detail as each model is built (D2–D5).  
**PII:** treat email, name, course titles, notes bodies, scores as personal / sensitive under PH Data Privacy Act. Never put them in `AuditLog.metadata` or logs.

Legend: **Ret** = retention · **PII** = Y/N · **Null** = why nullable

---

## Existing (contract)

### User
| Column | Type | Null | Constraints | Meaning | Ret | PII |
| ------ | ---- | ---- | ----------- | ------- | --- | --- |
| id | cuid | N | PK | Opaque id | Account life | N |
| clerkUserId | text | N | UNIQUE | Clerk subject | Account life | N |
| email | text | N | | Login email | Account life | **Y** |
| name | text | Y | | Display name | Account life | **Y** |
| consentAt | timestamptz | Y | | Consent timestamp | Account life | N |
| createdAt / updatedAt | timestamptz | N | | Audit | Account life | N |

### Semester
| Column | Type | Null | Constraints | Meaning | Ret | PII |
| ------ | ---- | ---- | ----------- | ------- | --- | --- |
| id | cuid | N | PK | | With user | N |
| userId | cuid | N | FK CASCADE | Owner | | N |
| label | text | N | Zod max 80 | Display label | | Y (course context) |
| startDate / endDate | timestamptz/date | N | CHECK end>start (todo) | Term bounds | | N |
| skippedWeeks | Json | N | Zod array | Weeks skipped | | N |

### Subject
| Column | Type | Null | Constraints | Meaning | Ret | PII |
| ------ | ---- | ---- | ----------- | ------- | --- | --- |
| id | cuid | N | PK | | Soft archive 30d then purge | N |
| semesterId | cuid | N | FK CASCADE | | | N |
| courseCode / courseCodeNorm | text | N | Partial unique active (todo) | Code | | Y |
| title | text | N | | Title | | Y |
| units | Decimal | N | | Units | | N |
| prerequisite / effectivity | text | Y | Optional fields | Spec | | Y |
| grading / policies / faculty | Json | Y | Zod todo | Module blobs | | Y |
| archivedAt | timestamptz | Y | Soft archive | Null = active | 30d after archive | N |

### Outcome / PlanWeek / Assessment / AssessmentOutcome / Score / ChecklistItem / IngestJob / Draft / AuditLog / GradeScale*
See `prisma/contract.prisma`. Gaps called out in `gap-report.md`. Expand rows when D2/D3 close.

---

## Target (to add)

### OutcomeLink
| Column | Type | Null | ON DELETE | Notes |
| ------ | ---- | ---- | --------- | ----- |
| id | cuid | N | | PK |
| coId | cuid | N | CASCADE Outcome | Must be kind=CO (service) |
| poId | cuid | N | CASCADE Outcome | Must be kind=PO (service) |
| level | enum I\|E\|D | N | | Decision #2 uniqueness |

### IdempotencyKey
| Column | Type | Null | Notes |
| ------ | ---- | ---- | ----- |
| userId, key, route | | N | UNIQUE triple |
| requestHash | text | N | Reject mismatch |
| responseStatus / responseBody | | N | Replay |
| createdAt | timestamptz | N | Purge 24h |

### PlanNote
| Column | Type | Null | Notes |
| ------ | ---- | ---- | ----- |
| subjectId | cuid | N | CASCADE |
| title, topic, body | text | topic Y | Zod caps |
| importance | int | N | CHECK 1–3 |
| pinned | boolean | N | DEFAULT false; ≤3 service |
| archivedAt / savedAt | timestamptz | archived Y | |

### ManualChecklistItem
| Column | Type | Null | Notes |
| ------ | ---- | ---- | ----- |
| subjectId | cuid | N | CASCADE; **no** score FKs (I14) |
| title, detail | text | detail Y | |
| done | boolean | N | DEFAULT false |
| position | int | N | Order |

### ActivityEvent
| Column | Type | Null | Notes |
| ------ | ---- | ---- | ----- |
| userId | cuid | N | CASCADE |
| kind | text/enum | N | Decision #5 |
| title, detail | text | N | No raw scores in detail if avoidable |
| readAt | timestamptz | Y | Null = unread |
| createdAt | timestamptz | N | Retention decision #5 |

---

## Derived (never stored — I8)

Outcome %, semester average, letter grade from scale, checklist progress % — compute at read time.
