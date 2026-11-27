// WHAT: Turn units and max scores into decimal strings the database accepts.
// HOW: toFixed(1) for units, toFixed(2) for assessment caps; invalid → safe defaults.
// EDIT: Decimal places here if Prisma schema or syllabus rules change.
// KEEP: Used before Prisma writes — strings must match DB column expectations.
// RISK: Medium — wrong formatting can break saves or skew grades.

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
