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
