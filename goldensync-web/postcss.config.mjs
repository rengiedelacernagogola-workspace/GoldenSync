/** PostCSS — required for `next dev --webpack` (USB FAT32). Turbopack still uses `@tailwindcss/turbopack`. */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
