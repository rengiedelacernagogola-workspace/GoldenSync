// WHAT: 18-row learning plan for demo subject ITE 14 (topics, outcomes, activities, status).
// HOW: `ITE14_WEEKS` array of `SeedWeek`; Week 9 is “No class”; Week 13 “In progress”.
// SCREEN: Learning Plan table, Checklist week list, This Week preview in prototype.
// EDIT: Row content when Figma P3 / plan §7 week copy changes.
// KEEP: `status` values must match `WeekRowStatus` in components (Done, In progress, etc.).
// RISK: Low
/**
 * Shared week seed — Checklist + Learning Plan (plan §7 / Figma P3).
 */

import type { WeekRowStatus } from "@/components/core";

export type SeedWeek = {
  week: string;
  topic: string;
  outcome: string;
  activities: string;
  status: WeekRowStatus;
};

/** 18-week ITE 14 plan (Week 9 = No class). */
export const ITE14_WEEKS: readonly SeedWeek[] = [
  { week: "1", topic: "Course orientation", outcome: "—", activities: "—", status: "Done" },
  { week: "2", topic: "Data formats: JSON and XML", outcome: "CO1", activities: "Quiz 1", status: "Done" },
  { week: "3", topic: "Web APIs", outcome: "CO1", activities: "Lab 1", status: "Done" },
  { week: "4", topic: "Consuming REST APIs", outcome: "CO1", activities: "Lab 2", status: "Done" },
  { week: "5", topic: "Data validation", outcome: "CO2", activities: "Quiz 2", status: "Done" },
  { week: "6", topic: "Input sanitization", outcome: "CO2", activities: "Lab 3", status: "Done" },
  { week: "7", topic: "Error handling", outcome: "CO2", activities: "—", status: "Done" },
  { week: "8", topic: "Middleware", outcome: "CO2", activities: "—", status: "Done" },
  { week: "9", topic: "No class", outcome: "—", activities: "—", status: "No class" },
  { week: "10", topic: "Authentication", outcome: "CO3", activities: "—", status: "Done" },
  { week: "11", topic: "Access control", outcome: "CO3", activities: "—", status: "Done" },
  { week: "12", topic: "Session management", outcome: "CO3", activities: "—", status: "Done" },
  {
    week: "13",
    topic: "Secure session handling",
    outcome: "CO3",
    activities: "Lab 3",
    status: "In progress",
  },
  {
    week: "14",
    topic: "Midterm assessment",
    outcome: "CO1–CO3",
    activities: "Midterm",
    status: "Not started",
  },
  {
    week: "15",
    topic: "Integration project build",
    outcome: "CO4",
    activities: "Project",
    status: "Not started",
  },
  {
    week: "16",
    topic: "Deployment",
    outcome: "CO4",
    activities: "—",
    status: "Not started",
  },
  {
    week: "17",
    topic: "Testing",
    outcome: "CO4",
    activities: "—",
    status: "Not started",
  },
  {
    week: "18",
    topic: "Final assessment",
    outcome: "CO1–CO4",
    activities: "Final",
    status: "Not started",
  },
];
