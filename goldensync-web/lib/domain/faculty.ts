// WHAT: Parse/format instructor info stored on Subject.faculty (JSON or legacy string).
// HOW: parseFaculty tolerates old free-text; serializeFaculty for saves.
// SCREEN: Subject header / faculty fields on subject detail.
// EDIT: FacultyInfo fields and title enum (Mr/Ms).
// KEEP: Match validation in lib/validation if you add required fields.
// RISK: Low.

/**
 * Structured Subject.faculty JSON — instructor + estimated contact hours.
 */

export type FacultyTitle = "Mr" | "Ms" | "";

export type FacultyInfo = {
  title: FacultyTitle;
  name: string;
  college: string;
  consultation: string;
  /** Total estimated contact hours for the subject (user-entered). */
  estimatedContactHours: number | null;
};

export const EMPTY_FACULTY: FacultyInfo = {
  title: "",
  name: "",
  college: "",
  consultation: "",
  estimatedContactHours: null,
};

function asTitle(value: unknown): FacultyTitle {
  if (value === "Mr" || value === "Ms") return value;
  return "";
}

/** Parse faculty Json / legacy string into structured info. */
export function parseFaculty(raw: unknown): FacultyInfo {
  if (raw == null) return { ...EMPTY_FACULTY };

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return { ...EMPTY_FACULTY };
    /* Legacy free-text faculty blurb → name only. */
    return { ...EMPTY_FACULTY, name: trimmed };
  }

  if (typeof raw !== "object" || Array.isArray(raw)) {
    return { ...EMPTY_FACULTY };
  }

  const obj = raw as Record<string, unknown>;
  const hoursRaw = obj.estimatedContactHours;
  let estimatedContactHours: number | null = null;
  if (typeof hoursRaw === "number" && Number.isFinite(hoursRaw) && hoursRaw >= 0) {
    estimatedContactHours = hoursRaw;
  } else if (typeof hoursRaw === "string" && hoursRaw.trim() !== "") {
    const n = Number(hoursRaw);
    if (Number.isFinite(n) && n >= 0) estimatedContactHours = n;
  }

  return {
    title: asTitle(obj.title),
    name: typeof obj.name === "string" ? obj.name : "",
    college: typeof obj.college === "string" ? obj.college : "",
    consultation:
      typeof obj.consultation === "string" ? obj.consultation : "",
    estimatedContactHours,
  };
}

/** Serialize for Subject.faculty Json column. */
export function serializeFaculty(info: FacultyInfo): FacultyInfo {
  return {
    title: info.title === "Mr" || info.title === "Ms" ? info.title : "",
    name: info.name.trim(),
    college: info.college.trim(),
    consultation: info.consultation.trim(),
    estimatedContactHours:
      info.estimatedContactHours != null &&
      Number.isFinite(info.estimatedContactHours) &&
      info.estimatedContactHours >= 0
        ? info.estimatedContactHours
        : null,
  };
}

/** Display label e.g. "Mr Juan Dela Cruz". */
export function formatInstructorName(info: FacultyInfo): string {
  const name = info.name.trim();
  if (!name) return "—";
  if (info.title) return `${info.title} ${name}`;
  return name;
}

/**
 * Remaining contact hours from semester calendar progress.
 * remaining = total * (1 - clamp((now - start) / (end - start), 0, 1))
 */
export function remainingContactHours(
  totalHours: number | null | undefined,
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined,
  now: Date = new Date(),
): number | null {
  if (totalHours == null || !Number.isFinite(totalHours) || totalHours < 0) {
    return null;
  }
  if (!startDate || !endDate) return totalHours;

  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return totalHours;
  }
  const span = end.getTime() - start.getTime();
  if (span <= 0) return 0;

  const progress = Math.min(
    1,
    Math.max(0, (now.getTime() - start.getTime()) / span),
  );
  return Math.max(0, Math.round(totalHours * (1 - progress) * 10) / 10);
}

/** Latest incomplete plan/checklist task label for a subject card. */
export function latestOngoingTask(input: {
  checklist: Array<{ weekNumber: number; done: boolean }>;
  planWeeks: Array<{
    weekNumber: number;
    topic: string | null;
    status?: string;
  }>;
}): string {
  const doneByWeek = new Map(
    input.checklist.map((c) => [c.weekNumber, c.done]),
  );

  const planSorted = [...input.planWeeks].sort(
    (a, b) => a.weekNumber - b.weekNumber,
  );

  for (const week of planSorted) {
    if (week.status === "No class" || week.status === "Done") continue;
    const checklistDone = doneByWeek.get(week.weekNumber);
    if (checklistDone === true) continue;
    const topic = (week.topic ?? "").trim() || `Week ${week.weekNumber}`;
    return `Week ${week.weekNumber} · ${topic}`;
  }

  /* Fallback: incomplete checklist week with no matching plan row. */
  const incomplete = [...input.checklist]
    .filter((c) => !c.done)
    .sort((a, b) => a.weekNumber - b.weekNumber);
  if (incomplete[0]) {
    return `Week ${incomplete[0].weekNumber}`;
  }

  return "All caught up";
}
