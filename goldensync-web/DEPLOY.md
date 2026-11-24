# GoldenSync — production deploy checklist

Not optional for a working Production deploy. Local USB/FAT32 issues do **not** apply on Vercel/Linux.

## 1. Secrets (Vercel → Project → Settings → Environment Variables)

Copy from `.env.example`. Set for **Production** (and Preview if you use it):

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | yes | **Production** Clerk key |
| `CLERK_SECRET_KEY` | yes | **Production** Clerk secret |
| `DATABASE_URL` | yes | Neon connection (prefer unpooled for Prisma Composer) |
| `DIRECT_URL` | recommended | Same DB direct URL for SQL scripts |
| `NEXT_PUBLIC_APP_URL` | yes | `https://your-domain.vercel.app` (not localhost) |
| `CLERK_WEBHOOK_SECRET` | recommended | From Clerk webhook endpoint |
| `CRON_SECRET` | recommended | Random string; Vercel Cron sends `Authorization: Bearer …` |
| `BLOB_READ_WRITE_TOKEN` | for PDF ingest | Vercel Blob store token |
| `TRIGGER_*` | optional | Only if using Trigger.dev |

Check locally (never prints values):

```bash
npm run deploy:check-env
```

## 2. Database

Against the **production** Neon DB:

```bash
# From goldensync-web, with DATABASE_URL / DIRECT_URL set to prod
npm run db:init
npm run db:verify
npm run db:apply-constraints
```

## 3. Clerk Production

1. Clerk Dashboard → **Production** instance.
2. Allowed origins / redirect URLs include your Vercel URL.
3. Webhooks → endpoint `https://<host>/api/webhooks/clerk` → events at least `user.deleted` → copy signing secret to `CLERK_WEBHOOK_SECRET`.

## 4. Vercel

1. Import repo; **Root Directory** = `goldensync-web`.
2. Framework: Next.js; build `npm run build`; output default.
3. Add env vars (step 1).
4. Deploy. Confirm `GET /api/health` returns OK.
5. Cron is already in `vercel.json` (`/api/cron/purge`).

## 5. Blob (syllabus PDF)

Vercel → Storage → Blob → create store → set `BLOB_READ_WRITE_TOKEN`.

Without it, sign-in and subjects still work; PDF ingest/upload will fail.

## 6. Docker (optional)

```bash
docker build -t goldensync-web .
# Dockerfile sets GOLDENSYNC_STANDALONE=1 for the builder stage.
```

## 7. Smoke test

1. Sign in / sign up  
2. Create semester  
3. Add subject  
4. Open Overview / Outcomes  
5. (Optional) upload syllabus PDF  

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs lint, unit tests, `tsc`, and `next build` on push/PR.
