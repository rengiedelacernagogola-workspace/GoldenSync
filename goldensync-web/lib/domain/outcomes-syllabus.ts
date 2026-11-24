/**
 * Syllabus Part II — Vision / Mission / IOs + editable PEO·PO·CO lists.
 * Institutional text lives in Subject.policies.outcomesSyllabus.
 * PEO/PO/CO rows still sync to Outcome table on save.
 */

export type OutcomesListItem = {
  code: string;
  description: string;
};

export type OutcomesSyllabusDoc = {
  vision: string;
  mission: string;
  graduateAttributes: string;
  institutionalOutcomes: OutcomesListItem[];
  peos: OutcomesListItem[];
  pos: OutcomesListItem[];
  cos: OutcomesListItem[];
};

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function parseList(raw: unknown): OutcomesListItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row, i) => {
      if (row == null || typeof row !== "object" || Array.isArray(row)) {
        return null;
      }
      const obj = row as Record<string, unknown>;
      const code = asString(obj.code).trim() || `Item${i + 1}`;
      const description = asString(obj.description).trim();
      return { code, description };
    })
    .filter((x): x is OutcomesListItem => x != null);
}

/** CSU syllabus seed (BSIT PEOs + shared POs/COs from screenshots). */
export const SEED_OUTCOMES_SYLLABUS: OutcomesSyllabusDoc = {
  vision:
    "A socially-engaged, digital, innovative, and entrepreneurial university excelling globally in science, engineering and the arts by 2028.",
  mission:
    "As a transformative university, CSU is a responsible steward of problem-solvers and value creators who are driven to create a sustainable future for the region, the nation, and beyond.",
  graduateAttributes:
    "Caraga State University graduates manifest the virtue of a CSUAN: Competent, Socially-engaged, Upright, Agile and Innovative, and Nurturing Leaders.",
  institutionalOutcomes: [
    {
      code: "IO1",
      description:
        "Transformative Leadership and Stewardship. A CSUAN applies advanced expertise in addressing complex societal challenges as a transformative leader and purpose-driven steward.",
    },
    {
      code: "IO2",
      description:
        "Research, Innovation and Enterprise. A CSUAN produces quality research outputs, applies innovative thinking, and develops entrepreneurial solutions that address regional and global issues, in pursuit of sustainability and economic advancement.",
    },
    {
      code: "IO3",
      description:
        "Lifelong Learning and Social Responsibility. A CSUAN continually enhances their knowledge and skills, and actively contributes to community development while exemplifying social responsibility, ethical standards, and the core values of Caraga State University.",
    },
  ],
  peos: [
    {
      code: "PEO1",
      description:
        "Demonstrate competency in analyzing, designing and evaluating information and communication technology (ICT) solutions to real-world problems.",
    },
    {
      code: "PEO2",
      description:
        "Contribute innovative ICT-based products and services towards positive transformation within the communities and organizations.",
    },
    {
      code: "PEO3",
      description:
        "Demonstrate a commitment to lifelong learning by advancing knowledge and skills in emerging technologies, engaging in innovative projects that address societal challenges, and contributing to the IT field in ways that promote ethical practices.",
    },
  ],
  pos: [
    {
      code: "PO-1",
      description:
        "Analyze a complex computing problem and to apply principles of computing and other relevant disciplines to identify solutions.",
    },
    {
      code: "PO-2",
      description:
        "Design, implement, and evaluate a computing-based solution to meet a given set of computing requirements in the context of the program’s discipline.",
    },
    {
      code: "PO-3",
      description:
        "Communicate effectively in a variety of professional contexts.",
    },
    {
      code: "PO-4",
      description:
        "Recognize professional responsibilities and make informed judgements in computing practice based on legal and ethical principles.",
    },
    {
      code: "PO-5",
      description:
        "Function effectively as a member or leader of a team engaged in activities appropriate to the program’s discipline.",
    },
    {
      code: "PO6-IT",
      description:
        "Identify and analyze user needs and to take them into account in the selection, creation, integration, evaluation, and administration of computing-based systems.",
    },
  ],
  cos: [
    {
      code: "CO1",
      description:
        "Analyze complex software problems to create clear user requirements and functional prototypes.",
    },
    {
      code: "CO2",
      description:
        "Design a software system's structure and data using industry-standard modeling techniques.",
    },
    {
      code: "CO3",
      description:
        "Create a working software application within a team using modern development practices and version control.",
    },
    {
      code: "CO4",
      description:
        "Evaluate software quality through systematic testing to ensure the final product meets technical and user standards.",
    },
  ],
};

export const EMPTY_OUTCOMES_SYLLABUS: OutcomesSyllabusDoc = {
  vision: "",
  mission: "",
  graduateAttributes: "",
  institutionalOutcomes: [],
  peos: [],
  pos: [],
  cos: [],
};

function cloneSyllabus(doc: OutcomesSyllabusDoc): OutcomesSyllabusDoc {
  return {
    vision: doc.vision,
    mission: doc.mission,
    graduateAttributes: doc.graduateAttributes,
    institutionalOutcomes: doc.institutionalOutcomes.map((x) => ({ ...x })),
    peos: doc.peos.map((x) => ({ ...x })),
    pos: doc.pos.map((x) => ({ ...x })),
    cos: doc.cos.map((x) => ({ ...x })),
  };
}

/** Parse outcomesSyllabus object from policies JSON. */
export function parseOutcomesSyllabus(raw: unknown): OutcomesSyllabusDoc {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return cloneSyllabus(EMPTY_OUTCOMES_SYLLABUS);
  }
  const obj = raw as Record<string, unknown>;
  return {
    vision: asString(obj.vision).trim(),
    mission: asString(obj.mission).trim(),
    graduateAttributes: asString(obj.graduateAttributes).trim(),
    institutionalOutcomes: parseList(obj.institutionalOutcomes),
    peos: parseList(obj.peos),
    pos: parseList(obj.pos),
    cos: parseList(obj.cos),
  };
}

export function serializeOutcomesSyllabus(
  doc: OutcomesSyllabusDoc,
): OutcomesSyllabusDoc {
  const clean = (items: OutcomesListItem[]) =>
    items
      .map((x) => ({
        code: x.code.trim(),
        description: x.description.trim(),
      }))
      .filter((x) => x.code || x.description);

  return {
    vision: doc.vision.trim(),
    mission: doc.mission.trim(),
    graduateAttributes: doc.graduateAttributes.trim(),
    institutionalOutcomes: clean(doc.institutionalOutcomes),
    peos: clean(doc.peos),
    pos: clean(doc.pos),
    cos: clean(doc.cos),
  };
}

export function isOutcomesSyllabusEmpty(doc: OutcomesSyllabusDoc): boolean {
  return (
    !doc.vision.trim() &&
    !doc.mission.trim() &&
    !doc.graduateAttributes.trim() &&
    doc.institutionalOutcomes.length === 0 &&
    doc.peos.length === 0 &&
    doc.pos.length === 0 &&
    doc.cos.length === 0
  );
}

/** Merge DB Outcome rows into syllabus lists when those lists are empty. */
export function mergeOutcomesFromDb(
  syllabus: OutcomesSyllabusDoc,
  outcomes: Array<{
    kind: string;
    code: string;
    description: string;
    position: number;
  }>,
): OutcomesSyllabusDoc {
  const next = cloneSyllabus(syllabus);
  const byKind = (kind: string) =>
    outcomes
      .filter((o) => o.kind === kind)
      .sort((a, b) => a.position - b.position)
      .map((o) => ({ code: o.code, description: o.description }));

  if (next.peos.length === 0) next.peos = byKind("PEO");
  if (next.pos.length === 0) next.pos = byKind("PO");
  if (next.cos.length === 0) next.cos = byKind("CO");
  return next;
}

/** Prefer saved syllabus; else seed institutional + DB/seed lists. */
export function resolveOutcomesSyllabus(input: {
  policiesRaw: unknown;
  outcomes: Array<{
    kind: string;
    code: string;
    description: string;
    position: number;
  }>;
}): OutcomesSyllabusDoc {
  const fromPolicies = parseOutcomesSyllabus(
    typeof input.policiesRaw === "object" &&
      input.policiesRaw != null &&
      !Array.isArray(input.policiesRaw)
      ? (input.policiesRaw as Record<string, unknown>).outcomesSyllabus
      : null,
  );

  if (!isOutcomesSyllabusEmpty(fromPolicies)) {
    return mergeOutcomesFromDb(fromPolicies, input.outcomes);
  }

  const seed = cloneSyllabus(SEED_OUTCOMES_SYLLABUS);
  const fromDb = mergeOutcomesFromDb(
    {
      vision: seed.vision,
      mission: seed.mission,
      graduateAttributes: seed.graduateAttributes,
      institutionalOutcomes: seed.institutionalOutcomes,
      peos: [],
      pos: [],
      cos: [],
    },
    input.outcomes,
  );

  if (fromDb.peos.length === 0) fromDb.peos = seed.peos;
  if (fromDb.pos.length === 0) fromDb.pos = seed.pos;
  if (fromDb.cos.length === 0) fromDb.cos = seed.cos;
  return fromDb;
}

export function cloneOutcomesSyllabus(
  doc: OutcomesSyllabusDoc,
): OutcomesSyllabusDoc {
  return cloneSyllabus(doc);
}
