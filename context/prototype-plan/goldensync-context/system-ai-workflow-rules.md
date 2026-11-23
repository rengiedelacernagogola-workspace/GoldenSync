# GOLDENSYNC — SYSTEM & AI WORKFLOW RULES

> Cursor must read this entire file before writing any logic,
> API route, hook, store, service, or backend function.
> Every rule is derived directly from the system flowchart.
> No assumptions. No shortcuts. No approximations.

---

## 0. PRIME DIRECTIVE

Every decision, branch, validation, error message, and state
transition in this codebase must map 1-to-1 to the flowchart.
If the flowchart says "do not reveal which field was wrong" —
the code does not reveal it. If the flowchart says "roll back" —
the code rolls back atomically. The flowchart is law.

A senior software engineer reviewing this code must not be able
to tell it was AI-generated. That means:

- No over-engineered abstractions
- No under-engineered shortcuts
- No TODO comments
- No placeholder logic
- Every edge case handled explicitly
- Every error message exact to the spec

---

## 1. SYSTEM OVERVIEW

```
System:      GoldenSync
University:  Caraga State University — CCIS
Purpose:     Instructor tracks 8–10 subjects per semester,
             monitors student performance, manages syllabi.
Syllabus:    F-CID-009, Rev. 3 (ITE 14 is the sample data)
Users:       Instructor (full access) | Student (read-only)
Auth domain: @carsu.edu.ph only
```

---

## 2. PROJECT STRUCTURE RULES

```
src/
  app/                          Next.js App Router
    (auth)/
      login/
      register/
    (dashboard)/
      layout.tsx                Shell: sidebar + topbar
      dashboard/
      subjects/
      performance/
      course-specification/
      peo-po-co/
      learning-plan/
      grading/
      policies/
      faculty/
    api/
      auth/
        login/route.ts
        register/route.ts
        logout/route.ts
        session/route.ts
      syllabus/
        sync/route.ts           PDF ingest pipeline
        manual/route.ts         Manual entry
        [id]/route.ts           CRUD per syllabus
        export/route.ts         PDF export
      subjects/route.ts
      performance/
        scores/route.ts
        grade/route.ts          Grade computation
      topics/route.ts           Checklist updates

  lib/
    auth/
      session.ts                Session token management
      validation.ts             Email + password rules
    syllabus/
      parser.ts                 F-CID-009 field parser
      validator.ts              Required field checker
      flags.ts                  Data quality flags
    scoring/
      algorithm.ts              Grade computation engine
      gradeMap.ts               Average → 1.0–3.0 scale
    db/
      schema.ts                 All table definitions
      queries/                  One file per entity
    utils/
      errors.ts                 Error class definitions
      messages.ts               ALL user-facing strings
      constants.ts              Thresholds, limits, enums

  types/
    auth.types.ts
    syllabus.types.ts
    subject.types.ts
    performance.types.ts
    session.types.ts

  stores/
    auth.store.ts
    syllabus.store.ts
    subject.store.ts
    performance.store.ts
    ui.store.ts
```

**File rules:**

```
✅ One responsibility per file
✅ Max 200 lines per file — split if larger
✅ Named exports only — no default exports
   (except Next.js page.tsx files)
✅ All user-facing strings in lib/utils/messages.ts
   Never hardcode a message string in a component
✅ All magic numbers in lib/utils/constants.ts
✅ All types in types/ — no inline type definitions
   in component files
❌ No business logic in components
❌ No API calls in components — use hooks
❌ No direct db access outside lib/db/queries/
```

---

## 3. AUTHENTICATION SYSTEM

### 3.1 Login Flow

```
Entry point: /login
  Fields: ID Number, Password (both required)

Step 1 — Client validation (before API call):
  - Both fields must be non-empty
  - Show inline error on empty submit
  - Do NOT validate format client-side
    (server is the authority)

Step 2 — API call: POST /api/auth/login
  - Body: { idNumber: string, password: string }

Step 3 — Server validation:
  a. Validate email format: must be @carsu.edu.ph
     → If invalid: return generic failure (do NOT say
       "invalid email format" — just return auth failed)
  b. Look up user by email in database
  c. Compare bcrypt hash of submitted password
     against stored hash
  d. Check account status (active, not suspended)

Step 4 — Decision: credentials accepted?
  → YES:
    - Generate session token (httpOnly cookie,
      SameSite=Strict, Secure)
    - Store session: userId, role, createdAt, expiresAt
    - Set expiry: 30 minutes from now
    - Redirect to /dashboard
  → NO:
    - Return HTTP 401
    - Response body: { success: false }
    - Display exact message:
      "System Error: Account Log In Failed."
    - Trigger shake animation on form
    - Do NOT indicate which field was wrong
    - Do NOT indicate whether the account exists

Brute force protection:
  - Track failed attempts per IP per 15 minutes
  - After 5 failures: return same error but add
    30-second lockout (no lockout message —
    just slow the response)
```

### 3.2 Registration Flow

```
Entry point: /register
  Fields: CSU Email, Password, Confirm Password
  Constant heading: "Creating Account"
  Footer constants (always visible):
    "Thank you for choosing GoldenSync, Golden CSUan."
    "All rights reserved by Team Gogola."

Step 1 — Client validation:
  - Email: non-empty, valid email format
  - Password: minimum 8 characters
  - Confirm Password: must match Password
  - Show field-level errors on blur

Step 2 — API call: POST /api/auth/register
  - Body: { email: string, password: string }

Step 3 — Server validation:
  a. Validate @carsu.edu.ph domain
  b. Check password minimum length (8 chars)
  c. Check for duplicate email in database
     → If duplicate: DO NOT reveal it exists
       Return the same generic failure response

Step 4 — Decision: registration data valid?
  → YES:
    - Hash password with bcrypt (salt rounds: 12)
    - Store user record
    - Do NOT auto-login — redirect to /login
    - Show toast: "Account created. Please log in."
    - Display exact message:
      "Successful Log In CSUan"
  → NO:
    - Return HTTP 400
    - Display exact message:
      "Account could not be created."
      "Check the email and password."
    - Show "Try Again" button
    - Return to registration form
    - Do NOT say if the email already exists
```

### 3.3 Session Management

```
Session token:
  - Type: JWT or opaque token (server-validated)
  - Storage: httpOnly cookie only
    (Never localStorage, never sessionStorage)
  - Expiry: 30 minutes from last activity
  - Refresh: sliding window — reset timer on
    every authenticated request

Idle detection:
  - Track last activity timestamp on server
  - On every API request: check if session is expired
  - On /dashboard: poll every 5 minutes to refresh
  - If expired: clear token + redirect to /login
  - Display: no warning popup — silent redirect
  - Same code path as manual logout

Logout:
  Trigger: "Sign Out" button in sidebar
  Step 1: Confirm dialog:
    "Are you sure you want to sign out?"
    [Sign Out] [Cancel]
  Step 2 on confirm:
    - DELETE /api/auth/logout
    - Server clears session token from database
    - Clear httpOnly cookie
    - Redirect to /login
  Step 3: /login screen loads fresh
    - Authentication rules unchanged
    - No "logged out" message shown
```

### 3.4 Role-Based Access Control

```
Roles:
  INSTRUCTOR — full access to all features
  STUDENT    — read-only access, cannot upload
               or overwrite a syllabus

Role check: performed server-side on every
  protected API route. Never trust the client.

Access matrix:
  Feature                    Instructor   Student
  ─────────────────────────────────────────────
  View all modules           ✅           ✅
  Sync Syllabus (PDF)        ✅           ❌
  Manual Upload Syllabus     ✅           ❌
  Overwrite stored syllabus  ✅           ❌
  Enter CO scores            ✅           ✅
  Update topic checklist     ✅           ✅ (own only)
  Export syllabus            ✅           ✅

Student attempts to upload:
  - Block at API level (HTTP 403)
  - UI: hide upload buttons, show read-only state
  - Message: "Students cannot upload or overwrite
    a syllabus. Continue to scores or modules."
  - Continue to: scores entry or read-only modules

RULE: Role check happens at the API route.
  The UI hiding buttons is a convenience only.
  Every destructive action is blocked server-side.
```

---

## 4. SYLLABUS SYNC (PDF INGEST) PIPELINE

### 4.1 File Validation

```
Trigger: User selects or drops a file on the dropzone

Accepted file rules (validate in this order):
  1. File type: application/pdf only
     → Reject anything else
  2. File size: maximum 10 MB
     → Reject if larger
  3. File not empty: size > 0 bytes
     → Reject if empty
  4. Not encrypted: attempt to read first page
     → Reject if password-protected

Error messages (exact):
  Invalid type/size/empty:
    "Invalid PDF. Use a CSU syllabus PDF
     or enter the data manually."
  Encrypted:
    Same message as above

  After error: highlight "Manual Upload Syllabus"
    button on the dashboard
```

### 4.2 Text Extraction

```
Step: Extract raw text from the validated PDF

Success condition: text extracted without error
  AND extracted text is non-empty

→ Success: proceed to Parse step
→ Failure:
  - Exact message:
    "Extract failed or the network dropped.
     Nothing is saved."
  - Nothing is written to database
  - Return user to dashboard
  - Log the error server-side (never expose
    stack traces to the client)
```

### 4.3 Parse F-CID-009

```
Structure to parse (Parts I to IV):

PART I — Course Information:
  - Course Code
  - Course Name / Title
  - Credit Units (Lecture + Laboratory)
  - Contact Hours per Week
  - Prerequisite(s)
  - Mode of Delivery
  - Course Description
  - Semester and Academic Year
  - Effectivity

PART II — Outcomes:
  - Program Educational Objectives (PEO1–PEOn)
  - Program Outcomes (PO1–PO12)
  - Course Outcomes (CO1–CO4)
  - CO to PO Mapping (I / E / D per cell)
  - Graduate Attributes mapping

PART III — Teaching and Learning Plan:
  - Week number
  - Topic / Content
  - Course Outcome reference
  - Teaching and Learning Activities (TLA)
  - Assessment Task
  - Resource Materials

PART IV — Assessment, References, Approvals:
  - Assessment tasks and percentage weights
  - Grading system (grade equivalency table)
  - Class policies
  - References
  - Prepared by (instructor name + date)
  - Noted by (Department Chair)
  - Reviewed by (QuAMS)
  - Approved by (Dean)

Required fields (reject if missing):
  Course Code, Course Name, Credit Units,
  Semester, CO1 (minimum one CO),
  At least one teaching plan row,
  At least one assessment task with weight

Parse result:
  Structured object matching the schema
  Missing non-required fields: set to null
  Null fields displayed as "Needs input" in UI
  Never display null or undefined to user

Parse failure:
  Exact message:
    "Required sections could not be read.
     Continue with manual entry."
  Redirect: back to dashboard, manual upload
    button highlighted
```

### 4.4 Data Quality Flags

```
After parsing, check for known data issues.
Display as warning badges in the Review screen.
Never block saving because of a flag —
only the user's confirmation blocks saving.

Known flags to check:

FLAG_CO4_SUBTOTAL:
  Condition: CO4 assessment weight subtotal > 100%
  Exact flag text:
    "⚠ CO4 subtotal prints 166.67%"

FLAG_EFFECTIVITY_MISMATCH:
  Condition: Effectivity field says "1st Semester"
    but filename contains "2nd" (or vice versa)
  Exact flag text:
    "⚠ Effectivity says 1st Semester but the
     file name says 2nd Semester"

FLAG_PO5_UNDEFINED:
  Condition: CO→PO mapping references PO5
    but PO5 has no definition in the PO table
  Exact flag text:
    "⚠ PO5 is mapped but undefined"

Display: yellow warning badges,
  one per flag, in the Review screen header
Flag presence does not block saving.
```

### 4.5 Review Screen

```
Layout:
  Left panel (50%): PDF preview (iframe or react-pdf)
  Right panel (50%):
    - Extracted fields (editable input fields)
    - Warning flags as yellow badges (if any)

Behavior:
  - Closing this screen WITHOUT confirming
    = data is NOT saved (no auto-save)
  - User can edit any extracted field before confirming
  - Edited fields are saved with the user's corrections

Buttons:
  "Confirm and Save"  → proceed to duplicate check
  "Edit Manually"     → open Manual Entry form
                        pre-filled with extracted data
  "Cancel"            → close without saving
    Exact message: "Data not saved. Edit manually
                   or cancel."
    Redirect: dashboard, manual upload highlighted
```

### 4.6 Duplicate Detection

```
Check: does the database already contain a record
  with the same Course Code AND the same Effectivity?

→ Duplicate found:
    Show dialog:
      "A record for [Course Code] [Effectivity]
       already exists."
    Buttons:
      "Yes, overwrite"
      "No, keep existing"

    → "Yes, overwrite":
        proceed to save (overwrite mode)
    → "No, keep existing":
        Exact message:
          "Keep the stored record.
           No second copy was inserted."
        Return to dashboard — do NOT save

→ No duplicate:
    Proceed directly to save
```

### 4.7 Save Transaction

```
Requirement: save in ONE database transaction.
  If any part fails, roll back the ENTIRE transaction.
  Never commit a partial syllabus record.

Transaction includes:
  1. Upsert syllabus header record
  2. Upsert Part I fields
  3. Delete + re-insert Part II rows
     (PEO, PO, CO, mapping)
  4. Delete + re-insert Part III rows
     (teaching plan weeks)
  5. Delete + re-insert Part IV rows
     (assessments, references, approvals)
  6. Update active_syllabus pointer for this user

→ Commit successful:
    Exact message: "Congratulations, Sync Successful."
    Refresh all module data from the new record
    Redirect to dashboard

→ Commit failed:
    Roll back entire transaction
    Exact message:
      "System error: the record was not saved.
       Please retry."
    Nothing is changed in the database
    Log error server-side
```

---

## 5. MANUAL ENTRY PIPELINE

### 5.1 Form Structure

```
Multi-step wizard — 6 steps:

Step 1: Course Information
  - Course Code (required)
  - Course Name (required)
  - Lecture Units (required, number)
  - Laboratory Units (required, number)
  - Total Credit Hours (required, number)
  - Prerequisite(s) (optional, text)
  - Mode of Delivery (required, select)
  - Course Description (required, textarea)
  - Semester (required, select: 1st / 2nd / Summer)
  - Academic Year (required, text)
  - Effectivity (required, text)

Step 2: Course Outcomes
  - CO1 to CO4 (required: minimum CO1)
  - PEO list (minimum 1 required)
  - PO1–PO12 definitions (PO required if mapped)
  - CO-to-PO mapping table (I / E / D per cell)
  - Graduate Attributes (optional)

Step 3: Teaching and Learning Plan
  - Rows: Week, Topic, CO Reference, TLA,
    Assessment Task, Resources
  - Minimum 1 row required
  - Add row / remove row controls
  - Week numbers auto-increment from 1

Step 4: Assessment Tasks
  - Task name (required)
  - Mapped CO(s) (required, multiselect)
  - Weight percentage (required, number)
  - Weights must sum to 100% (validate on submit)
  - Add / remove task controls

Step 5: References and Policies
  - Textbooks / references (optional, repeating)
  - Grading system description (optional, textarea)
  - Class policies (optional, textarea)
  - Rubrics (optional, textarea)
  - Student handbook reference (optional)

Step 6: Approvals
  - Prepared by: Name (required), Date (required)
  - Noted by: Department Chair Name (optional)
  - Reviewed by: QuAMS Name (optional)
  - Approved by: Dean Name (optional)
  - Dates for each signatory (optional)
```

### 5.2 Validation Rules

```
Timing: validate each step BEFORE allowing advance.
  Never allow advancing with errors present.
  On back navigation: preserve all entered data
  (Zustand store holds form state across steps).

Apply the SAME required-field checks used for
  the PDF ingest pipeline. Identical rules.

Assessment weight validation (Step 4):
  - Each weight: 0 < weight ≤ 100
  - Sum of all weights: must equal exactly 100%
  - If sum ≠ 100%: show inline error
    "Assessment weights must total 100%.
     Current total: [X]%"
  - Block submission until corrected

On submit (Step 6 "Save"):
  → Valid: proceed to same save transaction
    as PDF sync (Section 4.7)
  → Invalid:
    Exact message:
      "Required fields are missing. Stay on the form."
    Scroll to and highlight first invalid field
    Do NOT clear entered data
```

---

## 6. SCORING ALGORITHM

This is the most critical logic in the system.
Implement in `lib/scoring/algorithm.ts`.
Every branch must match the flowchart exactly.

### 6.1 Input

```typescript
interface ScoreInput {
  outcomes: {
    id: string        // CO1, CO2, CO3, CO4
    score: number     // 0–100, integer
  }[]
}

// Validation before computation:
// - Every defined CO must have exactly one score
// - Score must be a number between 0 and 100 inclusive
// - If any CO is missing or invalid:
//   → Return error, store no grade
//   → Exact message:
//     "No grade is stored.
//      Name each missing or invalid outcome: [list]"
```

### 6.2 Computation

```typescript
// Step 1: Define attainment threshold
const ATTAINMENT_THRESHOLD = 60  // score > 60 = attained
// Note: "greater than 60" — NOT "60 or above"
// A score of exactly 60 is NOT attained

// Step 2: Compute attainment per CO
const attained = outcomes.map(o => o.score > ATTAINMENT_THRESHOLD)
const attainedCount = attained.filter(Boolean).length
const totalCount = outcomes.length

// Step 3: Compute unweighted mean
const average = outcomes.reduce((sum, o) => sum + o.score, 0)
                / totalCount
// Use exact division — do NOT round before comparison

// Step 4: Run decision tree (exact order from flowchart)

// BRANCH 1: All outcomes attained (all > 60)
if (attained.every(Boolean)) {
  return {
    result: 'PASS',
    grade: mapAverageToGrade(average),
    // Map average to 1.0–3.0 scale (see Section 6.3)
    weakOutcomes: []
  }
}

// BRANCH 2: Average > 60 AND at least one outcome ≤ 60
if (average > 60 && attained.some(a => !a)) {
  return {
    result: 'INTERVENTION_1',
    grade: average,  // Grade stays as the original average
    // "Grade stays the original average" — do NOT map to scale
    weakOutcomes: outcomes.filter(o => o.score <= ATTAINMENT_THRESHOLD)
    // List weak outcomes and their associated topics
  }
}

// BRANCH 3: Average exactly 60
if (average === 60) {
  return {
    result: 'UNDECIDED',
    grade: null,  // Store no grade
    // "The syllabus defines no rule here.
    //  Store no grade. Ask the instructor."
    weakOutcomes: []
  }
}

// BRANCH 4: Average < 60 AND at least half attained
// "at least half" means attainedCount >= totalCount / 2
if (average < 60 && attainedCount >= totalCount / 2) {
  return {
    result: 'INTERVENTION_2',
    grade: null,  // No grade until re-assessment
    // "After those outcomes pass, highest grade is 3.0"
    maxGradeAfterIntervention: 3.0,
    weakOutcomes: outcomes.filter(o => o.score <= ATTAINMENT_THRESHOLD)
  }
}

// BRANCH 5: More than half NOT attained
// "more than half not attained" = failed > total / 2
const failedCount = totalCount - attainedCount
if (failedCount > totalCount / 2) {
  return {
    result: 'FAILED',
    grade: 5.0,
    weakOutcomes: outcomes.filter(o => o.score <= ATTAINMENT_THRESHOLD)
    // "List weak outcomes and topics. Ticks are ignored."
  }
}

// FALLBACK: no rule matched (should not occur)
return {
  result: 'NO_RULE_MATCHED',
  grade: null
  // "No rule matched. Store no grade."
}
```

### 6.3 Grade Scale Mapping (PASS path only)

```typescript
// Map unweighted average to Philippine academic grade scale
// Only applied when result = 'PASS'
// Source: CSU grading system from syllabus

function mapAverageToGrade(average: number): number {
  // 1.0 scale = highest (Excellent)
  // 3.0 scale = passing minimum
  // Apply the exact grade equivalency table
  // from the ITE 14 syllabus

  if (average >= 97) return 1.0
  if (average >= 94) return 1.25
  if (average >= 91) return 1.5
  if (average >= 88) return 1.75
  if (average >= 85) return 2.0
  if (average >= 82) return 2.25
  if (average >= 79) return 2.5
  if (average >= 76) return 2.75
  if (average > 60)  return 3.0
  // Should not reach here on PASS path
  return 3.0
}
```

### 6.4 Critical Rules for Scoring

```
✅ Attainment threshold is strictly > 60 (NOT >= 60)
✅ Score of exactly 60 is NOT attained
✅ Average is unweighted mean of all CO scores
✅ Rounding: do NOT round the average before comparison
   Use the raw decimal for all comparisons
✅ INTERVENTION_1: grade is the original average number
   Do NOT map it to the 1.0–3.0 scale
✅ INTERVENTION_2: store no grade now.
   After re-assessment, max achievable = 3.0
✅ FAILED: grade is exactly 5.0
✅ Topic ticks (checklist) NEVER affect the official grade
   Ticks are personal progress tracking only
✅ Store only ONE grade per student per course per semester
✅ On re-entry of scores: overwrite the previous grade

❌ Never compute a grade without all CO scores
❌ Never store a partial grade
❌ Never let topic ticks change the grade
❌ Never round the average before decision branching
❌ Never display a grade as "Passed" or "Failed" in text —
   display the numeric grade (1.0, 2.5, 5.0, etc.)
   and a status badge separately
```

---

## 7. MODULE RULES

### 7.1 Active Syllabus Concept

```
Every module reads from ONE active syllabus record.
The active syllabus is set per user per session.

Switching subjects:
  Trigger: subject switcher in sidebar or header

  Step 1: Check if any syllabus is stored
  → Empty list:
      Message: "No syllabus is stored yet.
                Synchronize a PDF or enter it manually."
      Offer: buttons to Sync or Manual Entry
  → List has items:
      Show list of saved syllabi
      (Course Code + Course Name + Semester)

  Step 2: User selects one
    - Update active_syllabus in session/store
    - ALL modules immediately re-read from
      the newly active record
    - "Active subject updated.
       Modules read that record only."
    - No page reload needed — Zustand triggers re-fetch

  RULE: Only the active course code changes.
  No other data is modified during subject switch.
```

### 7.2 Subjects Module

```
Route: /subjects
Data source: active syllabus teaching plan (Part III)
Sample: ITE 14 syllabus — all 18 weeks, exact text

Display per week row:
  Week number | Topic/Content | CO Reference |
  Teaching & Learning Activity | Assessment Task |
  Topic Status | Date

Topic Status chips (per row, per user):
  "Not Started"  — default state
  "In Progress"  — user marked as started
  "Completed"    — user marked as done

Topic checklist rules:
  - Saved per user per course per week
  - Changing a tick does NOT affect the grade
  - Store: { userId, courseCode, weekNumber,
             status, updatedAt }
  - Allowed status values:
    'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  - On save success: optimistic UI update
  - On save fail: revert to previous state +
    show error toast

Performance data:
  Number of "Completed" weeks displayed in
  Performance module as "Topics Accomplished"
  This is a visual indicator only — not a grade input
```

### 7.3 Performance Module

```
Route: /performance
Data source:
  Scores: from course-outcome score entries
  Topics accomplished: from topic checklist
  (count of COMPLETED weeks)
  Grade: from scoring algorithm result

Display per subject:
  CO scores table: CO1, CO2, CO3, CO4 scores
  Computed result badge: PASS / INTERVENTION / FAILED
  Computed grade: numeric (1.0 – 5.0)
  Topics accomplished: X of 18 weeks
  Weak outcomes list (if INTERVENTION or FAILED)

Semester passing rate widget:
  Formula: (subjects with PASS result /
            total subjects with scores entered)
            × 100
  Display: percentage with NumberTicker animation
  Label: "Semester Passing Rate"

RULE: "Official result from course-outcome
  scores only. Ticks do not change it."
  Topic ticks visible in Performance as
  "progress" only — never as grade input.
```

### 7.4 Course Specification Module

```
Route: /course-specification
Data source: active syllabus Part I

Fields displayed:
  Course Code, Course Name,
  Lecture Units, Lab Units, Total Credit Hours,
  Contact Hours per Week, Prerequisite(s),
  Mode of Delivery, Course Description,
  Semester, Academic Year, Effectivity

ITE 14 sample:
  Lecture: 2 | Laboratory: 1 | Prerequisite: ITE 13

All fields: read-only display (not editable here)
Missing field display: "Needs input" (not null/empty)
```

### 7.5 PEO / PO / CO Module

```
Route: /peo-po-co
Data source: active syllabus Part II

Sections:
  1. Program Educational Objectives (PEO)
     List each PEO with its description

  2. Program Outcomes (PO1–PO12)
     Table: PO number | Description
     ⚠ PO5: flagged as "mapped but undefined"
     Display warning badge next to PO5 row

  3. Course Outcomes (CO1–CO4)
     List each CO with its description

  4. CO-to-PO Mapping Table
     Rows: CO1, CO2, CO3, CO4
     Columns: PO1–PO12
     Cell values: I (Introduced) | E (Enhanced) |
                  D (Demonstrated) | — (not mapped)
     Cells are read-only

  5. Graduate Attributes mapping (if present)

Mapping legend:
  I = Introduced
  E = Enhanced
  D = Demonstrated

AnimatedBeam (Magic UI): draw connecting lines
  from each CO to its mapped POs in the diagram view
```

### 7.6 Learning Plan & Notes Module

```
Route: /learning-plan
Data source: active syllabus Part III + user notes

Table: same as Subjects but adds instructor notes column
  Week | Topic | CO | TLA | Assessment |
  Topic Status | Date | Notes

Notes section (below table):
  Free-text editor per week row
  Purpose: instructor announcements, quiz notes,
    reminders
  Stored per user per course per week
  NOT part of the official syllabus record

This week planner widget:
  Auto-detect current week based on:
    - Semester start date (entered in system)
    - Academic calendar
    - Today's date
  Display:
    "THIS WEEK: Week [N]"
    Topic, Outcome, TLA, Assessment for that week
    Next upcoming assessment
  "Match today to the learning plan
   and the academic calendar."

Assessment to CO map:
  ITE 14 exact mapping:
    LQ1 – PS3 → CO1
    LQ4       → CO3
    Project   → CO2 and CO3
    LQ5 – LQ6 → CO4
  Display as a visual mapping table
```

### 7.7 Grading System Module

```
Route: /grading
Data source: active syllabus Part IV

Display:
  Assessment task table:
    Task Name | Mapped CO(s) | Weight (%)

  Grade equivalency table:
    Score Range | Grade
    (Exact values from the syllabus)

  Computed grade for the active subject
    (from scoring algorithm result)

  Label: "Grade shown is computed from
          course-outcome scores only.
          Topic ticks are not an input."

RULE: "Shows the result stored by the score tests.
  Ticks are not an input."
  This module is display-only.
  No data entry happens here.
```

### 7.8 Class Policies Module

```
Route: /policies
Data source: active syllabus Part IV

Sections displayed:
  1. Assessment Rubrics
  2. Academic Fraud / Integrity Policy
     (exact text from syllabus)
  3. Attendance Policy
  4. Student Handbook Reference
  5. Other Class Rules

Display: accordion layout, one section per panel
All content: read-only
```

### 7.9 College Faculty Module

```
Route: /faculty
Data source: active syllabus approvals section (Part IV)

Display cards for:
  1. Prepared by: Instructor name, subject, date
  2. Noted by: Department Chair
  3. Reviewed by: QuAMS Coordinator
  4. Approved by: Dean

ITE 14:
  Signatories = exact names from syllabus

Below signatories:
  Team Gogola credits section
    "GoldenSync — Caraga State University CCIS"
    "Golden CSUan | Team Gogola"
```

---

## 8. EXPORT FUNCTIONALITY

```
Trigger: "Export Syllabus" button

Step 1: Check if a syllabus is active
  → No active syllabus:
      Message: "Nothing to export.
                Synchronize or enter a syllabus first."
  → Active syllabus found:
      Proceed to export

Step 2: Generate PDF
  - Export the ACTIVE syllabus only
  - No other student's scores included
  - Database is NOT modified by export
  - Format: matches F-CID-009 form layout
  - Trigger browser download

Export rules:
  ✅ Only the currently active syllabus
  ✅ Database unchanged after export
  ✅ No scores from other users included
  ✅ File named: [CourseCode]_[Semester]_[AY].pdf
```

---

## 9. DATA INTEGRITY RULES

### 9.1 Locked vs Variable Data

```
LOCKED — same for all subjects, never changed in UI:
  University name and header
  University Vision
  University Mission
  Graduate Attributes
  IO1 – IO3 (Institutional Outcomes)
  PEO definitions (once saved per course)
  PO definitions (once saved per course)
  Grading system legends
  Standard policy text that is institution-wide
  Calendar structure (week numbering)

  Source: entered once via Manual Entry or PDF sync
  Display: read-only everywhere in the system
  Edit: only via re-sync or new manual entry

VARIABLE — changes per subject:
  Course Code, Course Name
  Units (lecture + laboratory)
  Contact Hours
  Prerequisite(s)
  Mode of Delivery
  Course Description
  CO1 – CO4 and their descriptions
  CO-to-PO mapping cells
  Teaching plan rows (weeks, topics, TLA, assessments)
  Assessment task names and weights
  References
  Prepared-by name and date
  Signatory names and dates

ENTERED IN SYSTEM ONLY (never from syllabus PDF):
  Semester start date
  Student roster
  CO scores (0–100 per outcome)
  Topic status (Not Started / In Progress / Completed)
  Dates for topic status updates
  Instructor notes
```

### 9.2 Data Quality Rules

```
Never invent data:
  If a field is not in the PDF or form → null
  Null displayed as: "Needs input"
  Never interpolate or guess missing values

Copy exactly:
  All text from the ITE 14 syllabus:
    Copy word for word, character for character
  No paraphrasing. No summarizing.
  No "cleaning up" of source text.

Flags (do not auto-fix):
  FLAG_CO4_SUBTOTAL:
    Show the flag. Do NOT auto-correct the percentage.
    The user must decide.

  FLAG_EFFECTIVITY_MISMATCH:
    Show the flag. Do NOT auto-correct the semester.
    Both the field and filename may be wrong.

  FLAG_PO5_UNDEFINED:
    Show the flag. Do NOT remove the PO5 mapping.
    The user must decide whether to define PO5
    or remove its mapping.
```

### 9.3 Transaction Rules

```
All writes that touch more than one table:
  MUST use a database transaction.
  MUST roll back entirely on any error.
  MUST NOT commit partial data.

Specific transactions:
  Syllabus save (PDF or manual):
    One transaction covers all 5 write operations
    (header + parts I–IV + active pointer)

  Score entry:
    One transaction: scores + computed grade

  Topic status update:
    Single row update (no transaction needed)

Rollback behavior:
  On rollback: nothing changes in the database
  User sees: exact error message from spec
  System logs: full error details server-side
  User sees: generic "System error" message only
```

---

## 10. API ROUTE RULES

```
Every API route must implement:

1. Authentication check first
   - Validate session token
   - If invalid/expired: return HTTP 401
   - Never process the request if unauthenticated

2. Authorization check second
   - Verify the user's role permits this action
   - If unauthorized: return HTTP 403
   - Student attempting instructor action = 403

3. Input validation third
   - Validate all inputs with Zod schemas
   - If invalid: return HTTP 400 with field errors
   - Never trust client-sent data

4. Business logic
   - Execute the operation
   - Use transactions where required

5. Response format (consistent across all routes):
   Success: { success: true, data: T }
   Error:   { success: false, error: { code, message } }

Error codes:
  AUTH_FAILED          Login credentials rejected
  AUTH_EXPIRED         Session expired
  AUTH_FORBIDDEN       Role does not permit this action
  VALIDATION_ERROR     Input failed schema validation
  FILE_INVALID         PDF rejected (type/size/encrypted)
  EXTRACT_FAILED       PDF text extraction failed
  PARSE_FAILED         F-CID-009 parsing failed
  DUPLICATE_RECORD     Same course + effectivity exists
  SAVE_FAILED          Database transaction failed
  EXPORT_EMPTY         No active syllabus to export
  SCORE_INCOMPLETE     Not all COs have scores
  NOT_FOUND            Requested resource does not exist
  INTERNAL_ERROR       Unexpected server error

HTTP status codes:
  200  Success
  201  Created
  400  Validation error
  401  Unauthenticated
  403  Unauthorized (authenticated but not permitted)
  404  Not found
  409  Conflict (duplicate)
  422  Unprocessable entity (business rule violation)
  500  Internal server error

RULE: Never expose stack traces, SQL errors,
  or internal error details to the client.
  Log them server-side. Return only the error code.
```

---

## 11. STATE MANAGEMENT RULES

```
Zustand stores — one per domain:

auth.store.ts
  State: { user, role, sessionExpiry, isAuthenticated }
  Actions: setUser, clearUser, refreshSession

syllabus.store.ts
  State: { activeSyllabus, syllabusList, syncStatus }
  Actions: setActive, refreshList, updateSyncStatus

subject.store.ts
  State: { topics, topicStatuses, activeWeek }
  Actions: setTopicStatus (optimistic),
           revertTopicStatus (on error)

performance.store.ts
  State: { scores, computedGrades, passingRate }
  Actions: setScores, computeGrade

ui.store.ts
  State: { sidebarOpen, activeModal, loadingStates }
  Actions: toggleSidebar, openModal, closeModal,
           setLoading

Rules:
  ✅ Stores hold UI state and cached server data
  ✅ Server is always the source of truth
  ✅ Optimistic updates must have rollback paths
  ✅ Clear auth store completely on logout
  ✅ Clear syllabus + subject stores on subject switch

  ❌ Never store sensitive data (passwords, tokens)
     in Zustand
  ❌ Never put business logic in stores
  ❌ Never call API directly from stores —
     use service functions in lib/
```

---

## 12. ERROR HANDLING RULES

```
Client-side errors:
  Every async operation: try/catch/finally
  finally: always clear loading state
  catch:
    1. Log to console (development only)
    2. Show user-facing toast or inline error
    3. Never show raw error to user

User-facing error messages:
  ALL messages are defined in lib/utils/messages.ts
  Component never hardcodes a message string
  Match EXACT wording from the flowchart:

  MESSAGES = {
    LOGIN_FAILED:
      "System Error: Account Log In Failed.",

    REGISTER_FAILED:
      "Account could not be created.
       Check the email and password.",

    REGISTER_SUCCESS:
      "Account created. Please log in.",

    LOGIN_SUCCESS_BANNER:
      "Successful Log In CSUan",

    SYNC_SUCCESS:
      "Congratulations, Sync Successful.",

    SYNC_FAIL:
      "Sorry, try another way.",

    SAVE_FAIL:
      "System error: the record was not saved.
       Please retry.",

    FILE_INVALID:
      "Invalid PDF. Use a CSU syllabus PDF
       or enter the data manually.",

    EXTRACT_FAIL:
      "Extract failed or the network dropped.
       Nothing is saved.",

    PARSE_FAIL:
      "Required sections could not be read.
       Continue with manual entry.",

    PREVIEW_CANCEL:
      "Data not saved. Edit manually or cancel.",

    DUPLICATE_KEEP:
      "Keep the stored record.
       No second copy was inserted.",

    MANUAL_INCOMPLETE:
      "Required fields are missing. Stay on the form.",

    SCORE_INCOMPLETE:
      "No grade is stored.
       Name each missing or invalid outcome:",

    STUDENT_DENIED:
      "Students cannot upload or overwrite a syllabus.
       Continue to scores or modules.",

    NO_SYLLABUS_SWITCH:
      "No syllabus is stored yet.
       Synchronize a PDF or enter it manually.",

    ACTIVE_SWITCHED:
      "Active subject updated.
       Modules read that record only.",

    EXPORT_EMPTY:
      "Nothing to export.
       Synchronize or enter a syllabus first.",

    SIGN_OUT_CONFIRM:
      "Are you sure you want to sign out?",
  }
```

---

## 13. SECURITY RULES

```
Authentication:
  ✅ Passwords: bcrypt, minimum 12 salt rounds
  ✅ Session tokens: httpOnly cookie,
     SameSite=Strict, Secure flag
  ✅ Token rotation: new token on each login
  ✅ CSRF protection: SameSite=Strict handles this
     for same-origin; add CSRF token for forms
  ✅ Rate limiting: 5 failed login attempts per 15min
  ✅ Email domain enforcement: @carsu.edu.ph only

Input handling:
  ✅ All user input: validate with Zod before processing
  ✅ File uploads: validate type, size, content
  ✅ SQL: use parameterized queries only
     (never string concatenation)
  ✅ XSS: Next.js JSX escapes by default —
     never use dangerouslySetInnerHTML with user input

Data exposure:
  ✅ Never expose: password hashes, session tokens,
     internal IDs, stack traces, SQL error messages
  ✅ Error responses: generic messages only
  ✅ Role check: server-side on every protected route
  ✅ Student cannot read another student's scores
  ✅ Export: active syllabus only, no cross-user data
```

---

## 14. TESTING RULES

```
Every piece of business logic must have unit tests.
Priority order:

1. Scoring algorithm (lib/scoring/algorithm.ts)
   Test every branch:
   ✅ All COs > 60 → PASS + correct grade mapping
   ✅ Average > 60, one CO = 60 → INTERVENTION_1
   ✅ Average > 60, one CO = 59 → INTERVENTION_1
   ✅ Average = 60 exactly → UNDECIDED
   ✅ Average < 60, half attained → INTERVENTION_2
   ✅ Average < 60, more than half failed → FAILED 5.0
   ✅ Missing CO score → error, no grade stored
   ✅ Score of exactly 60 is NOT attained (edge case)
   ✅ Score of 61 IS attained (edge case)

2. Authentication validation (lib/auth/validation.ts)
   ✅ Valid @carsu.edu.ph email → pass
   ✅ Other domain → fail
   ✅ Empty email → fail
   ✅ Duplicate email → generic fail (not "exists")
   ✅ Weak password → fail
   ✅ Mismatched passwords → fail

3. PDF parser (lib/syllabus/parser.ts)
   ✅ Valid F-CID-009 → all fields extracted
   ✅ Missing required field → flagged
   ✅ CO4 subtotal > 100% → flag raised
   ✅ Effectivity mismatch → flag raised
   ✅ PO5 unmapped but referenced → flag raised

4. API routes (integration tests)
   ✅ Login success → session created
   ✅ Login fail → 401, generic message
   ✅ Student upload attempt → 403
   ✅ Duplicate syllabus → 409
   ✅ Save transaction fail → rollback, nothing saved

Test file naming:
  algorithm.test.ts
  validation.test.ts
  parser.test.ts
  [route].test.ts
```

---

## 15. QA CHECKLIST

Before any feature or fix is considered done:

```
SYSTEM LOGIC
  ☐ Every flowchart branch has matching code
  ☐ Every error message matches exact spec wording
  ☐ Login does not reveal which field was wrong
  ☐ Registration does not reveal if email exists
  ☐ Session expires after 30 minutes idle
  ☐ Student cannot upload or overwrite syllabus
  ☐ Scoring: score of exactly 60 is NOT attained
  ☐ Scoring: topic ticks do NOT affect grade
  ☐ Scoring: INTERVENTION_1 grade is NOT mapped
     to 1.0–3.0 scale
  ☐ Scoring: FAILED grade is exactly 5.0
  ☐ Save transaction: rolls back entirely on failure
  ☐ Export: database unchanged after export
  ☐ Export: only active syllabus exported
  ☐ Subject switch: only active pointer changes
  ☐ No data invented — missing fields = "Needs input"

API & SECURITY
  ☐ Auth check on every protected route
  ☐ Role check on every instructor-only route
  ☐ No stack traces exposed to client
  ☐ All inputs validated with Zod
  ☐ All database queries parameterized
  ☐ Passwords hashed with bcrypt

CODE QUALITY
  ☐ Zero TypeScript errors (strict mode)
  ☐ Zero console.log in production paths
  ☐ Zero TODO comments
  ☐ Zero any types
  ☐ All messages from messages.ts (no hardcoded strings)
  ☐ All thresholds from constants.ts (no magic numbers)
  ☐ Every async function: loading + error + success states
  ☐ Every API route: auth → role → validate → execute
  ☐ All transactions: atomic with rollback

TESTS
  ☐ Scoring algorithm: all 7 branches tested
  ☐ Auth validation: all edge cases tested
  ☐ Parser flags: all 3 flags tested
  ☐ Zero failing tests before merge
```

---

_GOLDENSYNC System & AI Workflow Rules v1.0_
_Team Gogola — Caraga State University CCIS_
_This file is derived from the GoldenSync-System-Plan flowchart._
_Every rule traces back to a node in that diagram._
_When in doubt: re-read the flowchart, not this file._
