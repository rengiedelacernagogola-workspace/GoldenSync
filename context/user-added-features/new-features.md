Update this file everytime there is added new features that not in the prototype:

#purpose: 
- state its name where its found files.
- purpose, what it can do and how it affect the system.

#who added:
- name

-------------------------------------------------------------------------

## Subject card segmented progress ring

- **Files:** `goldensync-web/components/core/subject-card.tsx` · `segmented-ring-progress.tsx` · `app/(app)/dashboard/page.tsx`
- **Purpose:** Every dashboard subject card shows a centered circular segmented progress ring (18 ticks, % + “progress”), compact sharp typography. Live subjects fill the ring from checklist done counts via `fetchSubjectDetail`.
- **Who added:** rengie (owner request)

## Outcome map table (Outcomes)

- **Files:** `goldensync-web/components/core/outcome-map.tsx` · `goldensync-web/app/(app)/subjects/[subjectId]/outcomes/page.tsx`
- **Purpose:** Outcome map card is half-width on desktop and shows CO→PO links as a compact table (11px): CO · Course outcome · Level (I/E/D) · PO, with PEO/PO chip strips. Hover a row still highlights linked POs.
- **Who added:** rengie (owner request)

## Manual checklist (Checklist page)

- **Files:** `goldensync-web/components/features/checklist/manual-checklist-card.tsx` · `goldensync-web/lib/checklist/manual-items.ts` · `goldensync-web/app/(app)/subjects/[subjectId]/checklist/page.tsx`
- **Purpose:** Below the week table, users can add their own checklist items (title + optional detail). Tick done independently of week rows (never feeds Calculator). Each item has **⋯** that fades **Edit / Delete** in (same toggle/fade pattern as All notes); click **⋯** again to hide. Edit opens inline Save/Cancel. Persisted via `/api/subjects/:id/manual-checklist` → `ManualChecklistItem` (Postgres); add/edit/delete also log to activity notifications.
- **Who added:** rengie (owner request)

## Dashboard notifications + theme toggle

- **Files:** `goldensync-web/components/core/top-bar.tsx` · `notifications-menu.tsx` · `theme-toggle.tsx` · `lib/theme.ts` · `lib/activity/activity-log.ts` · `app/globals.css` · `app/layout.tsx` · `app-shell.tsx`
- **Purpose:** Top bar bell opens a dropdown of notifications/activity via `/api/activity` → `ActivityEvent`. Sun/Moon toggles light/dark (`gs-theme` client-only, `html.dark`). Main content has top padding under the header so subject cards aren’t flush. Actions like add/archive/delete subject and create semester append activity items.
- **Who added:** rengie (owner request)

## Study streak badge (TopBar)

- **Files:** `components/core/streak-badge.tsx` · `lib/streak.ts` · `components/core/top-bar.tsx`
- **Purpose:** Beside the notifications bell: Flame icon (same `size-4` as the bell) + small “N day(s)” label for consecutive Asia/Manila study days. Client-only localStorage streak; increments on daily visit.
- **Who added:** rengie (owner request)

## All notes library (Learning Plan) — superseded

- **Files:** (historical) notes lived on Learning Plan page
- **Purpose:** Replaced by global **Notes** hub (see below). Learning Plan is weeks-only.
- **Who added:** rengie (owner request)

## Global Notes hub (sidebar Notes)

- **Files:** `app/(app)/notes/page.tsx` · `app/api/notes/route.ts` · `lib/services/plan-notes.ts` (`listAllPlanNotesForUser`) · `components/core/sidebar.tsx` · `lib/nav.ts` · `app/(app)/subjects/[subjectId]/plan/page.tsx`
- **Purpose:** Sidebar splits **Learning Plan** (week table) and **Notes** (StickyNote). Notes is a cross-subject note-taker: pick any subject, write/save, library lists notes from all subjects with course-code tags + filter. `GET /api/notes` aggregates `PlanNote` rows; create/update/delete still use `/api/subjects/:id/notes`.
- **Who added:** rengie (owner request)

## Notes shelf (Archived · Deleted · History)

- **Files:** `components/features/plan/notes-library-card.tsx` · `lib/services/plan-notes.ts` · `prisma/contract.prisma` (`PlanNote.deletedAt`) · `prisma/sql/2026-11-21-plan-note-deleted-at.sql` · `lib/jobs/purge.ts` · `lib/config/limits.ts` (`NOTE_SOFT_DELETE_DAYS: 30`) · `app/(app)/notes/page.tsx`
- **Purpose:** All notes card footer bar opens **Archived**, **Deleted**, and **History** shelves. Delete is soft (`deletedAt`); restore returns notes to active. Soft-deleted notes show days left and are hard-purged after 30 days via `purgeSoftDeletedPlanNotes`.
- **Who added:** rengie (owner request)

## Production storage cutover (DB-002)

- **Files:** `prisma/contract.prisma` · `prisma/sql/2026-11-21-constraints-and-grade-scale.sql` · `lib/services/{plan-notes,manual-checklist,activity,outcome-links}.ts` · `app/api/subjects/[id]/{notes,manual-checklist,outcome-links}/**` · `app/api/activity/route.ts` · `lib/jobs/purge.ts` · `context/database-context/database-tracker.md`
- **Purpose:** Product data (notes, manual checklist, activity, outcome links, idempotency keys) lives in Postgres. Local Docker schema updated; UI cut over off localStorage. Neon apply + GradeScale confirm still pending owner secrets.
- **Who added:** rengie (owner request — finish without approval waits)

## Shared PlanWeek checklist (manual + syllabus)

- **Files:** `lib/domain/plan-skeleton.ts` · `lib/domain/syllabus-plan.ts` · `lib/services/plan-skeleton.ts` · `lib/services/subjects.ts` · `lib/services/ingest-process.ts` · `app/api/subjects/[id]/plan/skeleton/route.ts` · `app/(app)/subjects/[subjectId]/checklist/page.tsx` · `components/features/checklist/checklist-empty-panel.tsx` · `components/features/add-subject/add-subject-modal.tsx` · `app/(app)/subjects/[subjectId]/plan/page.tsx`
- **Purpose:** Checklist weeks always come from `PlanWeek` + `ChecklistItem.done` (never Calculator). **Manual create** writes a blank week skeleton from semester start/end dates. **Syllabus upload** heuristically extracts “Week N …” topics into the ingest draft and overlays them on the same skeleton at confirm. Live subjects never show ITE-14 seed rows; empty plan shows Generate study weeks / Open Learning Plan. Manual checklist card stays for freeform todos. `POST /api/subjects/:id/plan/skeleton` backfills older subjects.
- **Who added:** rengie (owner request)

## Production prep (GradeScale + cron purge + health)

- **Files:** `prisma/sql/2026-11-23-grade-scale-confirm.sql` · `lib/jobs/purge.ts` · `lib/http/cron-auth.ts` · `app/api/cron/purge/route.ts` · `vercel.json` · `app/api/health/route.ts` · `docs/production-deploy-checklist.md` · `.env.example`
- **Purpose:** Neon GradeScale **confirmed**; daily Vercel Cron purge (activity / idempotency / drafts / soft-deleted notes / ingest results / expired archives) behind `CRON_SECRET`; `GET /api/health?deep=1` checks DB + scale. Owner still sets Vercel/Clerk Production secrets per checklist.
- **Who added:** rengie (owner request)

## Editable Learning Plan (week checklist fields)

- **Files:** `prisma/contract.prisma` (`PlanWeek.outcome|activities|status`) · `prisma/sql/2026-11-21-plan-week-editable.sql` · `lib/validation/plan.ts` · `lib/services/plan.ts` · `lib/services/checklist.ts` · `lib/services/mappers.ts` · `lib/domain/plan-skeleton.ts` · `components/features/plan/editable-plan-table.tsx` · `app/(app)/subjects/[subjectId]/plan/page.tsx` · checklist page rows
- **Purpose:** Learning Plan is user-editable: **Add Templates**, **Duplicate** (same week # — multiple topics/outcomes/activities per week), edit week fields, aligned checklist-style **status**. Save replaces `PlanWeek` via `PUT /api/subjects/:id/plan`. DB allows duplicate `weekNumber` per subject (`position` orders rows; unique constraint dropped — `2026-11-21-plan-week-duplicate.sql`). Checklist `done` for a week = all non–No-class rows that week are Done. Never feeds Calculator.
- **Who added:** rengie (owner request)

## E2E first-user finding fixes

- **Files:** `add-subject-modal.tsx` · `use-live-subject.ts` · `plan.ts` · `checklist.ts` · `proto-fab.tsx` · `mobile-drawer.tsx` · `card.tsx` · `subject-card.tsx` · `stepper.tsx` · `streak-badge.tsx` · plan/checklist pages · dashboard
- **Purpose:** Open Overview navigates to the created subject; live `semesterLabel` from API (no seed AY flash); plan/checklist wait for ready (no ITE-14 flash); `plan_replace` avoids Neon txn rollback failures; Proto only on `/dev/*` after mount; drawer nav defers close; Active SubjectCard clicks work; checklist Done uses `planWeekId` for duplicate week rows; success banner hides Retry; Manual tab skips empty intro; stepper labels don’t truncate “Grading”; streak waits for mount (no 0↔N flicker).
- **Who added:** rengie (owner request)

## ProtoFab Suspense (Next 16 prerender)

- **Files:** `goldensync-web/components/dev/proto-fab.tsx`
- **Purpose:** `usePathname()` wrapped in `<Suspense>` so root layout does not block prerender (`Blocking Route` on `/subjects/[subjectId]/plan` and others). Still `/dev/*` only, after mount, absent in production.
- **Who added:** rengie (owner request)

## Neon SQL dumps (read / pgAdmin)

- **Files:** `docs/database/goldensync-neondb-full-2026-11-23-050854.sql` · `docs/database/goldensync-neondb-for-pgadmin.sql` · Desktop `goldensync-neondb-for-pgadmin.sql`
- **Purpose:** Exact snapshot of live Neon `neondb` for offline reading. Use `*-for-pgadmin.sql` (INSERTs, no `\restrict`). pgAdmin ERD still needs a live Neon server registration (deferred — `docs/NEXT-SESSION.md`).
- **Who added:** rengie (owner request)

