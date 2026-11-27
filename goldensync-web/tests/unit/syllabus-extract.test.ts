/**
 * Best-effort syllabus extractors (generic + CSU F-CID-010).
 * Run: npm run test:unit
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import { extractGradingTemplateFromText } from "../../lib/domain/grading-template.ts";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  extractAssessmentsFromText,
  extractClassPolicies,
  extractCourseCode,
  extractCourseTitle,
  extractCsuProgramPeos,
  extractEffectivity,
  extractFacultyName,
  extractOutcomesFromText,
  extractPrerequisite,
  extractSyllabusFields,
  extractUnits,
} from "../../lib/domain/syllabus-extract.ts";
import {
  extractCsuOneWeekBlocks,
  extractPlanWeeksFromText,
} from "../../lib/domain/syllabus-plan.ts";

const FIXTURE_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "../fixtures",
);

const CSU_PART_I = `
PART I: COURSE SPECIFICATION
Course Code and Name 	: 	CSC 106 - SOFTWARE ENGINEERING 1 	Credit Units 	: Lecture: 2 units 	Laboratory: 1 unit
Pre-requisite/ Co-requisite : 	Pre-req: ITE 13 / Co-req: NONE 	Total Contact Hours 	: Lecture: 54 hours 	Laboratory: 36 hours
Effectivity 	: 	2nd Semester A.Y. 2025-2026 	Learning Modality 	: Onsite/ Online
`;

const CSU_COS = `
Course Outcomes (CO)
After completing this course, the learner must be able to: at least 3 levels of
learning domain
1. Analyze complex software problems to create clear user
requirements and functional prototypes.
2. Design a software system's structure and data using
industry-standard modeling techniques.
3. Create a working software application within a team using modern
development practices and version control.
4. Evaluate software quality through systematic testing to ensure the
final product meets technical and user standards.
Map CO with PO. Use I – Introductory, E – Enabling, D – Demonstrative
`;

const CSU_PLAN = `
PART III: TEACHING AND LEARNING PLAN
1 Week
Get oriented with the course syllabus, teaching
and learning activities, assessment, etc.
VM, Quality Policy, Graduate Attributes,
PEO, PO, CO, Course Syllabus, Teaching
and Learning Activities, Method of
Assessment, Grading System, Class Policies
1 Week
TLO1: Analyze software engineering principles
by evaluating historical crises, quality
characteristics, and professional ethical
responsibilities.
1
Introduction to Software Engineering
● Definition of Software
Engineering
Discussion
1 Week
TLO2: Analyze the SDLC phases to propose an
optimal development workflow for complex
software projects.
1
Software Development Life Cycle (SDLC)
● Overview of SDLC
PART IV. GRADING SYSTEM
`;

test("extracts course code and units when labeled", () => {
  const text = `
Course Code: ITE 14
Course Title: Data Structures
Units: 3
Prerequisite: ITE 12
`;
  assert.match(extractCourseCode(text) ?? "", /ITE\s*14/i);
  assert.equal(extractUnits(text), "3");
});

test("extracts CO lines and ignores noise", () => {
  const text = `
CO1: Analyze complex software problems to create requirements.
CO2 - Design a software system's structure using models.
Random line without a code.
`;
  const cos = extractOutcomesFromText(text).filter((o) => o.kind === "CO");
  assert.equal(cos.length, 2);
  assert.match(cos[0]?.code ?? "", /CO1/i);
});

test("extracts assessment labels best-effort", () => {
  const text = `
Quiz 1: 50 points
Midterm Exam (100)
Lab 3 - 50 pts
`;
  const rows = extractAssessmentsFromText(text);
  assert.ok(rows.length >= 2);
  assert.ok(rows.some((r) => /Quiz/i.test(r.label)));
});

test("returns empty arrays when nothing found", () => {
  const fields = extractSyllabusFields("hello world only");
  assert.deepEqual(fields.outcomes, []);
  assert.deepEqual(fields.assessments, []);
  assert.equal(fields.classPolicies, null);
});

test("still finds plan weeks via classic Week N labels", () => {
  const weeks = extractPlanWeeksFromText(
    "Week 1: Orientation\nWeek 2 - Arrays",
  );
  assert.deepEqual(
    weeks.map((w) => w.weekNumber),
    [1, 2],
  );
});

test("CSU F-CID-010 Part I: code, title, units, prereq, effectivity", () => {
  assert.equal(extractCourseCode(CSU_PART_I), "CSC 106");
  assert.match(extractCourseTitle(CSU_PART_I) ?? "", /SOFTWARE ENGINEERING/i);
  assert.equal(extractUnits(CSU_PART_I), "3");
  assert.match(extractPrerequisite(CSU_PART_I) ?? "", /ITE\s*13/i);
  assert.match(extractEffectivity(CSU_PART_I) ?? "", /2025-2026/);
});

test("CSU numbered Course Outcomes become CO1–CO4", () => {
  const cos = extractOutcomesFromText(CSU_COS).filter((o) => o.kind === "CO");
  assert.equal(cos.length, 4);
  assert.equal(cos[0]?.code, "CO1");
  assert.match(cos[0]?.description ?? "", /Analyze complex software/i);
  assert.equal(cos[3]?.code, "CO4");
});

test("CSU PEO blocks under BS CS/IS/IT become PEO-CS1…", () => {
  const text = `
Program Educational Objectives (PEO) 	Program Outcomes (PO) aligned with this Course
In 3-5 years, the graduates of BSCS program shall: 	IO
1. Demonstrate problem-solving and critical thinking skills, capable of
analyzing complex computing challenges.
2. Engage in research or technological advancements aligned with SDG.
3. Actively pursue lifelong learning, continuously enhancing their expertise.
In 3-5 years, the graduates of BSIS program shall: 	IO
1. Engage in solving technical and organizational challenges by applying ICT.
In 3-5 years, the graduates of BSIT program shall: 	IO
1. Demonstrate competency in analyzing, designing and evaluating ICT solutions.
After completion of the program, the graduates must have the:
PO-1: Analyze a complex computing problem and to apply principles of computing.
`;
  const peos = extractCsuProgramPeos(text);
  assert.ok(peos.length >= 5);
  assert.equal(peos[0]?.code, "PEO1");
  assert.match(peos[0]?.description ?? "", /problem-solving/i);
  assert.ok(peos.some((p) => p.code === "PEO-IS1"));
  assert.ok(peos.some((p) => p.code === "PEO-IT1"));
  const all = extractOutcomesFromText(text);
  assert.ok(all.some((o) => o.kind === "PEO" && o.code === "PEO1"));
  assert.ok(all.some((o) => o.kind === "PO" && o.code === "PO-1"));
});

test("CSU PART III 1-Week blocks become sequential plan weeks", () => {
  const weeks = extractCsuOneWeekBlocks(CSU_PLAN);
  assert.ok(weeks.length >= 3);
  assert.equal(weeks[0]?.weekNumber, 1);
  assert.match(weeks[0]?.topic ?? "", /oriented with the course syllabus/i);
  assert.equal(weeks[1]?.weekNumber, 2);
  assert.match(weeks[1]?.topic ?? "", /Introduction to Software Engineering/i);
  assert.equal(weeks[2]?.weekNumber, 3);
  assert.match(weeks[2]?.topic ?? "", /Software Development Life Cycle/i);
});

test("CSU Prepared by yields faculty name", () => {
  const text = `
Prepared by: 	Reviewed by:
EDWIN MANUEL M. JARLATA
Faculty, Department of IT
`;
  assert.match(extractFacultyName(text) ?? "", /JARLATA/i);
});

test("extractSyllabusFields prefers CSU title over COURSE SYLLABUS preview", () => {
  const fields = extractSyllabusFields(CSU_PART_I, ["COURSE SYLLABUS"]);
  assert.equal(fields.courseCode, "CSC 106");
  assert.match(fields.title ?? "", /SOFTWARE ENGINEERING/i);
  assert.equal(fields.units, "3");
});

test("CSU Class Policies and Important Reminders body", () => {
  const text = `
Domain Evaluation (C-Cognitive, P-Psychomotor, A-Affective)
Class Policies and Important Reminders
● Rubrics are presented to the class or given together with the Instruction for a particular Assessment. You may ask your instructor the rubrics in case it was not given prior
to giving a project-based assessment, essay, case study, etc.
● Any student proven to have committed fraud, following due process, shall receive a failing grade for the course.
● Refer to the student handbook for the code of conduct inside/ outside the classroom.
References
● Online Learning Management System
`;
  const policies = extractClassPolicies(text);
  assert.ok(policies);
  assert.match(policies ?? "", /Rubrics are presented/i);
  assert.match(policies ?? "", /fraud/i);
});

test("CSU PART IV CO weight table → grading template + assessments", () => {
  const text = `
PART IV. GRADING SYSTEM
CO Weight % 	Assessment Task 	Weight Final
Weight C/P/A
CO1 	30%
Laboratory Worksheet 1 	16.67% 	5% 	C
Laboratory Worksheet 2 	16.67% 	5% 	C
Software Project Proposal Defense 33.33% 	10% 	C/P
Midterm Exam 	16.67% 	5% 	C
CO2 	30%
Laboratory Worksheet 4 	16.67% 	5% 	C
Midterm Exam 	16.67% 	5% 	C
CO3 	20%
Laboratory Worksheet 8 	25% 	5% 	C
Final Project 	50% 	10% 	C/P
CO4 	20%
Laboratory Worksheet 10 	25% 	5% 	C
Final Project 	50% 	10% 	C/P
Domain Evaluation (C-Cognitive, P-Psychomotor, A-Affective)
Class Policies and Important Reminders
● Rubrics are presented to the class with enough detail for assessments.
`;
  const doc = extractGradingTemplateFromText(text);
  assert.ok(doc);
  assert.equal(doc!.version, 1);
  assert.equal(doc!.coGroups.length, 4);
  assert.equal(doc!.coGroups[0]?.code, "CO1");
  assert.equal(doc!.coGroups[0]?.weightPercent, "30%");
  assert.ok(
    doc!.coGroups[0]!.tasks.some((t) =>
      /Laboratory Worksheet 1/i.test(t.task),
    ),
  );
  assert.ok(
    doc!.coGroups[2]!.tasks.some((t) => /Final Project/i.test(t.task)),
  );

  const assessments = extractAssessmentsFromText(text);
  assert.ok(assessments.some((a) => /Laboratory Worksheet 1/i.test(a.label)));
  assert.ok(assessments.some((a) => /Midterm Exam/i.test(a.label)));
  assert.ok(assessments.some((a) => /Final Project/i.test(a.label)));
  assert.ok(!assessments.some((a) => a.label.toLowerCase() === "exam"));
});

test("CSU N-Week durations expand (2 weeks, 3 weeks, summative)", () => {
  const text = `
PART III: TEACHING AND LEARNING PLAN
1 Week
Get oriented with the course syllabus, teaching
and learning activities, assessment, etc.
1 Week
TLO1: Analyze software engineering principles
1
Introduction to Software Engineering
2 weeks
TLO11: Evaluate software quality by designing
4
Software Testing Fundamentals
3 weeks
TLO12: Create a software project by synthesizing
4
Course Project
2 Weeks 	Summative Assessment (Midterm Exam/ Final Project Assessment), Performance-based Assessment
PART IV. GRADING SYSTEM
`;
  const weeks = extractCsuOneWeekBlocks(text);
  /* 1 + 1 + 2 + 3 + 2 = 9 */
  assert.equal(weeks.length, 9);
  assert.match(weeks[0]?.topic ?? "", /oriented with the course syllabus/i);
  assert.match(weeks[1]?.topic ?? "", /Introduction to Software Engineering/i);
  assert.match(weeks[2]?.topic ?? "", /Software Testing Fundamentals/i);
  assert.equal(weeks[3]?.topic, weeks[2]?.topic);
  assert.match(weeks[4]?.topic ?? "", /Course Project/i);
  assert.equal(weeks[6]?.topic, weeks[4]?.topic);
  assert.match(weeks[7]?.topic ?? "", /Summative Assessment/i);
  assert.equal(weeks[8]?.weekNumber, 9);
});

test("F-CID-009 ITE 14 syllabus: Part I + faculty + policies adapt", () => {
  const text = readFileSync(
    join(FIXTURE_DIR, "ite14-fcid009-syllabus.txt"),
    "utf8",
  );
  const fields = extractSyllabusFields(text);
  assert.equal(fields.courseCode, "ITE 14");
  assert.match(fields.title ?? "", /Data Structures/i);
  assert.equal(fields.units, "3");
  assert.match(fields.prerequisite ?? "", /ITE\s*13/i);
  assert.doesNotMatch(fields.prerequisite ?? "", /Total Contact/i);
  assert.match(fields.effectivity ?? "", /2025-2026/);
  assert.match(fields.facultyName ?? "", /NAKAZATO/i);
  assert.doesNotMatch(fields.facultyName ?? "", /ABAO/);
  assert.ok((fields.classPolicies?.length ?? 0) > 100);
});

test("F-CID-009 ITE 14: PEO Keywords, multiline PO, CO list", () => {
  const text = readFileSync(
    join(FIXTURE_DIR, "ite14-fcid009-syllabus.txt"),
    "utf8",
  );
  const outcomes = extractOutcomesFromText(text);
  const peos = outcomes.filter((o) => o.kind === "PEO");
  const pos = outcomes.filter((o) => o.kind === "PO");
  const cos = outcomes.filter((o) => o.kind === "CO");
  assert.ok(peos.some((p) => p.code === "PEO1"));
  assert.ok(peos.some((p) => p.code === "PEO-IS1"));
  assert.ok(peos.some((p) => /Keywords|Problem Solving/i.test(p.description)));
  assert.ok(pos.some((p) => p.code === "PO1"));
  assert.match(
    pos.find((p) => p.code === "PO1")?.description ?? "",
    /complex computing problem/i,
  );
  assert.doesNotMatch(
    pos.find((p) => p.code === "PO1")?.description ?? "",
    /\b1,2\b/,
  );
  assert.equal(cos.length, 4);
  assert.equal(cos[0]?.code, "CO1");
});

test("F-CID-009 ITE 14: plan-embedded assessments when Part IV table is image", () => {
  const text = readFileSync(
    join(FIXTURE_DIR, "ite14-fcid009-syllabus.txt"),
    "utf8",
  );
  const rows = extractAssessmentsFromText(text);
  assert.ok(rows.some((r) => /Long Quiz 1/i.test(r.label)));
  assert.ok(rows.some((r) => /Problem Set 1/i.test(r.label)));
  assert.ok(rows.some((r) => /Midterm Exam/i.test(r.label)));
  assert.ok(rows.some((r) => /Final Exam/i.test(r.label)));
  assert.ok(!rows.some((r) => /^exam$/i.test(r.label)));
});

test("F-CID-009 ITE 14: plan prefers CO titles over jammed LO lines", () => {
  const text = readFileSync(
    join(FIXTURE_DIR, "ite14-fcid009-syllabus.txt"),
    "utf8",
  );
  const weeks = extractPlanWeeksFromText(text);
  assert.ok(weeks.length >= 10);
  assert.match(weeks[0]?.topic ?? "", /oriented with the course/i);
  assert.match(weeks[1]?.topic ?? "", /Review and Mastery of ITE 13/i);
  assert.doesNotMatch(weeks[1]?.topic ?? "", /^1\.\s*Use arrays/i);
  assert.ok(weeks.some((w) => /MIDTERM\s*EXAM/i.test(w.topic)));
  assert.ok(weeks.some((w) => /ACADEMIC\s*BREAK/i.test(w.topic)));
  assert.ok(weeks.some((w) => /FINAL\s*EXAM/i.test(w.topic)));
});

test("F-CID-010 CSC 103: Part I units + bullet PEOs + Lab Activity assessments", () => {
  const text = readFileSync(
    join(FIXTURE_DIR, "csc103-fcid010-syllabus.txt"),
    "utf8",
  );
  const fields = extractSyllabusFields(text);
  assert.equal(fields.courseCode, "CSC 103");
  assert.match(fields.title ?? "", /Discrete Structures 2/i);
  assert.equal(fields.units, "3");
  assert.match(fields.prerequisite ?? "", /CSC\s*102/i);
  assert.match(fields.facultyName ?? "", /CORREA/i);

  const outcomes = extractOutcomesFromText(text);
  const peos = outcomes.filter((o) => o.kind === "PEO");
  const pos = outcomes.filter((o) => o.kind === "PO");
  assert.ok(peos.length >= 3);
  assert.ok(peos.some((p) => /problem-solving/i.test(p.description)));
  assert.ok(pos.some((p) => p.code === "PO6-CS"));
  assert.doesNotMatch(
    pos.find((p) => p.code === "PO3")?.description ?? "",
    /\bPEO3\b/,
  );

  const rows = extractAssessmentsFromText(text);
  assert.ok(rows.some((r) => /Lab Activity 1/i.test(r.label)));
  assert.ok(rows.some((r) => /Long Quiz 1/i.test(r.label)));
  assert.ok(rows.some((r) => /Midterm Exam/i.test(r.label)));
});

test("F-CID-010 CSC 103: plan uses CO-digit topics not LO bullets", () => {
  const text = readFileSync(
    join(FIXTURE_DIR, "csc103-fcid010-syllabus.txt"),
    "utf8",
  );
  const weeks = extractPlanWeeksFromText(text);
  assert.ok(weeks.length >= 16);
  assert.match(weeks[0]?.topic ?? "", /Orientation/i);
  assert.match(weeks[1]?.topic ?? "", /Number Theory/i);
  assert.doesNotMatch(weeks[1]?.topic ?? "", /Midterm Exam/i);
  assert.ok(weeks.some((w) => /Probability/i.test(w.topic)));
  assert.ok(weeks.some((w) => /Graph Theory/i.test(w.topic)));
  assert.ok(weeks.some((w) => /Automata.*Grammars/i.test(w.topic)));
  assert.ok(weeks.some((w) => /Summative Assessment \(Midterm/i.test(w.topic)));
  assert.ok(weeks.some((w) => /Intervention/i.test(w.topic)));
});
