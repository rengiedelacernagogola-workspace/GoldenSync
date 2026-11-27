// WHAT: Validate PDF upload blob paths so users cannot read other users’ files.
// HOW: Path must be ingest/{userId}/{filename}.pdf with no .. or extra slashes.
// EDIT: Prefix rules in isValidIngestPathname if storage layout changes.
// KEEP: userId argument must match the signed-in user (enforced in services).
// RISK: High — path bugs are a direct security issue.

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
