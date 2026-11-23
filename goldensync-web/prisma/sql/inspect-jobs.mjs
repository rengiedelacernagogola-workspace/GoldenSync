import pg from "pg";

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
const r = await client.query(
  `SELECT id, status, "errorCode", "blobPathname",
          left(coalesce("result"::text, ''), 500) AS result
   FROM "IngestJob"
   ORDER BY "createdAt" DESC
   LIMIT 5`,
);
console.log(JSON.stringify(r.rows, null, 2));
await client.end();
