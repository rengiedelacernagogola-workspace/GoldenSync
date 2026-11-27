// WHAT: Prisma 8 CLI config — contract schema path, generated client output, DB URL.
// HOW: `definePrismaConfig` + `ormConfig` pointing at `prisma/contract.prisma` → `lib/db`.
// SCREEN: N/A — used by `prisma` npm scripts, migrate, and ORM in API routes.
// EDIT: `skills.agents` list, output path, or contract file location.
// KEEP: `DATABASE_URL` must be set in env; client emit goes to `lib/db` not `node_modules`.
// RISK: Medium — wrong URL or contract path breaks all DB access.
import "dotenv/config";
import { definePrismaConfig } from "@prisma/cli-engine";
import { defineConfig as ormConfig } from "@prisma/orm-postgres/config";

/**
 * Prisma 8 CLI — native PSL contract under prisma/; client artifacts in lib/db.
 */

export default definePrismaConfig({
  /** Agent skill sync (`npm run postinstall` → prisma skills sync). */
  skills: {
    agents: ["claude", "cursor", "agents", "devin"],
  },
  orm: ormConfig({
    contract: "./prisma/contract.prisma",
    output: "lib/db",
    db: {
      connection: process.env.DATABASE_URL!,
    },
  }),
});
