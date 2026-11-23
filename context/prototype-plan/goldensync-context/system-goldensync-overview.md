# GoldenSync

> Source of truth: `GoldenSync-System-Plan-v2.drawio` (v2, 2026-11-10). The full build rules (SQL, API contracts, tests, milestones) live in the _GoldenSync - Build Specification v2_. This file and the diagram must stay in agreement.

## Overview

GoldenSync is a responsive, personal web app for university students to track their own semesters, subjects and grades. A student creates an account with a university email, adds subjects by uploading a syllabus PDF (CSU form F-CID-009) or by entering it manually, then uses the subject's modules (outcomes, learning plan, weekly view, checklist, assessment map, grade calculator) to follow the course. The student enters a raw score and max score for each activity; the app computes per-outcome percentages and an estimated grade status. Results are always labelled **Estimated (self-reported)** and are never an official grade.

Every account owns its own semesters, subjects and scores. There are no instructor or student roles, and syllabus data is private to the account (sharing happens outside the app as a PDF copy). The uploaded PDF is parsed, then discarded. Target scale: 500+ users at launch, designed to reach 5,000. All dates use `Asia/Manila`.

## Goals

1. **Private per-account tracking:** every query is scoped by `user_id`; another account's ids always return 404.
2. **Fast subject creation:** a valid F-CID-009 PDF becomes a prefilled, reviewable subject form within 60 s (polled every 2 s); manual entry is always available as a fallback.
3. **Trustworthy grade estimate:** results are derived from stored raw scores using Decimal math, never from a typed-in grade, and never presented as official.
4. **Secure by default:** argon2id passwords, throttled login, no account enumeration, server-side sessions checked on every request, sandboxed PDF parsing, escaped output, CSV injection neutralized.
5. **Fail-closed data integrity:** all multi-row saves are one transaction; duplicates are decided by a unique index and an idempotency key, not by UI checks.
6. **Scale and operability:** queue-based PDF ingest, bounded lists, all limits and thresholds in one config file, insert-only audit log.

## Core User Flow

1. **Register:** enter university email, password, confirm password, privacy consent. The server always replies HTTP 202 with identical text.
2. **Verify email:** open the single-use link (24 h) from the email. Verification sets `email_verified_at`.
3. **Log in:** throttled (5 failures / 15 min per account and per IP). A new server-side session is created (idle 30 min, absolute 12 h). Land on the Dashboard.
4. **Create a semester:** label, start date, end date, skipped weeks (end after start, max 30 semesters).
5. **Add a subject** (Dashboard or the button under Grade Calculator, max 20 active per semester):
   - **Upload PDF:** validate, queue, extract text, parse Parts I to IV, then open the shared subject form with flagged fields.
   - **Manual entry:** open the same form empty.
6. **Review and confirm:** edit the form (autosaved draft every 10 s), validate, handle a duplicate course code (Open existing or Replace), then save in one transaction.
7. **Use the subject modules:** Overview, Outcomes, Learning Plan and Notes, Grading, Class Policies, College Faculty, Assessment Map, Checklist, This Week, Export.
8. **Enter scores** in the Grade Calculator (raw score and max per activity; empty means not taken yet).
9. **Read the result card:** status, average, estimate and weak outcomes with plan topics.
10. **Manage data:** edit, archive (restorable 30 days) or delete a subject; export or delete the account; log out.

## Features

### Authentication and Session (Page 1)

- Login with email and password. Same error for every failure (no enumeration), with a "Resend verification" link.
- Email normalization (NFKC, trim, lowercase). The argon2id check always runs, using a dummy hash when the email is unknown or unverified (timing-safe).
- Login throttle: 5 failures per 15 min per account and per IP, with a "try again in a few minutes" message.
- Registration validation: strict email parse, domain exactly in the allowed list, password 10 to 128 characters and not common, passwords match, consent checked. 5 registrations per hour per IP.
- Existing email on registration: sends a "you already have an account" email instead. No other observable difference.
- Email verification: token 24 h, single use. Expired or used tokens get a generic reply and a way to request a new one.
- Forgot and reset password: 3 per hour per email, reset token 1 h single use, new password argon2id, **all sessions revoked**, audited.
- Sessions: 256-bit random id, only its hash is stored. Checked on every request (idle 30 min sliding, absolute 12 h, not revoked). `SESSION_EXPIRED` keeps the open form as a draft and redirects to Login. Warning at minute 28.
- Logout (any screen) revokes the session server-side, clears the cookie and audits.

### Dashboard and Semesters (Page 2)

- Semester picker, subject cards with progress, Add Subject button.
- New semester form with validation (end after start, max 30).
- Open a subject card to go to its modules.

### Add Subject (Page 2)

- Cap check: fewer than 20 active subjects in the semester, else "Limit reached. Archive or delete a subject first."
- **PDF path:**
  - Client sends an `Idempotency-Key`.
  - Server checks: session, 10 uploads per hour, stream max 10 MB, first bytes `%PDF-`, not encrypted, at most 60 pages.
  - Errors: `PDF_INVALID`, `PDF_TOO_LARGE`, `PDF_ENCRYPTED`, `RATE_LIMITED`.
  - Creates an ingest job (`QUEUED`, 202); the temp file is named by uuid.
  - A separate worker process (no network, 20 s timeout) extracts text. Fewer than 200 characters gives `PDF_SCANNED`; a timeout gives `PARSE_TIMEOUT`.
  - The parser maps F-CID-009 Parts I to IV into the form. Missing or doubtful fields are flagged, never dropped. Job becomes `NEEDS_REVIEW`.
- **Manual path:** the same shared form, empty.
- **Shared subject form:** semester, code, title, units, prerequisite, effectivity, outcomes, activities mapped to outcomes, plan weeks, policies, faculty. Flagged fields are highlighted. Drafts autosave every 10 s and are kept 7 days.
- **Validation (one schema for PDF and manual):** semester, code, title, at least 1 outcome, at least 1 activity mapped to an outcome. Limits: 20 outcomes, 150 activities, 30 weeks. Failure returns `VALIDATION_FAILED` with highlighted fields and Confirm disabled.
- **Duplicate handling:** an active subject with the same course code in the same semester (unique index decides, so a retake in another semester is allowed).
  - _Open existing:_ go to the existing subject.
  - _Replace:_ one transaction archives the old subject (restorable 30 days), inserts the new one and copies scores where activity label and max score match. Shows "N scores copied, M not copied."
- **Save:** one transaction inserts subject, outcomes, plan weeks, activities and mappings. The same `Idempotency-Key` returns the first result. Audited. On failure it rolls back and offers retry (max 3, backoff 1 s, 2 s, 4 s).

### Subject Modules (Page 3)

- Sidebar (drawer below 768 px): Home, Subject switcher, Overview, Outcomes, Learning Plan and Notes, Grading, Class Policies, College Faculty, Assessment Map, Checklist, Export, This Week, Grade Calculator, Add Subject, Edit/Archive/Delete subject, Account, Logout. Items other than Home and Add Subject are disabled until a subject is selected.
- Every module renders from the saved subject owned by the account (nothing hardcoded). A missing part shows "Not in this syllabus. Edit subject to add it."
- **Overview:** units, prerequisite, effectivity.
- **Outcomes:** PEO / PO / CO and the I, E, D map.
- **Learning Plan and Notes:** weeks, topics, activities, the student's own notes.
- **Grading, Policies, Faculty:** read-only syllabus parts.
- **Assessment Map:** activity to outcome map.
- **Checklist:** toggle weeks done. Writes only `checklist_items` and never changes any result.
- **Export:** own subject as CSV or JSON. Cells starting with `=`, `+`, `-` or `@` are neutralized.
- **This Week:** `today` is the server date in `Asia/Manila`, `d = today - semester start`, `week = floor(d / 7) + 1`. States in order:
  1. `BEFORE_START` (d < 0): starts in N days, Week 1 preview.
  2. `AFTER_END`: "Semester ended".
  3. `NO_CLASS`: week is in skipped weeks, show the next scheduled topic.
  4. `NO_PLAN_FOR_WEEK`: no plan row where `week_from <= week <= week_to`.
  5. Otherwise show topic, outcome, activities and the next assessment.
- **Subject actions:** Edit any field. Archive is restorable for 30 days. Delete requires typing the course code and removes its scores.
- **Account:** export my data; delete account (password required) removes everything owned.

### Grade Calculator (Page 4)

- Requires a selected subject with at least 1 outcome and 1 mapped activity, otherwise "Choose a subject, or press Add Subject."
- Table grouped by outcome: Activity | Outcome | Score | Max | Percent. Buttons: Add activity, Add Subject. Label: _Estimated (self-reported)_.
- **Add activity:** label, max score, map to at least 1 outcome. Unmapped activities are listed under "Other activities" and excluded from the result.
- **Score validation:** `0 <= score <= max`, `max > 0`, up to 2 decimals, max 10000. Invalid input saves nothing.
- **Save:** batch upsert with the version of each row; the server value is authoritative. `CONFLICT_VERSION` means reload that row and re-enter.
- **Computation (Decimal math, unrounded):**
  - Outcome percent = sum(scores) / sum(max) x 100 over scored activities mapped to that outcome.
  - If any outcome has no scored activity: `INCOMPLETE` (per-outcome progress, no result).
  - Average = unweighted mean of outcome percents. An outcome is _attained_ when percent > 60.
- **Result decision (ordered tests):**

| Order | Test                               | Status                   | Grade                                       |
| ----- | ---------------------------------- | ------------------------ | ------------------------------------------- |
| 1     | All outcomes attained              | `PASSED`                 | map(average) from grade scale               |
| 2     | Average > 60                       | `INTERVENTION_A`         | map(average); list weak outcomes and topics |
| 3     | Average = 60 exactly               | `UNDEFINED_AT_THRESHOLD` | none; "confirm with your instructor"        |
| 4     | At least half of outcomes attained | `INTERVENTION_B`         | best possible 3.0 after weak outcomes pass  |
| 5     | Otherwise                          | `FAILED`                 | 5.0                                         |

- **Release gate:** if the grade scale is not confirmed, the numeric grade for `PASSED` and `INTERVENTION_A` is hidden; status and average still show. A rule table with no match raises a logged configuration error.

### Account, Privacy and Security (Cross-cutting)

- Consent at registration; account data export; full account delete (cascade).
- Audit log (insert-only): login, logout, verify, password reset, subject save, replace, delete.
- Output escaping everywhere; CSV formula neutralization.
- Every query scoped by `user_id`; foreign ids return 404.
- All limits and thresholds in one config file.

## Scope

### In Scope

- Responsive web app (sidebar becomes a drawer below 768 px) for 500+ users, designed to reach 5,000.
- Email and password auth with verification, reset, throttling, server-side sessions.
- Semesters with start date, end date and skipped weeks.
- Subject creation by F-CID-009 PDF upload, manual entry or the Add Subject button, all through one shared form and one validation schema.
- Queue-based, sandboxed PDF ingest with size, page, timeout and scanned-PDF checks.
- Duplicate handling per semester by course code, with Replace (archive and score copy).
- Subject modules rendered from saved data, plus checklist, weekly planner and export.
- Per-activity raw score entry with versioned rows and conflict handling.
- Derived outcome percentages, average and the five grade statuses (plus `INCOMPLETE`), gated on a confirmed grade scale.
- Edit, archive (30-day restore), delete subject; account export and delete.
- Autosaved drafts (7 days) that survive `SESSION_EXPIRED`.
- Audit log and a single constants config.

### Out of Scope

- Instructor or student roles, instructor-only upload, or any cross-account sharing in the app.
- Official or authoritative grades; results are always estimates.
- Storing uploaded PDFs after parsing.
- OCR for scanned PDFs (user is sent to manual entry).
- Overwriting another record in place (replaced by archive and copy).
- Weighted outcome averages (unweighted mean until D2 is decided).
- Third-party or social login; non-Asia/Manila time zones.
- Native mobile apps.

## Success Criteria

1. A new user can register, verify, log in, create a semester and reach the Dashboard; registration and forgot-password responses are byte-identical for existing and unknown emails.
2. Login is throttled after 5 failures per 15 min, and every failure returns the same message; a password reset revokes all sessions.
3. An expired or revoked session is rejected on every request with `SESSION_EXPIRED`, and the open form is restored from the draft after login.
4. A valid F-CID-009 PDF (at least the 5 real samples from D7) yields a prefilled form within 60 s; scanned, encrypted, oversize (over 10 MB or 60 pages), invalid or timed-out files return the specified error code and offer a retry or Manual tab.
5. Missing or doubtful parsed fields are flagged in the form and never silently dropped.
6. Saving a subject is atomic; repeating the same `Idempotency-Key` returns the first result and creates no duplicates; two concurrent saves of the same active course code in a semester never both succeed.
7. Replace archives the old subject (restorable 30 days) and reports exact "N copied, M not copied" counts.
8. A user can never read or modify another account's data; foreign ids return 404 (covered by automated authorization tests on every route).
9. Grade results match the decision table for every case, including exactly 60 (`UNDEFINED_AT_THRESHOLD`), no scores (`INCOMPLETE`), and unmapped activities (excluded); Decimal math introduces no rounding drift.
10. With an unconfirmed grade scale, the numeric grade is hidden for `PASSED` and `INTERVENTION_A` while status and average remain visible.
11. The This Week module returns the correct state for before start, skipped week, after end and no plan, using `Asia/Manila` dates.
12. CSV/JSON export neutralizes `=`, `+`, `-`, `@` cells and contains only the requester's data.
13. Account delete removes all owned data (cascade) and requires the password.
14. Diagram and Build Specification show no disagreement in a review before each milestone.

---

## Appendix A - Routes

| Screen                     | Route                                            | Sidebar label                            | Data                              |
| -------------------------- | ------------------------------------------------ | ---------------------------------------- | --------------------------------- |
| Login                      | `/login`                                         | -                                        | email, password                   |
| Registration               | `/register`                                      | -                                        | email, password, confirm, consent |
| Verify email               | `/verify-email?token`                            | -                                        | token                             |
| Forgot / reset password    | `/forgot-password`, `/reset-password?token`      | -                                        | email, token, new password        |
| Dashboard                  | `/dashboard`                                     | Home                                     | semesters, subject cards          |
| Semester                   | `/semesters/new`, `/semesters/:id`               | Home                                     | label, start, end, skipped weeks  |
| Add Subject                | `/subjects/new`                                  | Add Subject                              | PDF file or form data             |
| Overview                   | `/subjects/:id/overview`                         | Overview                                 | course specification              |
| Outcomes                   | `/subjects/:id/outcomes`                         | Outcomes                                 | PEO / PO / CO, I-E-D map          |
| Learning plan              | `/subjects/:id/plan`                             | Learning Plan and Notes                  | plan weeks, own notes             |
| Grading, policies, faculty | `/subjects/:id/grading`, `/policies`, `/faculty` | Grading, Class Policies, College Faculty | syllabus parts                    |
| This Week                  | `/subjects/:id/week`                             | This Week                                | plan weeks, semester dates        |
| Checklist                  | `/subjects/:id/checklist`                        | Checklist                                | checklist_items                   |
| Assessment map             | `/subjects/:id/assessments`                      | Assessment Map                           | activities, outcome mapping       |
| Grade Calculator           | `/subjects/:id/calculator`                       | Grade Calculator                         | activities, scores                |
| Export                     | `/subjects/:id/export`                           | Export                                   | own subject only                  |

## Appendix B - Data Model (all keyed by owner)

```
users ─┬─ auth_tokens, sessions
       └─ semesters ── subjects (unique active course code per semester)
                         ├─ course_outcomes
                         ├─ plan_weeks
                         ├─ assessments ── assessment_outcomes ── (course_outcomes)
                         │       └─ scores (one raw score per activity, versioned)
                         └─ checklist_items
Support: ingest_jobs, drafts, idempotency_keys, grade_scale, grade_scale_meta, audit_log (insert-only)
```

- Deleting a parent cascades to children.
- `scores` is versioned for optimistic concurrency (`CONFLICT_VERSION`).
- Results are derived from raw scores at read time and are not stored.
- Full SQL is in Build Specification section 5.

## Appendix C - API Summary

| Area                  | Endpoints                                                                                                                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Auth                  | register, verify, resend-verification, login, logout, forgot-password, reset-password                                                                                                                        |
| Account               | `GET /api/me`, `DELETE /api/me`, `GET /api/me/export`                                                                                                                                                        |
| Semesters             | list, create, update, delete                                                                                                                                                                                 |
| Subjects              | `POST /api/subjects` (Idempotency-Key), `POST /api/subjects/ingest` (202), `GET` and `POST confirm` on `/api/subjects/ingest/:jobId`, `GET/PATCH/DELETE /api/subjects/:id`, `POST /api/subjects/:id/replace` |
| Activities and scores | `POST /api/subjects/:id/assessments`, `PATCH/DELETE /api/assessments/:id`, `PUT /api/subjects/:id/scores`                                                                                                    |
| Derived               | `GET /api/subjects/:id/outcome`, `GET /api/subjects/:id/week`                                                                                                                                                |
| Other                 | `PUT` checklist, `GET` export, `PUT /api/drafts/:kind`                                                                                                                                                       |

Rule: another account's ids always return 404.

## Appendix D - Key Limits (single config file)

| Setting                       | Value                                   |
| ----------------------------- | --------------------------------------- |
| PDF size / pages              | 10 MB / 60 pages                        |
| Minimum extracted text        | 200 characters                          |
| Parse timeout                 | 20 s                                    |
| Uploads                       | 10 per hour                             |
| Ingest polling                | every 2 s, up to 60 s                   |
| Login failures                | 5 per 15 min (account and IP)           |
| Registrations                 | 5 per hour per IP                       |
| Password reset requests       | 3 per hour per email                    |
| Password length               | 10 to 128, not common                   |
| Verify / reset token life     | 24 h / 1 h, single use                  |
| Session                       | idle 30 min (warn at 28), absolute 12 h |
| Subjects per semester         | 20 active                               |
| Semesters                     | 30                                      |
| Outcomes / activities / weeks | 20 / 150 / 30                           |
| Score                         | 2 decimals, max 10000                   |
| Attainment / threshold        | 60 / 60                                 |
| Draft autosave / retention    | 10 s / 7 days                           |
| Archive restore window        | 30 days                                 |
| Save retry                    | max 3, backoff 1 s, 2 s, 4 s            |
| Time zone                     | Asia/Manila                             |

## Appendix E - Open Decisions

| ID  | Decision                                        | Current default                               |
| --- | ----------------------------------------------- | --------------------------------------------- |
| D1  | Official average-to-grade table                 | Numeric `PASSED` grade hidden until confirmed |
| D2  | How activities roll up into an outcome          | Points-weighted                               |
| D3  | `INTERVENTION_A` grade                          | Mapped average                                |
| D4  | Rule when average is exactly 60                 | `UNDEFINED_AT_THRESHOLD`                      |
| D5  | Allowed email domains                           | Not set                                       |
| D6  | Hosting and email provider                      | Not set                                       |
| D7  | At least 5 real F-CID-009 PDFs for parser tests | Not supplied                                  |

## Appendix F - Engineering Notes

- **Build order (suggested):** auth and sessions, then semesters and the shared subject form with manual save, then calculator and grade logic, then modules and planner, then PDF ingest (queue, worker, parser), then account export/delete and hardening. Manual entry ships before PDF so the product works without the parser.
- **Single schema:** use one validation schema for PDF-prefilled and manual forms, on client and server.
- **Pure functions:** keep grade computation and week calculation as pure, table-tested functions with `Decimal`, so threshold and boundary cases (exactly 60, empty outcomes, `d = 0`, last day) are unit-tested.
- **Consistency to resolve before build:** the diagram marks the grade scale as unconfirmed (D1) and `INTERVENTION_A` grade as a default (D3). Product owner sign-off is needed before the numeric grade is enabled.
- **Overlap to specify:** a skipped week that also has a plan row resolves to `NO_CLASS` (checked before the plan lookup); confirm this is intended.
- **Retry safety:** Replace and save must be idempotent end to end, including the score-copy step, since the client can retry up to 3 times.
- **Test priorities:** authorization on every route, enumeration-safe responses, upload abuse (spoofed headers, encrypted, huge, zip-bomb-like PDFs), concurrent duplicate saves, and version conflicts on scores.

## Appendix G - Project Guide: Tech Stack, Tools and Status

> Orientation for developers joining the project. Updated 2026-11-12. Versions come from `goldensync-web/package.json`.
> The full technical design is in `system-architecture.md`; this appendix only tells you what exists and where to look.

### G.1 Project at a glance

| Area | Status (2026-11-12) |
| --- | --- |
| Product definition | Done: draw.io system plan v2 (4 pages of flows plus legend, change log, data and routes) |
| Design system and rules | Done: `DESIGN_RULES.md`, `system-ui-context.md` |
| Figma clickable prototype | **In progress**: milestones M0 to M4 done (tokens, 37 components, all Auth screens and flows). M5 (Dashboard and Add Subject) at piece 5.4 of 26. M6 to M10 not started |
| Architecture | Written, status **Proposed** (owner decisions pending, see G.7) |
| Web app code | **Setup only**: Next.js app scaffolded with UI libraries installed. No GoldenSync screens, API, database or auth wired yet |
| Local environment | Dockerized (see G.5) |

### G.2 Repository map

| Path | What it holds |
| --- | --- |
| `goldensync-web/` | The Next.js app. The **only** npm project in the repo |
| `goldensync-web/app/` | App Router pages and layouts (currently the starter page and `globals.css` theme) |
| `goldensync-web/components/ui/` | 22 shadcn components + 7 Magic UI components |
| `goldensync-web/lib/` | Shared helpers (`utils.ts` with `cn()`) |
| `goldensync-web/Dockerfile`, `.dockerignore` | Container build (dev and production targets) |
| `compose.yaml` (repo root) | Docker Compose services: `web` (dev), `web-prod`, `npm` (tooling) |
| `context/general-context/` | Product overview (this file), architecture, progress tracker, superseded v1 workflow rules |
| `context/prototype-plan/` | Figma build spec, design rules, UI context, master prompt, resume summary (`summary-for-next-session/system-summary.md`) |
| `prototype-goldensync/` | draw.io system plan v2 (source of truth) and the piece-by-piece Figma build sequence |
| `prisma.config.ts` (repo root) | Prisma **skills** config for AI agents only. Not a database config |
| `.cursor/`, `.claude/`, `.agents/`, `.devin/` | AI agent skills and rules (Prisma skills synced by `postinstall`) |

### G.3 Tech stack installed now

| Layer | Package (version) | Status |
| --- | --- | --- |
| Runtime | Node.js 24 (Docker image `node:24-bookworm-slim`), npm 11 | In use |
| Framework | `next` 16.4.6 (App Router, Turbopack, `cacheComponents` and `partialPrefetching` on, `output: "standalone"`) | Configured |
| UI runtime | `react`, `react-dom` 19.3.0 | In use |
| Language | TypeScript 5 (`strict`) | In use |
| Styling | `tailwindcss` 4.3.3, `@tailwindcss/turbopack`, `tw-animate-css` | Configured, design tokens not yet mapped |
| Component kit | `shadcn` 4.23 (style `base-nova` on `@base-ui/react` 1.9), `class-variance-authority`, `clsx`, `tailwind-merge` | Installed |
| Effects | Magic UI components (animated-beam, animated-gradient-text, blur-fade, border-beam, number-ticker, particles, shimmer-button) | Installed |
| Icons | `lucide-react` 1.71 (primary), `react-bootstrap-icons` 1.11 | Installed |
| Animation | `motion` 14.12, `animejs` 4.5 | Installed |
| Auth | `@clerk/nextjs` 7.9 | Installed, **not configured** (no keys, provider or `proxy.ts`) |
| Database tooling | `prisma` 8.0.0-rc.33 (CLI only) | **No client, schema or database yet** |
| Forms and validation | `react-hook-form` 7.91, `zod` 4.6, `@hookform/resolvers` 7.0 | Installed |
| Client state | `zustand` 5.1 | Installed |
| Tables | `@tanstack/react-table` 9.3 | Installed |
| PDF | `react-dropzone` 20.2 (upload UI), `pdf-parse` 2.4 (server only) | Installed |
| UI utilities | `sonner` (toasts), `date-fns`, `react-day-picker`, `cmdk`, `next-themes` | Installed |
| Quality | `eslint` 9 + `eslint-config-next` + `eslint-plugin-jsx-a11y`, `prettier` 3.9 + Tailwind plugin, `@lhci/cli` 0.16 (Lighthouse CI) | ESLint configured; Prettier and Lighthouse have no config yet |

### G.4 Tech stack planned, not installed yet

From `system-architecture.md` section 3.2.

| Layer | Technology | Role |
| --- | --- | --- |
| Hosting | Vercel | Production and per-PR preview deploys |
| Database | PostgreSQL (managed, pooled) + Prisma client | All structured data; raw SQL migrations for partial unique indexes |
| Background jobs | Trigger.dev | Durable syllabus PDF parsing and scheduled cleanup |
| File hand-off | Vercel Blob (private store) | PDF kept only between upload and parsing, then deleted |
| Numerics | decimal.js (Prisma `Decimal`) | All score and percent math |
| Data fetching | TanStack Query | Ingest polling and client reads |
| Email | Through Clerk | Verification and password reset |
| Observability | Pino (JSON logs), Sentry, Trigger.dev dashboard | Logs, errors, task runs |
| Testing | Vitest, Playwright (+ axe), Testcontainers or CI Postgres, k6 | Unit, integration, authorization matrix, E2E, accessibility, load |
| CI/CD | Typecheck, lint, tests, migration check, build, E2E smoke, secret scan | Quality gates in architecture section 15.4 |

### G.5 Development environment

| Task | Command (from the repo root) |
| --- | --- |
| Start the app with live sync | `docker compose watch`, then open http://localhost:3000 |
| Stop it | `Ctrl+C`, then `docker compose down` |
| Add a package | `docker compose run --rm npm install <package>` |
| Production build preview | `docker compose --profile prod up --build web-prod`, then http://localhost:3001 |
| Remove all project containers and images | `docker compose --profile prod --profile tools down --rmi all --volumes` |

- `node_modules` and `.next` live inside Docker, not on the host. Edit source files on the host as usual; Compose copies changes into the container.
- Run npm commands inside Docker (or from `goldensync-web/` if you work without Docker). There is no `package.json` at the repo root.
- Never run `npm audit fix --force`, and do not run `npm audit fix` while on the Prisma 8 RC (it loops).

### G.6 Design and planning tools

| Tool | Used for |
| --- | --- |
| draw.io (diagrams.net) | `GoldenSync-System-Plan-v2.drawio`: flows, screens, limits, message copy. **Source of truth** |
| Figma (Design file `GoldenSync Prototype v1`, key `ySMbVLRvKGQvjaGm3ihm7P`, team plan OG) | Token system, component library and clickable prototype |
| Figma MCP server | Lets the Cursor agent build and audit the Figma file |
| Cursor (AI agent) | Builds the prototype piece by piece and keeps the tracker up to date |
| Docker Desktop + Docker Compose | Local runtime for the web app |

Document precedence when sources disagree: **draw.io > `DESIGN_RULES.md` > `figma-prototype-system-plan.md` > `system-ui-context.md`**. `system-ai-workflow-rules.md` is v1 and superseded.

### G.7 Known mismatches and open decisions to know before coding

- **Auth approach:** this overview and the draw.io describe custom auth (argon2id, server-side sessions, own throttling). `system-architecture.md` proposes **Clerk** instead (ADR-001, owner question Q2). Confirm before building Page 1.
- **Package manager:** the architecture names pnpm; the project currently uses **npm** (`package-lock.json`).
- **Accent color:** an older stack note mentions CSU green; `DESIGN_RULES.md` uses a blue accent (architecture Q6).
- **Subject limit:** 20 active subjects per semester (v2) vs 10 in an earlier draft (architecture Q1). Implemented as one constant.
- **Open product decisions D1 to D7** (Appendix E), including the official grade table, allowed email domains, hosting and email provider, and real F-CID-009 PDFs for parser tests.
- **Seed data** in the Figma prototype is invented and must be replaced with real F-CID-009 content.
- **Repo on a USB drive (`E:`)** makes installs slow; moving it to an internal drive is recommended.
