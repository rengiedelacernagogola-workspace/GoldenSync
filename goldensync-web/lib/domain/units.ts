/**
 * Units / score coercion for Prisma Decimal fields (stored as numeric text).
 */

/** Normalize units input to a decimal string Prisma accepts. */
export function unitsToDecimalString(units: number | string): string {
  if (typeof units === "number") return units.toFixed(1);
  const n = Number(units);
  if (!Number.isFinite(n)) return "0.0";
  return n.toFixed(1);
}

/** Normalize assessment maxScore to 2-decimal string. */
export function maxScoreToDecimalString(value: number | string): string {
  if (typeof value === "number") return value.toFixed(2);
  const n = Number(value);
  if (!Number.isFinite(n)) return "0.00";
  return n.toFixed(2);
}
