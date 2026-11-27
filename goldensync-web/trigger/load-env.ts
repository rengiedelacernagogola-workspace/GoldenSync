// WHAT: Loads `.env.local` / `.env` for Trigger worker and picks the correct Neon database URL.
// HOW: dotenv with override rules; `databaseUrlForWorker` prefers `DIRECT_URL` over pooled `DATABASE_URL`.
// SCREEN: N/A — worker DB access for ingest task and other Trigger jobs.
// EDIT: Env file order or URL selection if hosting changes.
// KEEP: Unpooled/direct URL required — Neon pooler rejects Prisma startup options.
// RISK: Medium — missing DIRECT_URL may connect through pooler and fail at runtime.
/**
 * Load env for Trigger worker — prefer .env.local (Next convention) over .env.
 * Prisma on Neon must use the unpooled URL (pooler rejects Prisma startup options).
 */

import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const localPath = resolve(root, ".env.local");
const envPath = resolve(root, ".env");

if (existsSync(localPath)) {
  config({ path: localPath, override: true });
}
if (existsSync(envPath)) {
  config({ path: envPath, override: false });
}

/** Prefer direct/unpooled Neon URL for Prisma ORM. */
export function databaseUrlForWorker(): string {
  const direct = process.env.DIRECT_URL?.trim();
  const pooled = process.env.DATABASE_URL?.trim();
  const url = direct || pooled;
  if (!url) {
    throw new Error(
      "Missing DIRECT_URL / DATABASE_URL for Trigger worker. Set unpooled Neon URL in .env.local (local) or Trigger dashboard env (deploy).",
    );
  }
  return url;
}
