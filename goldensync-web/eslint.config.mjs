// WHAT: ESLint rules for the Next.js app (TypeScript + Core Web Vitals presets).
// HOW: `eslint-config-next` stacks with extra `globalIgnores` for build artifacts and Prisma emit.
// SCREEN: N/A — runs in editor and `npm run lint`.
// EDIT: Add rule overrides here; prefer Next defaults unless project needs an exception.
// KEEP: Ignore `.next`, Prisma `contract.d.ts/json` so lint doesn’t scan generated files.
// RISK: Low
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Prisma 8 contract emit artifacts:
    "lib/db/contract.d.ts",
    "lib/db/contract.json",
  ]),
]);

export default eslintConfig;
