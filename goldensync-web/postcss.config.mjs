// WHAT: PostCSS pipeline hook so Tailwind v4 runs during Webpack-based `next dev`.
// HOW: Single plugin `@tailwindcss/postcss` in the exported config object.
// SCREEN: N/A — affects global CSS processing for all pages.
// EDIT: Only when changing CSS toolchain (e.g. extra PostCSS plugins).
// KEEP: Turbopack dev may use `@tailwindcss/turbopack` separately; this file still needed for Webpack.
// RISK: Low
/** PostCSS — required for `next dev --webpack` (USB FAT32). Turbopack still uses `@tailwindcss/turbopack`. */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
