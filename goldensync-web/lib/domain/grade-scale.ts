// WHAT: Map numeric averages to letter grades and detailed CSU-style bands.
// HOW: DETAILED_GRADE_BANDS table + lookupDetailedGrade / mapAverageToGrade.
// SCREEN: Grade Calculator equivalents table and numerical grade suggestions.
// EDIT: Band rows — keep ranges contiguous and non-overlapping.
// KEEP: GradeScaleConfigError surfaces as CONFIG_ERROR in services.
// RISK: Low code; High academic policy if bands change.

/**
 * Grade scale mapping (architecture §10.3) — PURE, no I/O.
 * Detailed CSU-style bands shared by Grade Calculator + GradeScale table.
 */

export type GradeScaleBand = {
  minAverage: number;
  maxAverage: number;
  grade: number;
};

export type DetailedGradeBand = GradeScaleBand & {
  letter: string;
  /** Display range label (e.g. "97–100", "60 below"). */
  percentLabel: string;
  description: string;
};

/** Domain error for invalid / unmatched scale (mapped to CONFIG_ERROR in services). */
export class GradeScaleConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GradeScaleConfigError";
  }
}

/**
 * Canonical detailed bands — contiguous, non-overlapping for mapAverageToGrade.
 * Display labels follow the syllabus table; maxAverage uses .99 gaps so bands do not overlap.
 */
export const DETAILED_GRADE_BANDS: DetailedGradeBand[] = [
  {
    minAverage: 97,
    maxAverage: 100,
    grade: 1.0,
    letter: "A",
    percentLabel: "97–100",
    description: "Exceeds expected learning outcomes with mastery",
  },
  {
    minAverage: 93,
    maxAverage: 96.99,
    grade: 1.25,
    letter: "A-",
    percentLabel: "93–96",
    description: "Meets expected learning outcomes with mastery",
  },
  {
    minAverage: 89,
    maxAverage: 92.99,
    grade: 1.5,
    letter: "B+",
    percentLabel: "89–92",
    description:
      "Meets expected learning outcomes with good comprehension of the course",
  },
  {
    minAverage: 85,
    maxAverage: 88.99,
    grade: 1.75,
    letter: "B",
    percentLabel: "85–88",
    description:
      "Good comprehension of the course; full engagement with requirements/activities",
  },
  {
    minAverage: 80,
    maxAverage: 84.99,
    grade: 2.0,
    letter: "B-",
    percentLabel: "80–84",
    description: "(descriptive per institution)",
  },
  {
    minAverage: 75,
    maxAverage: 79.99,
    grade: 2.25,
    letter: "C+",
    percentLabel: "75–79",
    description:
      "Adequate and satisfactory comprehension; meets basic requirements",
  },
  {
    minAverage: 70,
    maxAverage: 74.99,
    grade: 2.5,
    letter: "C",
    percentLabel: "70–74",
    description: "(descriptive per institution)",
  },
  {
    minAverage: 65,
    maxAverage: 69.99,
    grade: 2.75,
    letter: "C-",
    percentLabel: "65–69",
    description: "(descriptive per institution)",
  },
  {
    minAverage: 60,
    maxAverage: 64.99,
    grade: 3.0,
    letter: "D",
    percentLabel: "60–64",
    description: "Meets minimum expectation, needs improvement",
  },
  {
    minAverage: 0,
    maxAverage: 59.99,
    grade: 5.0,
    letter: "E",
    percentLabel: "60 below",
    description: "Does not meet expected learning outcomes",
  },
];

/** Numeric-only bands for DB seed / mapAverageToGrade (high→low grade order by position). */
export function detailedBandsForScale(): GradeScaleBand[] {
  return [...DETAILED_GRADE_BANDS]
    .sort((a, b) => a.minAverage - b.minAverage)
    .map((b) => ({
      minAverage: b.minAverage,
      maxAverage: b.maxAverage,
      grade: b.grade,
    }));
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

/** Lookup detailed band for UI (letter + description). */
export function lookupDetailedGrade(average: number): {
  numerical: string;
  letter: string;
  description: string;
  bandIndex: number;
  percentLabel: string;
} {
  const ordered = DETAILED_GRADE_BANDS;
  for (let i = 0; i < ordered.length; i++) {
    const b = ordered[i]!;
    if (average >= b.minAverage && average <= b.maxAverage) {
      return {
        numerical: formatGradeNumber(b.grade),
        letter: b.letter,
        description: b.description,
        bandIndex: i,
        percentLabel: b.percentLabel,
      };
    }
  }
  const fail = ordered[ordered.length - 1]!;
  return {
    numerical: formatGradeNumber(fail.grade),
    letter: fail.letter,
    description: fail.description,
    bandIndex: ordered.length - 1,
    percentLabel: fail.percentLabel,
  };
}

function formatGradeNumber(n: number): string {
  if (Number.isInteger(n)) return n.toFixed(1);
  return String(n);
}
