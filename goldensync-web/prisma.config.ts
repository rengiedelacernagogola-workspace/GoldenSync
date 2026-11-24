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
