#!/usr/bin/env node
// WHAT: Builds `Import.env` for Vercel dashboard bulk import from local env files.
// HOW: Merges `.env` + `.env.local`, fills defaults, auto-generates `CRON_SECRET` if missing.
// SCREEN: N/A — one-time / occasional deploy setup.
// EDIT: Extend `keys` list when Vercel needs more variables.
// KEEP: Does not echo values to console beyond file write; missing keys set exitCode 1.
// RISK: Medium — generated file contains secrets; don’t commit `Import.env` to git.
/**
 * Build Import.env for Vercel "Import .env" from local .env / .env.local.
 * Never prints secret values.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function load(name) {
  const file = path.join(root, name);
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i <= 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

const env = { ...load(".env"), ...load(".env.local") };
const keys = [
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
  "NEXT_PUBLIC_CLERK_SIGN_UP_URL",
  "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL",
  "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL",
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXT_PUBLIC_APP_URL",
  "CRON_SECRET",
];
const defaults = {
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: "/sign-in",
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: "/sign-up",
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: "/dashboard",
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: "/dashboard",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
};

const missing = [];
const lines = [];
for (const k of keys) {
  let v = env[k] ?? defaults[k] ?? "";
  if (k === "CRON_SECRET" && !v) {
    v = crypto.randomBytes(32).toString("hex");
  }
  if (k === "DIRECT_URL" && !v && env.DATABASE_URL) {
    v = env.DATABASE_URL;
  }
  if (!v) missing.push(k);
  lines.push(`${k}=${v}`);
}

const outPath = path.join(root, "Import.env");
fs.writeFileSync(outPath, `${lines.join("\n")}\n`, "utf8");
console.log(`Wrote ${outPath}`);
console.log(
  "Filled:",
  keys.filter((k) => !missing.includes(k)).join(", ") || "(none)",
);
console.log("Missing:", missing.length ? missing.join(", ") : "(none)");
if (missing.length) process.exitCode = 1;
