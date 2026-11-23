# Next session handoff — 2026-11-23 (shutdown)

Read this first after reboot. Prefer action over approval waits (owner standing order).

## Where we left off

App is on **Neon** (not local Docker). Local Next app: `goldensync-web/`. Env: `goldensync-web/.env.local`.

**Done this stretch**
- Editable Learning Plan (duplicate week #, status, templates) + Neon SQL
- Production prep: GradeScale confirmed, cron purge, deep health, deploy checklist
- E2E first-user findings fixed (Open Overview, semesterLabel, seed flash, plan_replace no txn, Proto `/dev` + Suspense, drawer/card nav, checklist `planWeekId`, success banner, Manual skip intro, stepper, streak)
- Full Neon SQL dumps for reading / pgAdmin (see below)

**Not done (owner)**
- **BLOCK-04:** Vercel + Clerk **Production** secrets (see `docs/production-deploy-checklist.md`)
- pgAdmin: register Neon server → Generate ERD (deferred — “set it up later”)
- Optional re-smoke of create → plan → checklist after reboot

## Neon / pgAdmin (deferred)

Connection is good (`neondb` · 19 public tables). ERD needs a **live server**, not a `.sql` file.

Use host / user / password from `goldensync-web/.env.local` → `DIRECT_URL` (never commit that file). SSL: Require.

**Dumps (gitignored — contain live PII; keep local only):**
- Desktop: `goldensync-neondb-for-pgadmin.sql`
- Local copies under `docs/database/goldensync-neondb-*.sql` (ignored by root `.gitignore`)

Mermaid ERD (already in repo): `docs/database/erd.md`

## Start commands

```powershell
cd "e:\Agentic Projects\GoldenSync-dev\goldensync-web"
npm run dev
# or webpack if needed:
# npx next dev --webpack
```

Health: `http://localhost:3000/api/health?deep=1` (Neon cold start can take ~1 min).

## Key files changed recently

| Area | Paths |
| ---- | ----- |
| Plan replace (no long txn) | `lib/services/plan.ts` |
| Checklist per-row sync | `lib/services/checklist.ts` · `lib/validation/checklist.ts` · checklist page |
| Add subject → Overview | `components/features/add-subject/add-subject-modal.tsx` · dashboard |
| Live subject UX | `hooks/use-live-subject.ts` · plan/checklist pages |
| Proto / prerender | `components/dev/proto-fab.tsx` (Suspense + `/dev` only) |
| Card / drawer / streak / stepper | `card.tsx` · `mobile-drawer.tsx` · `streak-badge.tsx` · `stepper.tsx` |
| Features log | `context/user-added-features/new-features.md` |
| DB tracker | `context/database-context/database-tracker.md` |
| Prod checklist | `docs/production-deploy-checklist.md` |

## Suggested next actions (priority)

1. Owner: fill Vercel/Clerk Production env (BLOCK-04) → deploy → smoke checklist §5  
2. Optional: pgAdmin → Register Neon → Generate ERD; refresh Mermaid in `erd.md` if schema drifted  
3. Re-run first-user path: create subject → Open Overview → Learning Plan duplicate/save → Checklist tick one of two same-week rows  
4. If plan save fails again: check Neon pooler / cold start; `plan.ts` already avoids long transactions  

## Do not

- Commit `.env.local` or dump files with live emails if pushing public  
- Expect pgAdmin **Restore** to accept plain `.sql` (use Query Tool + `*-for-pgadmin.sql`, or connect live)  
- Flash ITE-14 seed on signed-in live subject URLs (fixed in `use-live-subject`)  

---

*Written 2026-11-23 ~05:40 UTC+8 before system shutdown.*  
*Woke 2026-11-23 ~11:57 UTC+8 — Neon OK (GradeScale confirmed, 2 subjects, 19 tables); start `npm run dev:webpack` in `goldensync-web/`.*
