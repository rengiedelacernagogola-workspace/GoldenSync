# Target ERD (Neon) — after D4/D5 models land

**Piece:** DB-001 (D0)  
**Note:** Target schema including architecture + product tables. PlanWeek drawn as **Option A** (current); Option B would add `weekFrom`/`weekTo`/`outcomeId`/`activitiesText`.

**pgAdmin (deferred 2026-11-23):** Generate ERD from a **live Neon connection**, not from a `.sql` dump. Connection steps + dump paths → `docs/NEXT-SESSION.md`. Mermaid below remains the in-repo ERD until a pgAdmin export is added.

```mermaid
erDiagram
  USER ||--o{ SEMESTER : owns
  USER ||--o{ INGEST_JOB : starts
  USER ||--o{ DRAFT : saves
  USER ||--o{ IDEMPOTENCY_KEY : uses
  USER ||--o{ AUDIT_LOG : generates
  USER ||--o{ ACTIVITY_EVENT : receives

  SEMESTER ||--o{ SUBJECT : contains

  SUBJECT ||--o{ OUTCOME : has
  SUBJECT ||--o{ PLAN_WEEK : schedules
  SUBJECT ||--o{ PLAN_NOTE : notes
  SUBJECT ||--o{ ASSESSMENT : grades
  SUBJECT ||--o{ CHECKLIST_ITEM : week_ticks
  SUBJECT ||--o{ MANUAL_CHECKLIST_ITEM : freeform

  OUTCOME ||--o{ OUTCOME_LINK_AS_CO : co
  OUTCOME ||--o{ OUTCOME_LINK_AS_PO : po
  OUTCOME ||--o{ ASSESSMENT_OUTCOME : mapped

  ASSESSMENT ||--o| SCORE : records
  ASSESSMENT ||--o{ ASSESSMENT_OUTCOME : links

  GRADE_SCALE_META ||--o{ GRADE_SCALE : bands

  USER {
    string id PK
    string clerkUserId UK
    string email
    string name
    timestamptz consentAt
    string theme "optional decision"
  }

  SEMESTER {
    string id PK
    string userId FK
    string label
    date startDate
    date endDate
    json_or_int_array skippedWeeks
  }

  SUBJECT {
    string id PK
    string semesterId FK
    string courseCode
    string courseCodeNorm
    string title
    decimal units
    timestamptz archivedAt
    jsonb grading
    jsonb policies
    jsonb faculty
  }

  OUTCOME {
    string id PK
    string subjectId FK
    enum kind
    string code
    string description
    int position
  }

  OUTCOME_LINK {
    string id PK
    string coId FK
    string poId FK
    enum level
  }

  PLAN_WEEK {
    string id PK
    string subjectId FK
    int weekNumber
    string topic
    string notes
  }

  PLAN_NOTE {
    string id PK
    string subjectId FK
    string title
    string topic
    text body
    int importance
    boolean pinned
    timestamptz archivedAt
    timestamptz savedAt
  }

  CHECKLIST_ITEM {
    string id PK
    string subjectId FK
    int weekNumber
    boolean done
  }

  MANUAL_CHECKLIST_ITEM {
    string id PK
    string subjectId FK
    string title
    string detail
    boolean done
    int position
  }

  ASSESSMENT {
    string id PK
    string subjectId FK
    string label
    decimal maxScore
    int position
  }

  SCORE {
    string id PK
    string assessmentId UK
    decimal score
    decimal max
    int version
  }

  ACTIVITY_EVENT {
    string id PK
    string userId FK
    string kind
    string title
    string detail
    timestamptz readAt
    timestamptz createdAt
  }

  IDEMPOTENCY_KEY {
    string id PK
    string userId FK
    string key
    string route
    string requestHash
    int responseStatus
    jsonb responseBody
  }

  INGEST_JOB {
    string id PK
    string userId FK
    enum status
    string blobPathname
    jsonb result
  }

  DRAFT {
    string id PK
    string userId FK
    string kind
    jsonb payload
    timestamptz expiresAt
  }

  AUDIT_LOG {
    string id PK
    string userId
    string action
    string entity
    jsonb metadata
  }
```

**Delete rules (owned children):** CASCADE from User / Semester / Subject so account and subject deletion leave no orphans.  
**Blob:** not in ERD — only `IngestJob.blobPathname` references transient Vercel Blob objects.
