import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Standalone tracing uses filesystem junctions. Disabled by default on this
   * USB volume (non-NTFS). Set GOLDENSYNC_STANDALONE=1 on NTFS/CI for Docker images.
   */
  ...(process.env.GOLDENSYNC_STANDALONE === "1" ? { output: "standalone" as const } : {}),
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
