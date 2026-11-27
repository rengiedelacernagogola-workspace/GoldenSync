// WHAT: Validate server environment variables (database, Clerk, optional Blob/Trigger).
// HOW: getServerEnv() Zod-parses process.env; throws at import time if required keys missing.
// EDIT: serverEnvSchema when new secrets become mandatory.
// KEEP: Server-only — never import from client components.
// RISK: High — wrong or missing env breaks auth, DB, and production deploys.

import "server-only";

/**
 * Server env validation (architecture §15 / Phase 0).
 * Fail fast on missing Clerk or DATABASE_URL when modules import this.
 */

import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  /** Comma-separated domains; empty = no domain gate yet (open item D5). */
  ALLOWED_EMAIL_DOMAINS: z.string().optional().default(""),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  CLERK_WEBHOOK_SECRET: z.string().optional(),
  TRIGGER_SECRET_KEY: z.string().optional(),
  TRIGGER_PROJECT_REF: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

/** Parsed server env — throws ZodError if required keys are missing. */
export function getServerEnv(): ServerEnv {
  return serverEnvSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    ALLOWED_EMAIL_DOMAINS: process.env.ALLOWED_EMAIL_DOMAINS ?? "",
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
    TRIGGER_SECRET_KEY: process.env.TRIGGER_SECRET_KEY,
    TRIGGER_PROJECT_REF: process.env.TRIGGER_PROJECT_REF,
  });
}

/** True when Blob client uploads can be issued. */
export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** True when Trigger.dev can accept task triggers. */
export function isTriggerConfigured(): boolean {
  return Boolean(process.env.TRIGGER_SECRET_KEY);
}

/** Allowed email domains list (lowercase). Empty when D5 unset. */
export function allowedEmailDomains(): string[] {
  const raw = process.env.ALLOWED_EMAIL_DOMAINS ?? "";
  return raw
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
}
