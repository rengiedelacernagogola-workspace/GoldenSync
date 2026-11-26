/**
 * Part IV — Grading System template (editable tables on Grade Calculator).
 * Stored as Subject.grading JSON (versioned object). Legacy string blurbs → defaults.
 */

export type GradeStatusRow = {
  id: string;
  status: string;
  disposition: string;
};

export type GradeEquivalentRow = {
  id: string;
  numerical: string;
  percent: string;
  letter: string;
  description: string;
};

export type CoAssessmentTask = {
  id: string;
  task: string;
  weight: string;
  finalWeight: string;
  domain: string;
};

export type CoAssessmentGroup = {
  id: string;
  code: string;
  weightPercent: string;
  tasks: CoAssessmentTask[];
};

export type GradingTemplateDoc = {
  version: 1;
  statusRows: GradeStatusRow[];
  equivalentRows: GradeEquivalentRow[];
  coGroups: CoAssessmentGroup[];
  domainNote: string;
};

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** Factory defaults matching syllabus Part IV sample. */
export const DEFAULT_GRADING_TEMPLATE: GradingTemplateDoc = {
  version: 1,
  statusRows: [
    {
      id: "status-1",
      status: "Grade in all course outcomes is greater than 60%",
      disposition:
        "Pass. Refer to the grading table for the equivalent numerical grade.",
    },
    {
      id: "status-2",
      status:
        "Average is greater than 60% but at least 1 of the course outcomes are with grade less than 60%",
      disposition:
        "Implement intervention / conduct removal exam / require additional assessment. The final grade is based on the original average.",
    },
    {
      id: "status-3",
      status:
        "Average is less than 60% but 50% or more of the outcomes are attained",
      disposition:
        "Implement intervention / conduct removal exam / require additional assessment. The highest grade obtained after passing the outcome is 3.0",
    },
    {
      id: "status-4",
      status:
        "Average is lesser than 60% and more than 50% of the number of course outcomes did not attain ≥ 60%",
      disposition: "Failed. 5.0",
    },
  ],
  equivalentRows: [
    {
      id: "eq-1",
      numerical: "1.0",
      percent: "97–100",
      letter: "A",
      description: "Exceeds expected learning outcomes with mastery",
    },
    {
      id: "eq-2",
      numerical: "1.25",
      percent: "93–96",
      letter: "A-",
      description: "Meets expected learning outcomes with mastery",
    },
    {
      id: "eq-3",
      numerical: "1.50",
      percent: "89–92",
      letter: "B+",
      description:
        "Meets expected learning outcomes with good comprehension of the course",
    },
    {
      id: "eq-4",
      numerical: "1.75",
      percent: "85–88",
      letter: "B",
      description:
        "Good comprehension of the course, good command of the skills needed, and with full engagement with the course requirements and activities.",
    },
    {
      id: "eq-5",
      numerical: "2.0",
      percent: "80–84",
      letter: "B-",
      description: "",
    },
    {
      id: "eq-6",
      numerical: "2.25",
      percent: "75–79",
      letter: "C+",
      description:
        "Has adequate and satisfactory comprehension of the course and the skills needed and has met the basic requirements for completing assigned work and class activities",
    },
    {
      id: "eq-7",
      numerical: "2.5",
      percent: "70–74",
      letter: "C",
      description: "",
    },
    {
      id: "eq-8",
      numerical: "2.75",
      percent: "65–69",
      letter: "C-",
      description: "",
    },
    {
      id: "eq-9",
      numerical: "3.0",
      percent: "60–64",
      letter: "D",
      description: "Meets minimum expectation, needs improvement",
    },
    {
      id: "eq-10",
      numerical: "5.0",
      percent: "60 below",
      letter: "E",
      description: "Does not meet expected learning outcomes",
    },
    {
      id: "eq-11",
      numerical: "INC",
      percent: "",
      letter: "",
      description: "Pass but with lacking requirements",
    },
    {
      id: "eq-12",
      numerical: "DRP",
      percent: "",
      letter: "",
      description: "Dropped – did not attend the class and without approval",
    },
    {
      id: "eq-13",
      numerical: "W",
      percent: "",
      letter: "",
      description: "Withdrawn – did not attend the class with proper approval",
    },
  ],
  coGroups: [
    {
      id: "co-1",
      code: "CO1",
      weightPercent: "30%",
      tasks: [
        {
          id: "co1-t1",
          task: "Laboratory Worksheet 1",
          weight: "16.67%",
          finalWeight: "5%",
          domain: "C",
        },
        {
          id: "co1-t2",
          task: "Laboratory Worksheet 2",
          weight: "16.67%",
          finalWeight: "5%",
          domain: "C",
        },
        {
          id: "co1-t3",
          task: "Laboratory Worksheet 3",
          weight: "16.67%",
          finalWeight: "5%",
          domain: "C",
        },
        {
          id: "co1-t4",
          task: "Software Project Proposal Defense",
          weight: "33.33%",
          finalWeight: "10%",
          domain: "C/P",
        },
        {
          id: "co1-t5",
          task: "Midterm Exam",
          weight: "16.67%",
          finalWeight: "5%",
          domain: "C",
        },
      ],
    },
    {
      id: "co-2",
      code: "CO2",
      weightPercent: "30%",
      tasks: [
        {
          id: "co2-t1",
          task: "Laboratory Worksheet 4",
          weight: "16.67%",
          finalWeight: "5%",
          domain: "C",
        },
        {
          id: "co2-t2",
          task: "Laboratory Worksheet 5",
          weight: "16.67%",
          finalWeight: "5%",
          domain: "C",
        },
        {
          id: "co2-t3",
          task: "Laboratory Worksheet 6",
          weight: "16.67%",
          finalWeight: "5%",
          domain: "C",
        },
        {
          id: "co2-t4",
          task: "Laboratory Worksheet 7",
          weight: "16.67%",
          finalWeight: "5%",
          domain: "C",
        },
        {
          id: "co2-t5",
          task: "Software Project Proposal Defense",
          weight: "16.67%",
          finalWeight: "5%",
          domain: "C/P",
        },
        {
          id: "co2-t6",
          task: "Midterm Exam",
          weight: "16.67%",
          finalWeight: "5%",
          domain: "C",
        },
      ],
    },
    {
      id: "co-3",
      code: "CO3",
      weightPercent: "20%",
      tasks: [
        {
          id: "co3-t1",
          task: "Laboratory Worksheet 8",
          weight: "25%",
          finalWeight: "5%",
          domain: "C",
        },
        {
          id: "co3-t2",
          task: "Laboratory Worksheet 9",
          weight: "25%",
          finalWeight: "5%",
          domain: "C",
        },
        {
          id: "co3-t3",
          task: "Final Project",
          weight: "50%",
          finalWeight: "10%",
          domain: "C/P",
        },
      ],
    },
    {
      id: "co-4",
      code: "CO4",
      weightPercent: "20%",
      tasks: [
        {
          id: "co4-t1",
          task: "Laboratory Worksheet 10",
          weight: "25%",
          finalWeight: "5%",
          domain: "C",
        },
        {
          id: "co4-t2",
          task: "Laboratory Worksheet 11",
          weight: "25%",
          finalWeight: "5%",
          domain: "C",
        },
        {
          id: "co4-t3",
          task: "Final Project",
          weight: "50%",
          finalWeight: "10%",
          domain: "C/P",
        },
      ],
    },
  ],
  domainNote: "Domain Evaluation (C-Cognitive, P-Psychomotor, A-Affective)",
};

/** Deep clone for edit buffers / reset. */
export function cloneGradingTemplate(
  doc: GradingTemplateDoc,
): GradingTemplateDoc {
  return structuredClone(doc);
}

function parseStatusRows(raw: unknown): GradeStatusRow[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row, i) => {
      if (row == null || typeof row !== "object" || Array.isArray(row)) {
        return null;
      }
      const obj = row as Record<string, unknown>;
      return {
        id: asString(obj.id).trim() || `status-${i + 1}`,
        status: asString(obj.status),
        disposition: asString(obj.disposition),
      };
    })
    .filter((x): x is GradeStatusRow => x != null);
}

function parseEquivalentRows(raw: unknown): GradeEquivalentRow[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row, i) => {
      if (row == null || typeof row !== "object" || Array.isArray(row)) {
        return null;
      }
      const obj = row as Record<string, unknown>;
      return {
        id: asString(obj.id).trim() || `eq-${i + 1}`,
        numerical: asString(obj.numerical),
        percent: asString(obj.percent),
        letter: asString(obj.letter),
        description: asString(obj.description),
      };
    })
    .filter((x): x is GradeEquivalentRow => x != null);
}

function parseCoGroups(raw: unknown): CoAssessmentGroup[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((group, gi) => {
      if (group == null || typeof group !== "object" || Array.isArray(group)) {
        return null;
      }
      const obj = group as Record<string, unknown>;
      const tasksRaw = Array.isArray(obj.tasks) ? obj.tasks : [];
      const tasks = tasksRaw
        .map((task, ti) => {
          if (task == null || typeof task !== "object" || Array.isArray(task)) {
            return null;
          }
          const t = task as Record<string, unknown>;
          return {
            id: asString(t.id).trim() || `co${gi + 1}-t${ti + 1}`,
            task: asString(t.task),
            weight: asString(t.weight),
            finalWeight: asString(t.finalWeight),
            domain: asString(t.domain),
          };
        })
        .filter((x): x is CoAssessmentTask => x != null);
      return {
        id: asString(obj.id).trim() || `co-${gi + 1}`,
        code: asString(obj.code).trim() || `CO${gi + 1}`,
        weightPercent: asString(obj.weightPercent),
        tasks:
          tasks.length > 0
            ? tasks
            : [
                {
                  id: newId("task"),
                  task: "",
                  weight: "",
                  finalWeight: "",
                  domain: "C",
                },
              ],
      };
    })
    .filter((x): x is CoAssessmentGroup => x != null);
}

/**
 * Best-effort PART IV → GradingTemplateDoc (CSU F-CID-010 CO weight table).
 * Returns null when no CO groups found.
 */
export function extractGradingTemplateFromText(
  text: string,
): GradingTemplateDoc | null {
  const part4 = text.search(/PART\s*IV/i);
  if (part4 < 0 && !/CO\s*Weight\s*%/i.test(text)) return null;
  const endMarkers = text.search(
    /\n\s*Class\s*Policies|\n\s*Prepared\s*by\s*:|\n\s*References\b/i,
  );
  const scope = text.slice(
    part4 >= 0 ? part4 : 0,
    endMarkers > part4 ? endMarkers : undefined,
  );

  const coGroups: CoAssessmentGroup[] = [];
  const coHeader =
    /(?:^|\n)\s*(CO\s*\d{1,2})\s+(\d+(?:\.\d+)?)\s*%/gi;
  const headers: Array<{ code: string; weight: string; index: number }> = [];
  let hm: RegExpExecArray | null;
  while ((hm = coHeader.exec(scope)) !== null) {
    headers.push({
      code: hm[1]!.replace(/\s+/g, "").toUpperCase(),
      weight: `${hm[2]}%`,
      index: hm.index,
    });
  }
  if (headers.length === 0) return null;

  const taskLine =
    /^\s*(.+?)\s+(\d+(?:\.\d+)?%)\s+(\d+(?:\.\d+)?%)\s+(C(?:\/P)?(?:\/A)?|P(?:\/A)?|A)\s*$/i;

  for (let i = 0; i < headers.length; i++) {
    const h = headers[i]!;
    const next = headers[i + 1];
    const chunk = scope.slice(h.index, next ? next.index : undefined);
    const lines = chunk.split(/\r?\n/).slice(1);
    const tasks: CoAssessmentTask[] = [];
    for (const raw of lines) {
      const line = raw.replace(/\t/g, " ").trim();
      if (!line) continue;
      if (/^CO\s*\d/i.test(line)) continue;
      if (/^Numerical|^Domain Evaluation|^Grade Status|^CO Weight/i.test(line)) {
        break;
      }
      const tm = taskLine.exec(line);
      if (!tm) continue;
      const task = tm[1]!.replace(/\s+/g, " ").trim();
      if (task.length < 3) continue;
      if (/^CO\d/i.test(task)) continue;
      tasks.push({
        id: newId("task"),
        task: task.slice(0, 120),
        weight: tm[2]!,
        finalWeight: tm[3]!,
        domain: tm[4]!.toUpperCase(),
      });
    }
    if (tasks.length === 0) continue;
    coGroups.push({
      id: newId("co"),
      code: h.code,
      weightPercent: h.weight,
      tasks,
    });
  }

  if (coGroups.length === 0) return null;

  const domainNoteMatch = scope.match(
    /Domain\s*Evaluation\s*\([^)]+\)/i,
  );
  const base = cloneGradingTemplate(DEFAULT_GRADING_TEMPLATE);
  return {
    version: 1,
    statusRows: base.statusRows,
    equivalentRows: base.equivalentRows,
    coGroups,
    domainNote: domainNoteMatch?.[0]?.trim() || base.domainNote,
  };
}

/**
 * Parse Subject.grading when a real v1 doc exists; otherwise null.
 * Live empty subjects must not inherit DEFAULT_GRADING_TEMPLATE.
 */
export function tryParseGradingTemplate(
  raw: unknown,
): GradingTemplateDoc | null {
  if (raw == null || typeof raw === "string") return null;
  if (typeof raw !== "object" || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  if (obj.version !== 1) return null;
  const statusRows = parseStatusRows(obj.statusRows);
  const equivalentRows = parseEquivalentRows(obj.equivalentRows);
  const coGroups = parseCoGroups(obj.coGroups);
  if (
    statusRows.length === 0 &&
    equivalentRows.length === 0 &&
    coGroups.length === 0
  ) {
    return null;
  }
  return {
    version: 1,
    statusRows:
      statusRows.length > 0
        ? statusRows
        : cloneGradingTemplate(DEFAULT_GRADING_TEMPLATE).statusRows,
    equivalentRows:
      equivalentRows.length > 0
        ? equivalentRows
        : cloneGradingTemplate(DEFAULT_GRADING_TEMPLATE).equivalentRows,
    coGroups:
      coGroups.length > 0
        ? coGroups
        : cloneGradingTemplate(DEFAULT_GRADING_TEMPLATE).coGroups,
    domainNote:
      asString(obj.domainNote).trim() ||
      DEFAULT_GRADING_TEMPLATE.domainNote,
  };
}

/**
 * Parse Subject.grading — structured v1 doc, or legacy string/null → defaults.
 * Prefer `tryParseGradingTemplate` for live empty subjects.
 */
export function parseGradingTemplate(raw: unknown): GradingTemplateDoc {
  const parsed = tryParseGradingTemplate(raw);
  if (parsed) return parsed;
  return cloneGradingTemplate(DEFAULT_GRADING_TEMPLATE);
}

/** Normalize for PATCH body. */
export function serializeGradingTemplate(
  doc: GradingTemplateDoc,
): GradingTemplateDoc {
  return {
    version: 1,
    statusRows: doc.statusRows.map((r) => ({
      id: r.id.trim() || newId("status"),
      status: r.status.trim(),
      disposition: r.disposition.trim(),
    })),
    equivalentRows: doc.equivalentRows.map((r) => ({
      id: r.id.trim() || newId("eq"),
      numerical: r.numerical.trim(),
      percent: r.percent.trim(),
      letter: r.letter.trim(),
      description: r.description.trim(),
    })),
    coGroups: doc.coGroups.map((g, i) => ({
      id: g.id.trim() || newId("co"),
      code: g.code.trim() || `CO${i + 1}`,
      weightPercent: g.weightPercent.trim(),
      tasks: g.tasks.map((t) => ({
        id: t.id.trim() || newId("task"),
        task: t.task.trim(),
        weight: t.weight.trim(),
        finalWeight: t.finalWeight.trim(),
        domain: t.domain.trim(),
      })),
    })),
    domainNote: doc.domainNote.trim(),
  };
}

/** Sum of CO group weight % values (parses leading number from "30%" / "30"). */
export function coWeightTotal(groups: CoAssessmentGroup[]): number {
  return groups.reduce((sum, g) => {
    const match = g.weightPercent.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
    if (!match) return sum;
    const n = Number(match[0]);
    return Number.isFinite(n) ? sum + n : sum;
  }, 0);
}

export function createEmptyStatusRow(): GradeStatusRow {
  return { id: newId("status"), status: "", disposition: "" };
}

export function createEmptyEquivalentRow(): GradeEquivalentRow {
  return {
    id: newId("eq"),
    numerical: "",
    percent: "",
    letter: "",
    description: "",
  };
}

export function createEmptyTask(): CoAssessmentTask {
  return {
    id: newId("task"),
    task: "",
    weight: "",
    finalWeight: "",
    domain: "C",
  };
}

export function createEmptyCoGroup(index: number): CoAssessmentGroup {
  return {
    id: newId("co"),
    code: `CO${index}`,
    weightPercent: "0%",
    tasks: [createEmptyTask()],
  };
}
