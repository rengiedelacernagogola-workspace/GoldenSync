// WHAT: Trigger.dev v3 project settings (runtime, retries, task folder).
// HOW: `defineConfig` with `dirs: ["./trigger"]` so tasks like `ingest-syllabus` deploy.
// SCREEN: N/A — background workers; ingest job cleanup when legacy queue fires.
// EDIT: `project` ref from env, `maxDuration`, retry policy.
// KEEP: Set `TRIGGER_PROJECT_REF` in Vercel/Trigger dashboard after login.
// RISK: Medium — wrong project ref deploys tasks to the wrong Trigger project.
import { defineConfig } from "@trigger.dev/sdk/v3";

/** Trigger.dev project config — set TRIGGER_PROJECT_REF after `npx trigger.dev login`. */
export default defineConfig({
  project: process.env.TRIGGER_PROJECT_REF ?? "proj_goldensync",
  runtime: "node",
  logLevel: "info",
  maxDuration: 300,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10_000,
      factor: 2,
    },
  },
  dirs: ["./trigger"],
});
