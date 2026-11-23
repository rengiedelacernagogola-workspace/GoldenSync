/**
 * Structured Subject.policies JSON — class policies blurb + PART I course spec.
 * Legacy: policies was a free-text string (treated as classPolicies).
 */

export type CourseSpecExtras = {
  lectureUnits: number | null;
  labUnits: number | null;
  corequisite: string;
  lectureHours: number | null;
  labHours: number | null;
  learningModality: string;
  learningResources: string;
  outcomesBasedEvidence: string;
  courseDescription: string;
};

export type PoliciesDoc = {
  classPolicies: string;
  courseSpec: CourseSpecExtras;
};

export const EMPTY_COURSE_SPEC: CourseSpecExtras = {
  lectureUnits: null,
  labUnits: null,
  corequisite: "",
  lectureHours: null,
  labHours: null,
  learningModality: "",
  learningResources: "",
  outcomesBasedEvidence: "",
  courseDescription: "",
};

export const EMPTY_POLICIES_DOC: PoliciesDoc = {
  classPolicies: "",
  courseSpec: { ...EMPTY_COURSE_SPEC },
};

function asNonNegNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function parseCourseSpec(raw: unknown): CourseSpecExtras {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...EMPTY_COURSE_SPEC };
  }
  const obj = raw as Record<string, unknown>;
  return {
    lectureUnits: asNonNegNumber(obj.lectureUnits),
    labUnits: asNonNegNumber(obj.labUnits),
    corequisite: asString(obj.corequisite).trim(),
    lectureHours: asNonNegNumber(obj.lectureHours),
    labHours: asNonNegNumber(obj.labHours),
    learningModality: asString(obj.learningModality),
    learningResources: asString(obj.learningResources),
    outcomesBasedEvidence: asString(obj.outcomesBasedEvidence),
    courseDescription: asString(obj.courseDescription),
  };
}

/** Parse Subject.policies Json / legacy string into structured doc. */
export function parsePoliciesDoc(raw: unknown): PoliciesDoc {
  if (raw == null) return { ...EMPTY_POLICIES_DOC, courseSpec: { ...EMPTY_COURSE_SPEC } };

  if (typeof raw === "string") {
    return {
      classPolicies: raw.trim(),
      courseSpec: { ...EMPTY_COURSE_SPEC },
    };
  }

  if (typeof raw !== "object" || Array.isArray(raw)) {
    return { ...EMPTY_POLICIES_DOC, courseSpec: { ...EMPTY_COURSE_SPEC } };
  }

  const obj = raw as Record<string, unknown>;
  return {
    classPolicies: asString(obj.classPolicies).trim(),
    courseSpec: parseCourseSpec(obj.courseSpec),
  };
}

/** Serialize for Subject.policies Json column. */
export function serializePoliciesDoc(doc: PoliciesDoc): PoliciesDoc {
  return {
    classPolicies: doc.classPolicies.trim(),
    courseSpec: {
      lectureUnits: doc.courseSpec.lectureUnits,
      labUnits: doc.courseSpec.labUnits,
      corequisite: doc.courseSpec.corequisite.trim(),
      lectureHours: doc.courseSpec.lectureHours,
      labHours: doc.courseSpec.labHours,
      learningModality: doc.courseSpec.learningModality.trim(),
      learningResources: doc.courseSpec.learningResources.trim(),
      outcomesBasedEvidence: doc.courseSpec.outcomesBasedEvidence.trim(),
      courseDescription: doc.courseSpec.courseDescription.trim(),
    },
  };
}

/** Total units from lecture + lab (null if both empty). */
export function totalUnits(
  lecture: number | null | undefined,
  lab: number | null | undefined,
): number | null {
  const parts = [lecture, lab].filter(
    (n): n is number => n != null && Number.isFinite(n),
  );
  if (parts.length === 0) return null;
  return parts.reduce((a, b) => a + b, 0);
}

/** Total contact hours from lecture + lab (null if both empty). */
export function totalContactHours(
  lecture: number | null | undefined,
  lab: number | null | undefined,
): number | null {
  return totalUnits(lecture, lab);
}

/** Display e.g. "2 lecture · 1 laboratory" or "—". */
export function formatSplitUnits(
  lecture: number | null | undefined,
  lab: number | null | undefined,
): string {
  const parts: string[] = [];
  if (lecture != null) parts.push(`${lecture} lecture`);
  if (lab != null) parts.push(`${lab} laboratory`);
  return parts.length > 0 ? parts.join(" · ") : "—";
}

/** Display e.g. "54 lecture · 36 laboratory" or "—". */
export function formatSplitHours(
  lecture: number | null | undefined,
  lab: number | null | undefined,
): string {
  const parts: string[] = [];
  if (lecture != null) parts.push(`${lecture} lecture`);
  if (lab != null) parts.push(`${lab} laboratory`);
  return parts.length > 0 ? `${parts.join(" · ")} hrs` : "—";
}

/** Parse a numeric draft string; empty → null. */
export function parseOptionalNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}
