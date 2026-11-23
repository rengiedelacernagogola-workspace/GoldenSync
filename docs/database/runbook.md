# Database runbook (Neon)

**Piece:** DB-001 skeleton — expand when D1+ lands.  
**Never paste connection strings into this file.**

---

## 1. Environments

| Env | Neon branch | App URL use |
| --- | ----------- | ----------- |
| Production | `main` | Vercel Production `DATABASE_URL` (pooled) + `DIRECT_URL` |
| Preview / staging | `develop` | Vercel Preview |
| Experiment | throwaway from `develop` | Local / one-off |
| Local demo | Docker `goldensync-pg` | Offline only — not prod truth |

---

## 2. Migrate (develop first)

```bash
cd goldensync-web
# DIRECT_URL = Neon direct (sslmode=require); never pooled for migrate
npx prisma migrate deploy
# or project-equivalent Prisma 8 migrate command
npx prisma migrate diff   # expect no drift vs contract
```

- Rehearse on empty Neon branch AND on current `develop`.
- Production `main`: owner explicit “go” only; record timeline bookmark in tracker §18.

## 3. Rollback

1. Prefer **forward fix** migration.  
2. If catastrophic: Neon **PITR / branch restore** to bookmark taken before apply; redeploy previous app release.  
3. Never edit an applied migration file.

## 4. Rotate secrets

1. Neon reset password / new role password.  
2. Update Vercel + local `.env.local`.  
3. Redeploy. Revoke old credential.  
4. Same for Blob token and Clerk webhook secret.

## 5. Purge jobs

Wired: `GET/POST /api/cron/purge` + `vercel.json` cron `0 16 * * *` (Bearer `CRON_SECRET`).

| Sweep | Retention |
| ----- | --------- |
| ActivityEvent | 90 days |
| IdempotencyKey | 24 hours |
| Draft | `expiresAt < now` |
| PlanNote soft-delete | `NOTE_SOFT_DELETE_DAYS` (30) |
| IngestJob.result | cleared after `INGEST_RESULT_TTL_HOURS` (24) |
| Archived Subject | hard-delete after `ARCHIVE_RESTORE_DAYS` (30) |

Still deferred: orphan Blob sweeper.

Manual test:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://YOUR_APP/api/cron/purge
```

## 6. Health checks

- `GET /api/health` — liveness  
- `GET /api/health?deep=1` — DB ping + `gradeScaleConfirmed`  
- Neon dashboard: connections, storage, compute.

## 7. Restore drill

| Field | Value |
| ----- | ----- |
| Last drill date | _(none yet)_ |
| Branch / bookmark | |
| Operator | |
| Result | |

Procedure (fill after first drill): create restore branch from PITR → point throwaway app env → smoke CRUD → delete branch → log §16 + §18.
