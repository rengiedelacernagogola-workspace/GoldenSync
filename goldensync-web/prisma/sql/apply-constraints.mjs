import fs from "node:fs";
import pg from "pg";

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("Missing DIRECT_URL / DATABASE_URL");
  process.exit(1);
}

const sql = fs.readFileSync(
  new URL("./2026-11-21-constraints-and-grade-scale.sql", import.meta.url),
  "utf8",
);

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
try {
  await client.query(sql);
  const bands = await client.query('SELECT count(*)::int AS bands FROM "GradeScale"');
  const meta = await client.query('SELECT confirmed FROM "GradeScaleMeta"');
  const idx = await client.query(
    "SELECT indexname FROM pg_indexes WHERE indexname = $1",
    ["subject_active_code_per_semester"],
  );
  const checks = await client.query(
    `SELECT conname FROM pg_constraint
     WHERE conname IN ('score_bounds_chk','semester_dates_chk','PlanNote_importance_chk')
     ORDER BY 1`,
  );
  console.log(
    JSON.stringify(
      {
        bands: bands.rows[0]?.bands,
        confirmed: meta.rows[0]?.confirmed ?? null,
        partialUnique: idx.rows[0]?.indexname ?? null,
        checks: checks.rows.map((r) => r.conname),
      },
      null,
      2,
    ),
  );
} finally {
  await client.end();
}
