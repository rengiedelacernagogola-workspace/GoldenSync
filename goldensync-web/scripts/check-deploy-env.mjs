#!/usr/bin/env node
// WHAT: Pre-flight check that required Vercel/Clerk/Neon env keys exist (names only, no secrets).
// HOW: Parses `.env.local` / `.env`, classifies required/recommended/optional, exits 1 on missing required.
// SCREEN: N/A — run before deploy; see printed checklist for Clerk webhook + `db:apply-constraints`.
// EDIT: Add keys to `required` / `recommended` when new integrations ship.
// KEEP: Never logs secret values; flags placeholder strings as FAIL.
// RISK: Low — false PASS if vars exist but are invalid credentials.
/**
 * Deploy env readiness — prints pass/fail for required secrets (never values).
 * Usage: node scripts/check-deploy-env.mjs
 * Loads .env.local / .env if present (optional).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(name) {
  const file = path.join(root, name);
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const required = [
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "DATABASE_URL",
  "NEXT_PUBLIC_APP_URL",
];

const recommended = [
  "DIRECT_URL",
  "CLERK_WEBHOOK_SECRET",
  "CRON_SECRET",
  "BLOB_READ_WRITE_TOKEN",
];

const optional = ["TRIGGER_SECRET_KEY", "TRIGGER_PROJECT_REF", "ALLOWED_EMAIL_DOMAINS"];

function present(key) {
  const v = process.env[key];
  return typeof v === "string" && v.trim().length > 0;
}

function looksLikePlaceholder(key) {
  const v = (process.env[key] ?? "").toLowerCase();
  return (
    v.includes("placeholder") ||
    v.includes("xxxx") ||
    v.includes("changeme") ||
    v === "pk_test_ci_placeholder" ||
    v === "sk_test_ci_placeholder"
  );
}

let failed = 0;

console.log("GoldenSync deploy env check\n");

for (const key of required) {
  const ok = present(key) && !looksLikePlaceholder(key);
  if (!ok) failed += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  required   ${key}`);
}

for (const key of recommended) {
  const ok = present(key) && !looksLikePlaceholder(key);
  console.log(`${ok ? "PASS" : "WARN"}  recommended ${key}`);
}

for (const key of optional) {
  const ok = present(key);
  console.log(`${ok ? "PASS" : "SKIP"}  optional   ${key}`);
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
if (present("NEXT_PUBLIC_APP_URL") && /localhost|127\.0\.0\.1/.test(appUrl)) {
  console.log(
    "\nWARN  NEXT_PUBLIC_APP_URL points at localhost — use your production URL on Vercel.",
  );
}

console.log(
  "\nHost setup still required: Clerk Production instance + webhook → /api/webhooks/clerk,",
);
console.log("Neon schema (`npm run db:init` / `npm run db:apply-constraints`), Vercel Blob store.");

if (failed > 0) {
  console.error(`\n${failed} required env var(s) missing. See .env.example.`);
  process.exit(1);
}

console.log("\nRequired env keys present.");
process.exit(0);
