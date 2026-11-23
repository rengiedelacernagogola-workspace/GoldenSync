/**
 * Prototype seed — plan §7 (invented demo data).
 * UI-004: single source for screens; never import this from components (use repositories later).
 * Cover warning: seed data is for the prototype UI track only.
 */

import {
  asActivityId,
  asOutcomeId,
  asSemesterId,
  asSubjectId,
} from "@/domain/types";
import type { GoldenSyncSeed } from "@/data/seed/seed-types";

const CO1 = asOutcomeId("co1");
const CO2 = asOutcomeId("co2");
const CO3 = asOutcomeId("co3");
const CO4 = asOutcomeId("co4");

const ITE14 = asSubjectId("ite-14");
const ITE15 = asSubjectId("ite-15");
const GEC4 = asSubjectId("gec-4");

/** Frozen seed bag — edit only to match plan §7 / Figma seed. */
export const goldenSyncSeed: GoldenSyncSeed = {
  account: {
    email: "juan.delacruz@example.edu",
    displayName: "Juan Dela Cruz",
  },
  clock: {
    todayIso: "2026-11-10",
    timeZone: "Asia/Manila",
  },
  semester: {
    id: asSemesterId("sem-2026-1"),
    label: "1st Semester AY 2026–2027",
    startIso: "2026-08-17",
    endIso: "2026-12-18",
    skippedWeeks: [9],
    currentWeek: 13,
    planWeeks: 18,
  },
  subjects: [
    {
      id: ITE14,
      code: "ITE 14",
      title: "Integrative Programming",
      units: 3,
      weeksDone: 11,
      weeksTotal: 18,
      isActive: true,
    },
    {
      id: ITE15,
      code: "ITE 15",
      title: "Information Assurance",
      units: 3,
      weeksDone: 9,
      weeksTotal: 18,
      isActive: false,
    },
    {
      id: GEC4,
      code: "GEC 4",
      title: "Mathematics in the Modern World",
      units: 3,
      weeksDone: 12,
      weeksTotal: 18,
      isActive: false,
    },
  ],
  activeSubject: {
    id: ITE14,
    prerequisite: "ITE 13",
    effectivity: "AY 2026–2027",
    peos: ["PEO1", "PEO2", "PEO3"],
    pos: ["PO a", "PO b", "PO c", "PO d"],
    outcomes: [
      { id: CO1, code: "CO1", label: "CO1" },
      { id: CO2, code: "CO2", label: "CO2" },
      { id: CO3, code: "CO3", label: "CO3" },
      { id: CO4, code: "CO4", label: "CO4" },
    ],
    activities: [
      {
        id: asActivityId("quiz-1"),
        label: "Quiz 1",
        maxScore: 50,
        outcomeIds: [CO1],
      },
      {
        id: asActivityId("lab-1"),
        label: "Lab 1",
        maxScore: 50,
        outcomeIds: [CO1],
      },
      {
        id: asActivityId("quiz-2"),
        label: "Quiz 2",
        maxScore: 50,
        outcomeIds: [CO2],
      },
      {
        id: asActivityId("lab-2"),
        label: "Lab 2",
        maxScore: 50,
        outcomeIds: [CO2],
      },
      {
        id: asActivityId("lab-3"),
        label: "Lab 3",
        maxScore: 50,
        outcomeIds: [CO3],
      },
      {
        id: asActivityId("midterm"),
        label: "Midterm Exam",
        maxScore: 50,
        outcomeIds: [CO3],
      },
      {
        id: asActivityId("project"),
        label: "Project",
        maxScore: 50,
        outcomeIds: [CO4],
      },
      {
        id: asActivityId("final"),
        label: "Final Exam",
        maxScore: 50,
        outcomeIds: [CO4],
      },
    ],
    gradingBlurb:
      "Class standing and major exams follow the syllabus grading breakdown. Estimates in GoldenSync are self-reported and not official.",
    policiesBlurb:
      "Attendance, late work, and academic integrity follow the published class policies. See the syllabus PDF for the full text.",
    facultyBlurb:
      "Course faculty and consultation hours are listed in the syllabus. Contact details are for the enrolled student only.",
  },
};
