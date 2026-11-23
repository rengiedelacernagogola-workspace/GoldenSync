/**
 * Ingest blob path policy (architecture §8.2 / §8.3) — PURE.
 */

/** True when pathname is ingest/{userId}/{file}.pdf with no path tricks. */
export function isValidIngestPathname(pathname: string, userId: string): boolean {
  const prefix = `ingest/${userId}/`;
  if (!pathname.startsWith(prefix)) return false;
  if (!pathname.toLowerCase().endsWith(".pdf")) return false;
  const rest = pathname.slice(prefix.length);
  if (!rest || rest.includes("..") || rest.includes("/") || rest.includes("\\")) {
    return false;
  }
  return true;
}
