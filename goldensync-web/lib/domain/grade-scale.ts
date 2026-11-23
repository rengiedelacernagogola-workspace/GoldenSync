/**
 * Grade scale mapping (architecture §10.3) — PURE, no I/O.
 */

export type GradeScaleBand = {
  minAverage: number;
  maxAverage: number;
  grade: number;
};

/** Domain error for invalid / unmatched scale (mapped to CONFIG_ERROR in services). */
export class GradeScaleConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GradeScaleConfigError";
  }
}

/**
 * Map average to a numeric grade using contiguous non-overlapping bands.
 * Throws GradeScaleConfigError when scale is invalid or no band matches.
 */
export function mapAverageToGrade(
  average: number,
  scale: GradeScaleBand[],
): number {
  if (scale.length === 0) {
    throw new GradeScaleConfigError("Grade scale is empty.");
  }

  const sorted = [...scale].sort((a, b) => a.minAverage - b.minAverage);
  for (let i = 0; i < sorted.length; i++) {
    const band = sorted[i]!;
    if (band.minAverage > band.maxAverage) {
      throw new GradeScaleConfigError("Grade scale band is inverted.");
    }
    if (i > 0) {
      const prev = sorted[i - 1]!;
      if (band.minAverage <= prev.maxAverage) {
        throw new GradeScaleConfigError("Grade scale bands overlap.");
      }
    }
  }

  const match = sorted.find(
    (b) => average >= b.minAverage && average <= b.maxAverage,
  );
  if (!match) {
    throw new GradeScaleConfigError("Average is outside the grade scale.");
  }
  return match.grade;
}
