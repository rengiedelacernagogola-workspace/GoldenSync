import "server-only";

// WHAT: Singleton Postgres client (Prisma ORM 8) for all server code.
// HOW: contract.json + DATABASE_URL env → postgres({ contract, url }).
// EDIT: Regenerate contract via prisma contract emit — never hand-edit contract.json.
// KEEP: Import db only from server-only modules (never client components).
// RISK: High — database credentials and connection pooling; misconfig breaks entire app.

/**
 * Prisma ORM 8 client singleton (architecture §4 `lib/db`).
 * FLOW: contract emit → import contract.json → postgres({ contract, url }).
 */

import "dotenv/config";
import postgres from "@prisma/orm-postgres/runtime";
import { contractFromJson } from "@prisma/orm-postgres/static";

import type { Contract } from "./contract";
import contractJson from "./contract.json" with { type: "json" };

export const contract = contractFromJson<Contract>(contractJson);

/** Process-wide Postgres client — one instance per serverless isolate. */
export const db = postgres({
  contract,
  url: process.env.DATABASE_URL!,
});
