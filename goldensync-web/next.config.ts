// WHAT: Next.js build/runtime settings — redirects, standalone output, packages, Turbopack CSS.
// EDIT: redirects() for old URL paths; env GOLDENSYNC_STANDALONE=1 for Docker trace layout.
// KEEP: serverExternalPackages for pdf/canvas/prisma — build breaks if removed wrongly. RISK: High — deployment.

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Standalone tracing uses filesystem junctions (breaks on FAT32 USB).
   * Enable with GOLDENSYNC_STANDALONE=1 (Docker/CI sets this). Vercel ignores it.
   */
  ...(process.env.GOLDENSYNC_STANDALONE === "1"
    ? { output: "standalone" as const }
    : {}),
  /** Old Proto auth URLs → Clerk (CDEC-016). */
  async redirects() {
    return [
      { source: "/login", destination: "/sign-in", permanent: true },
      { source: "/register", destination: "/sign-up", permanent: true },
      {
        source: "/forgot-password",
        destination: "/sign-in",
        permanent: true,
      },
      {
        source: "/reset-password",
        destination: "/sign-in",
        permanent: true,
      },
      { source: "/verify", destination: "/sign-in", permanent: true },
      {
        source: "/subjects/:subjectId/grading",
        destination: "/grading-system?subject=:subjectId",
        permanent: false,
      },
      {
        source: "/subjects/:subjectId/assessments",
        destination: "/calculator?subject=:subjectId",
        permanent: false,
      },
      {
        source: "/subjects/:subjectId/policies",
        destination: "/subjects/:subjectId/faculty",
        permanent: false,
      },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  serverExternalPackages: [
    "pg",
    "postgres",
    "@prisma/orm-postgres",
    "@prisma/orm-framework",
    /** pdf-parse/pdfjs break under webpack ESM interop (Object.defineProperty). */
    "pdf-parse",
    "pdfjs-dist",
    /** Native canvas polyfill for DOMMatrix on Vercel Node. */
    "@napi-rs/canvas",
  ],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
