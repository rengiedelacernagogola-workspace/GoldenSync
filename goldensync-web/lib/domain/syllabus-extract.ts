/**
 * Best-effort syllabus field extraction — PURE.
 * Prefer precision: return null/[] when unsure (never invent seed content).
 * Tuned for CSU F-CID-010 (e.g. CSC 106) plus generic labeled syllabi.
 */

export type ExtractedOutcome = {
  kind: "PEO" | "PO" | "CO";
  code: string;
  description: string;
};

export type ExtractedAssessment = {
  label: string;
  maxScore: string | null;
};

export type SyllabusExtract = {
  courseCode: string | null;
  title: string | null;
  units: string | null;
  prerequisite: string | null;
  effectivity: string | null;
  outcomes: ExtractedOutcome[];
  assessments: ExtractedAssessment[];
  classPolicies: string | null;
  facultyName: string | null;
  gradingBlurb: string | null;
};

function cleanLine(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/** First capture group after a labeled heading on the same line or next line. */
function labeledValue(text: string, labels: RegExp): string | null {
  const re = new RegExp(
    `(?:^|\\n)\\s*(?:${labels.source})\\s*[:.\\-–—]?\\s*([^\\n]{2,120})`,
    "i",
  );
  const m = re.exec(text);
  if (!m?.[1]) return null;
  const v = cleanLine(m[1]);
  return v.length >= 2 ? v.slice(0, 200) : null;
}

/**
 * CSU Part I: "Course Code and Name : CSC 106 - SOFTWARE ENGINEERING 1"
 */
export function extractCsuCourseCodeAndName(
  text: string,
): { code: string; title: string } | null {
  const m = text.match(
    /Course\s*Code\s*and\s*Name\s*:?\s*([A-Z]{2,6}\s*\d{1,4}[A-Z]?)\s*[-–—]\s*([^\n\t]+?)(?=\s{2,}Credit\s*Units|\s+Credit\s*Units|\t|$)/i,
  );
  if (!m?.[1] || !m[2]) return null;
  const code = cleanLine(m[1]).slice(0, 32);
  let title = cleanLine(m[2]);
  title = title.replace(/\s+Credit\s*Units.*$/i, "").trim();
  if (!code || title.length < 2) return null;
  return { code, title: title.slice(0, 200) };
}

/** Course code patterns: ITE 14, CS101, TEST-101, CSU Part I */
export function extractCourseCode(text: string): string | null {
  const csu = extractCsuCourseCodeAndName(text);
  if (csu) return csu.code;

  const labeled = labeledValue(
    text,
    /(?:course\s*code|subject\s*code|course\s*no\.?|catalog\s*no\.?)/i,
  );
  if (labeled) {
    const code = labeled.match(/[A-Z]{2,6}[\s-]?\d{1,4}[A-Z]?/i)?.[0];
    if (code) return cleanLine(code).slice(0, 32);
  }
  const loose = text.match(/(?:^|\n)\s*([A-Z]{2,6}[\s-]\d{1,4}[A-Z]?)\b/);
  return loose?.[1] ? cleanLine(loose[1]).slice(0, 32) : null;
}

/** Title from CSU Part I name, else null (caller may use preview). */
export function extractCourseTitle(text: string): string | null {
  const csu = extractCsuCourseCodeAndName(text);
  return csu?.title ?? null;
}

export function extractUnits(text: string): string | null {
  /* CSU: Credit Units : Lecture: 2 units Laboratory: 1 unit */
  const csu = text.match(
    /Credit\s*Units\s*:?\s*Lecture:\s*(\d+(?:\.\d+)?)\s*units?\s*Laboratory:\s*(\d+(?:\.\d+)?)\s*units?/i,
  );
  if (csu?.[1] && csu[2]) {
    const total = Number(csu[1]) + Number(csu[2]);
    if (Number.isFinite(total) && total > 0) return String(total);
  }

  const m = text.match(
    /(?:^|\n)\s*(?:units?|credit\s*units?|no\.?\s*of\s*units?)\s*[:.\-–—]?\s*(\d{1,2}(?:\.\d{1,2})?)/i,
  );
  return m?.[1] ?? null;
}

export function extractPrerequisite(text: string): string | null {
  /* CSU: Pre-req: ITE 13 / Co-req: NONE */
  const preReq = text.match(/Pre-?req(?:uisite)?\s*:\s*([^/\n\t]+)/i);
  if (preReq?.[1]) {
    const v = cleanLine(preReq[1]);
    if (v && !/^none$/i.test(v)) return v.slice(0, 200);
  }
  const labeled = labeledValue(text, /prerequisite(?:s)?|pre-?requisite(?:s)?/i);
  if (!labeled) return null;
  /* Avoid swallowing Effectivity when labels are jammed on one line. */
  if (/effectivity|learning\s*modality/i.test(labeled)) return null;
  return labeled.slice(0, 200);
}

export function extractEffectivity(text: string): string | null {
  const csu = text.match(
    /Effectivity\s*:?\s*([^\n\t]+?)(?=\s{2,}Learning\s*Modality|\s+Learning\s*Modality|\t|$)/i,
  );
  if (csu?.[1]) {
    const v = cleanLine(csu[1]);
    if (v.length >= 4) return v.slice(0, 120);
  }
  return labeledValue(
    text,
    /effectivity|effective\s*(?:date|AY|school\s*year)?|academic\s*year/i,
  );
}

/**
 * CSU PEOs: numbered lists under "graduates of BS(CS|IS|IT) program shall".
 * Codes: PEO-CS1, PEO-IS1, PEO-IT1, …
 */
export function extractCsuProgramPeos(text: string): ExtractedOutcome[] {
  const peoHeading = text.search(/Program\s*Educational\s*Objectives\s*\(PEO\)/i);
  const poStart = text.search(
    /(?:^|\n)\s*PO\s*[-.]?\s*1\s*[:.)]|Course\s*Outcomes\s*\(CO\)/i,
  );
  const scopeStart = peoHeading >= 0 ? peoHeading : 0;
  const scopeEnd =
    poStart > scopeStart ? poStart : Math.min(text.length, scopeStart + 8000);
  const scope = text.slice(scopeStart, scopeEnd);

  const programRe =
    /graduates\s+of\s+BS\s*(CS|IS|IT)\s+program\s+shall\s*:/gi;
  const programs: Array<{ track: string; index: number }> = [];
  let pm: RegExpExecArray | null;
  while ((pm = programRe.exec(scope)) !== null) {
    programs.push({
      track: (pm[1] ?? "CS").toUpperCase(),
      index: pm.index + pm[0].length,
    });
  }
  if (programs.length === 0) return [];

  const found: ExtractedOutcome[] = [];
  for (let i = 0; i < programs.length; i++) {
    const prog = programs[i]!;
    const next = programs[i + 1];
    let chunk = scope.slice(prog.index, next ? next.index : undefined);
    /* Stop before mapping table / After completion blurb. */
    const cut = chunk.search(
      /\n\s*After\s+completion|\n\s*IO\s+PEO|\n\s*PO\s*[-.]?\s*\d/i,
    );
    if (cut > 0) chunk = chunk.slice(0, cut);

    const itemRe =
      /(?:^|\n)\s*(\d{1,2})\.\s+([A-Za-z][\s\S]*?)(?=(?:\n\s*\d{1,2}\.\s+[A-Za-z])|\n\s*In\s+3-5\s+years|\n\s*After\s+completion|\n\s*PO\s*[-.]?\s*\d|$)/g;
    let im: RegExpExecArray | null;
    while ((im = itemRe.exec(chunk)) !== null) {
      const n = Number(im[1]);
      if (!Number.isFinite(n) || n < 1 || n > 10) continue;
      let description = cleanLine(im[2] ?? "");
      description = description
        .replace(/\b(?:[IED]\s+){2,}.*$/i, "")
        .replace(/\s+\d{1,2}(?:,\s*\d{1,2})+\s*$/g, "")
        .trim();
      if (description.length < 12) continue;
      /* CS track → PEO1… (form placeholder); IS/IT stay qualified. */
      const code =
        prog.track === "CS"
          ? `PEO${n}`
          : `PEO-${prog.track}${n}`;
      found.push({
        kind: "PEO",
        code: code.slice(0, 24),
        description: description.slice(0, 500),
      });
    }
  }
  return found;
}

/**
 * CSU Course Outcomes (CO) numbered list under "Course Outcomes (CO)".
 */
export function extractCsuCourseOutcomes(text: string): ExtractedOutcome[] {
  const start = text.search(/Course\s*Outcomes\s*\(CO\)/i);
  if (start < 0) return [];
  let section = text.slice(start, start + 6000);
  const cut = section.search(
    /\n\s*Map\s*CO\s*with\s*PO|\n\s*PART\s*III|\n\s*PART\s*IV/i,
  );
  if (cut > 0) section = section.slice(0, cut);

  const found: ExtractedOutcome[] = [];
  const re =
    /(?:^|\n)\s*(\d{1,2})\.\s+([A-Za-z][\s\S]*?)(?=(?:\n\s*\d{1,2}\.\s+[A-Za-z])|\n\s*Map\s*CO|\n\s*PART\s|$)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(section)) !== null) {
    const n = Number(match[1]);
    if (!Number.isFinite(n) || n < 1 || n > 20) continue;
    let description = cleanLine(match[2] ?? "");
    /* Drop trailing mapping noise (lone E/D letters, SDG digits). */
    description = description
      .replace(/\b(?:[IED]\s+){2,}.*$/i, "")
      .replace(/\s+\d{1,2}(?:,\s*\d{1,2})+\s*$/g, "")
      .trim();
    if (description.length < 12) continue;
    found.push({
      kind: "CO",
      code: `CO${n}`,
      description: description.slice(0, 500),
    });
  }
  return found;
}

/**
 * Extract CO/PEO/PO style lines: "CO1 …", "PEO 2:", "PO-3 - …"
 * Plus CSU numbered Course Outcomes list.
 */
export function extractOutcomesFromText(text: string): ExtractedOutcome[] {
  if (!text.trim()) return [];
  const found = new Map<string, ExtractedOutcome>();

  for (const o of extractCsuProgramPeos(text)) {
    found.set(`${o.kind}:${o.code}`, o);
  }
  for (const o of extractCsuCourseOutcomes(text)) {
    found.set(`${o.kind}:${o.code}`, o);
  }

  const re =
    /(?:^|\n)\s*((?:PEO|PO|CO)\s*[-.]?\s*\d{1,2}(?:-\(?[A-Z]{1,4}\)?)?)\s*(?:[:.)]\s*|[-–—]\s+)(?=[A-Za-z])([^\n]{8,400})/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const rawCode = cleanLine(match[1] ?? "");
    const description = cleanLine(match[2] ?? "");
    if (!rawCode || description.length < 8) continue;
    /* Skip bare weight rows like "CO1 30%" */
    if (/^\d+(\.\d+)?%\s*$/.test(description)) continue;
    /* Skip mapping headers: "PO-2 PO-3 PO-4 …" */
    if (/^(?:\d+\s+)?(?:PEO|PO|CO)[\s-]?\d/i.test(description)) continue;
    const kindMatch = rawCode.match(/^(PEO|PO|CO)/i);
    if (!kindMatch) continue;
    const kind = kindMatch[1]!.toUpperCase() as "PEO" | "PO" | "CO";
    /* PO6-(CS) / PO6-IS → PO6-CS / PO6-IS */
    const code = rawCode
      .replace(/[()]/g, "")
      .replace(/\s+/g, "")
      .replace(/–|—/g, "-")
      .toUpperCase()
      .slice(0, 24);
    const key = `${kind}:${code}`;
    if (!found.has(key)) {
      found.set(key, {
        kind,
        code,
        description: description.slice(0, 500),
      });
    }
  }
  const order = { PEO: 0, PO: 1, CO: 2 };
  return [...found.values()].sort(
    (a, b) => order[a.kind] - order[b.kind] || a.code.localeCompare(b.code),
  );
}

/**
 * CSU PART IV CO-weight table task names (Laboratory Worksheet N, Midterm, …).
 * Deduped; maxScore left null (weights are % not points).
 */
export function extractCsuPart4Assessments(
  text: string,
): ExtractedAssessment[] {
  const part4 = text.search(/PART\s*IV/i);
  if (part4 < 0) return [];
  const end = text.search(/\n\s*Class\s*Policies|\n\s*Prepared\s*by\s*:/i);
  const scope = text.slice(part4, end > part4 ? end : undefined);
  const found = new Map<string, ExtractedAssessment>();
  const re =
    /(?:^|\n)\s*((?:Laboratory\s*Worksheet|Lab\s*Worksheet)\s*\d{1,2}|Software\s*Project\s*Proposal\s*Defense|Midterm\s*Exam|Final\s*Project|Final\s*Exam)\b/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(scope)) !== null) {
    const label = cleanLine(match[1] ?? "").slice(0, 120);
    if (label.length < 3) continue;
    const key = label.toLowerCase();
    if (found.has(key)) continue;
    found.set(key, { label, maxScore: null });
    if (found.size >= 40) break;
  }
  return [...found.values()];
}

/** Assessment / activity lines with optional max score. */
export function extractAssessmentsFromText(
  text: string,
): ExtractedAssessment[] {
  if (!text.trim()) return [];
  const csu = extractCsuPart4Assessments(text);
  if (csu.length > 0) return csu;

  const found = new Map<string, ExtractedAssessment>();
  const re =
    /(?:^|\n)\s*((?:Laboratory\s*Worksheet|Lab\s*Worksheet|Quiz|Exam|Midterm(?:\s*Exam)?|Final(?:\s*Exam)?|Project(?:\s*Part\s*\d+)?|Software\s*Project(?:\s*Proposal)?(?:\s*Defense)?|Assignment|Activity|Seatwork|Recitation)\s*[\w\s.#-]{0,40}?)\s*(?:[:.\-–—|(]\s*)?(?:max(?:imum)?\s*)?(?:score\s*)?(\d{1,3}(?:\.\d{1,2})?)?\s*(?:pts?|points?)?/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const label = cleanLine(match[1] ?? "").slice(0, 120);
    if (label.length < 3) continue;
    if (/^CO\d/i.test(label)) continue;
    const key = label.toLowerCase();
    if (found.has(key)) continue;
    const max = match[2] ? match[2] : null;
    found.set(key, { label, maxScore: max });
    if (found.size >= 40) break;
  }
  return [...found.values()];
}

/** Grab a Class Policies section body (skip TOC mentions inside week topics). */
export function extractClassPolicies(text: string): string | null {
  /* Prefer F-CID-010: "Class Policies and Important Reminders" near end. */
  let start = text.search(
    /(?:^|\n)\s*Class\s*Policies\s+and\s+Important\s+Reminders\b/i,
  );
  if (start < 0) {
    start = text.search(
      /(?:^|\n)\s*(?:PART\s*[VIVX0-9.]*\s*[:.]?\s*)?(?:class\s*policies|course\s*policies|classroom\s*policies)\s*[:.\n]/i,
    );
  }
  if (start < 0) return null;
  const from = text.slice(start);
  /* False positive: policies listed inside orientation week topic. */
  if (/1\s*Week|TLO\d|PART\s*III/i.test(from.slice(0, 120))) {
    const real = text.search(
      /(?:^|\n)\s*Class\s*Policies\s+and\s+Important\s+Reminders\b/i,
    );
    if (real < 0) return null;
    return extractClassPoliciesBody(text.slice(real));
  }
  return extractClassPoliciesBody(from);
}

function extractClassPoliciesBody(from: string): string | null {
  const next = from.search(
    /\n\s*(?:References|Prepared\s*by|Reviewed\s*by|PART\s*[IVX]|grading\s*system)\b/i,
  );
  const sliced = (next > 0 ? from.slice(0, next) : from.slice(0, 2500)).trimStart();
  const block = sliced
    .replace(/^Class\s*Policies[^\n]*\n?/i, "")
    .trim();
  if (block.length < 40) return null;
  if (/^1\s*Week/i.test(block)) return null;
  return block.slice(0, 4000);
}

export function extractFacultyName(text: string): string | null {
  /* CSU: Prepared by: … (same line may list Reviewed by) then name before Faculty, */
  const preparedAt = text.search(/Prepared\s*by\s*:/i);
  if (preparedAt >= 0) {
    const slice = text.slice(preparedAt, preparedAt + 500);
    const lines = slice
      .split(/\r?\n/)
      .map((l) => cleanLine(l))
      .filter(Boolean);
    for (const line of lines) {
      if (/prepared\s*by|reviewed\s*by|checked\s*by|approved\s*by/i.test(line)) {
        continue;
      }
      if (/faculty|department|date\s*signed/i.test(line)) break;
      if (
        /^[A-Z][A-Za-z .,'-]{5,80}$/.test(line) &&
        /[A-Z]{2,}/.test(line)
      ) {
        return line.slice(0, 80);
      }
    }
  }

  const labeled = labeledValue(
    text,
    /(?:instructor|course\s*facilitator)/i,
  );
  if (!labeled) return null;
  if (labeled.length > 80) return labeled.slice(0, 80);
  if (/reviewed\s*by|checked\s*by|approved\s*by/i.test(labeled)) return null;
  return labeled;
}

/** Short grading system blurb — prefer PART IV. */
export function extractGradingBlurb(text: string): string | null {
  const part4 = text.search(/PART\s*IV[^\n]*GRADING/i);
  const start =
    part4 >= 0
      ? part4
      : text.search(
          /(?:^|\n)\s*(?:grading\s*system|course\s*grading|grade\s*computation)\s*[:.\n]/i,
        );
  if (start < 0) return null;
  const from = text.slice(start);
  const next = from.search(
    /\n\s*(?:PART\s*[V]|class\s*policies|prepared\s*by|reviewed\s*by)\b/i,
  );
  const block = (next > 0 ? from.slice(0, next) : from.slice(0, 3500))
    .replace(/^PART\s*IV[^\n]*\n?/i, "")
    .replace(/^Grading\s*System\s*\n?/i, "")
    .trim();
  if (block.length < 12) return null;
  if (/^1\s*Week/i.test(block)) return null;
  return block.slice(0, 3000);
}

/**
 * Run all best-effort extractors. Title prefers CSU Part I over preview "COURSE SYLLABUS".
 */
export function extractSyllabusFields(
  text: string,
  previewLines: string[] = [],
): SyllabusExtract {
  const csuTitle = extractCourseTitle(text);
  const previewTitle = previewLines[0]?.trim().slice(0, 80) || null;
  const title =
    csuTitle ??
    (previewTitle && !/^course\s*syllabus$/i.test(previewTitle)
      ? previewTitle
      : null);

  return {
    courseCode: extractCourseCode(text),
    title,
    units: extractUnits(text),
    prerequisite: extractPrerequisite(text),
    effectivity: extractEffectivity(text),
    outcomes: extractOutcomesFromText(text),
    assessments: extractAssessmentsFromText(text),
    classPolicies: extractClassPolicies(text),
    facultyName: extractFacultyName(text),
    gradingBlurb: extractGradingBlurb(text),
  };
}
