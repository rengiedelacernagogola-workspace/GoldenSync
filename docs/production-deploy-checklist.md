# GoldenSync — Production deploy checklist

Use this before the first public deploy. Secrets never go in git.

## 1. Neon

- [x] Schema + constraints applied (DB-003)
- [x] PlanWeek editable + multi-row weeks SQL applied
- [x] `GradeScaleMeta.confirmed = true` (2026-11-23)
- [ ] Neon project PITR retention ≥ 7 days
- [ ] Note restore-drill date in `context/database-context/database-tracker.md` §7 / §18

## 2. Vercel project env (Production + Preview)

Set in Vercel → Settings → Environment Variables:

| Variable | Notes |
| -------- | ----- |
| `DATABASE_URL` | Neon **unpooled** URL + `sslmode=require` (same as local app) |
| `DIRECT_URL` | Same unpooled URL (migrations / tooling) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | **Production** Clerk key |
| `CLERK_SECRET_KEY` | **Production** Clerk secret |
| `CLERK_WEBHOOK_SECRET` | From Clerk webhook endpoint |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob read-write token |
| `CRON_SECRET` | Long random secret (enables `/api/cron/purge`) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard` |

Optional: `ALLOWED_EMAIL_DOMAINS` if you restrict sign-up.

Do **not** require Trigger.dev for syllabus parse — ingest runs in Next.js (`processIngestJob`).

## 3. Clerk Production

- [ ] Create/switch to **Production** instance
- [ ] Domains: add Vercel production URL
- [ ] Webhook → `https://YOUR_APP/api/webhooks/clerk` (at least `user.deleted`)
- [ ] Auth methods match product (email + password / magic link)

## 4. Cron

`vercel.json` schedules daily `GET /api/cron/purge` at `0 16 * * *` (16:00 UTC ≈ 00:00 Asia/Manila).

- [ ] `CRON_SECRET` set on Vercel
- [ ] After deploy, confirm Cron runs in Vercel → Cron Jobs (or hit the route with Bearer token once)

Purge covers: activity (90d), idempotency (24h), drafts, soft-deleted notes (30d), stale ingest results, archived subjects past restore window.

## 5. Smoke after deploy

```bash
curl -s https://YOUR_APP/api/health
curl -s "https://YOUR_APP/api/health?deep=1"
```

Expect `ok: true` and deep check `db: "ok"`, `gradeScaleConfirmed: true`.

Manual:

1. Sign up / sign in  
2. Create semester + subject (manual + PDF if Blob token set)  
3. Edit Learning Plan (duplicate week rows)  
4. Tick Checklist  
5. Add a Note  
6. Open Calculator — grades should release when scale is confirmed  

## 6. Still optional / later

- Neon `app_runtime` vs `app_migrator` roles  
- CI migrate/drift on PR  
- Full AuthZ matrix + E2E  
- Orphan Blob sweeper  
- Subject switcher on every module page  

---

## 7. Session note (2026-11-23 shutdown)

- Neon + GradeScale + cron code: **done**
- Local E2E finding fixes: **done** (see `context/user-added-features/new-features.md`)
- SQL dumps: `docs/database/goldensync-neondb-*.sql` (+ Desktop `*-for-pgadmin.sql`)
- **Still owner:** sections 2–4 (Vercel/Clerk Production + `CRON_SECRET`)
- Full handoff: `docs/NEXT-SESSION.md`

---

*Prepared 2026-11-23 — code + Neon GradeScale confirm done; Vercel/Clerk secrets remain owner steps.*
