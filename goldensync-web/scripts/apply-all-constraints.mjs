#!/usr/bin/env node
/**
 * Apply SQL constraint scripts in order against DIRECT_URL / DATABASE_URL.
 * Safe to re-run if scripts use IF NOT EXISTS / idempotent DDL.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("Missing DIRECT_URL / DATABASE_URL");
  process.exit(1);
}

const sqlDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../prisma/sql");

const files = [
  "2026-11-21-constraints-and-grade-scale.sql",
  "2026-11-21-plan-note-deleted-at.sql",
  "2026-11-21-plan-week-duplicate.sql",
  "2026-11-21-plan-week-editable.sql",
  "2026-11-23-checklist-item-unique.sql",
  "2026-11-23-grade-scale-confirm.sql",
  "2026-11-26-grade-scale-detailed.sql",
  "2026-11-26-missing-plan-indexes.sql",
];

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
try {
  for (const name of files) {
    const full = path.join(sqlDir, name);
    if (!fs.existsSync(full)) {
      console.warn(`skip missing ${name}`);
      continue;
    }
    const sql = fs.readFileSync(full, "utf8");
    process.stdout.write(`apply ${name}… `);
    await client.query(sql);
    console.log("ok");
  }
  console.log("All constraint scripts applied.");
} finally {
  await client.end();
}
