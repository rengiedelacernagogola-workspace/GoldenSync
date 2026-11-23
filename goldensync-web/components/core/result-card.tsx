"use client";

/**
 * ResultCard — Grade Calculator result (Figma `38:1476`, UI-045).
 * FLOW: Calculator Complete → show Estimated (self-reported). No card for INCOMPLETE.
 * RULE: isGradeHidden = release gate 9.4 (PASSED / INTERVENTION_A only).
 */

import { AlertTriangle, Info } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/core/badge";
import {
  ResultStatusBadge,
  type ResultStatus,
} from "@/components/core/result-status-badge";
import { cn } from "@/lib/utils";

export type ResultCardStatus = Exclude<ResultStatus, "INCOMPLETE">;

export interface WeakOutcome {
  code: string;
  topic: string;
  percent: string;
}

export interface ResultCardProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: ResultCardStatus;
  /** Release gate 9.4 — hide numeric grade for PASSED / INT_A. */
  isGradeHidden?: boolean;
  average?: string;
  outcomesAttained?: string;
  grade?: string;
  note?: string;
  weakOutcomes?: readonly WeakOutcome[];
}

/** Default note when grade is hidden (Appendix A / plan 9.4). */
const GRADE_HIDDEN_NOTE =
  "Numeric grade hidden until the official grade scale is confirmed.";

/** Default note for UNDEFINED_AT_THRESHOLD. */
const UNDEFINED_NOTE =
  "UNDEFINED_AT_THRESHOLD: no grade. The syllabus does not define this case. Confirm with your instructor.";

/**
 * Calculator result shell — edit metrics/weakOutcomes per plan 9.3 scenario.
 * Always shows "Estimated (self-reported)" Badge.
 */
export function ResultCard({
  className,
  status = "PASSED",
  isGradeHidden = true,
  average = "81.25%",
  outcomesAttained = "4 of 4",
  grade = "1.75",
  note,
  weakOutcomes,
  ...props
}: ResultCardProps) {
  /* Grade column: release gate + statuses that show a number in Figma. */
  const gradeColumn =
    !isGradeHidden &&
    (status === "PASSED" ||
      status === "INTERVENTION_A" ||
      status === "INTERVENTION_B" ||
      status === "FAILED");

  const showHiddenNote =
    (isGradeHidden &&
      (status === "PASSED" || status === "INTERVENTION_A")) ||
    status === "UNDEFINED_AT_THRESHOLD" ||
    status === "INTERVENTION_B";

  const showWeak =
    status === "INTERVENTION_A" ||
    status === "INTERVENTION_B" ||
    status === "FAILED";

  const resolvedNote =
    note ??
    (status === "UNDEFINED_AT_THRESHOLD"
      ? UNDEFINED_NOTE
      : status === "INTERVENTION_B"
        ? "This is your best possible grade 3.0 after the weak outcomes pass."
        : GRADE_HIDDEN_NOTE);

  const NoteIcon =
    status === "UNDEFINED_AT_THRESHOLD" ? AlertTriangle : Info;

  return (
    <div
      data-slot="gs-result-card"
      data-status={status}
      data-grade-hidden={isGradeHidden ? "true" : "false"}
      className={cn(
        "glass-md relative flex w-full max-w-[560px] flex-col items-start gap-space-4 rounded-lg p-space-6",
        className,
      )}
      {...props}
    >
      <div className="relative flex w-full items-center justify-between gap-space-3">
        <ResultStatusBadge status={status} />
        <Badge label="Estimated (self-reported)" size="sm" variant="Default" />
      </div>

      <div className="relative flex w-full items-start gap-space-8">
        <div className="flex flex-col items-start gap-space-1">
          <p className="text-overline uppercase text-text-muted">Average</p>
          <p className="text-display-sm tracking-[-0.3px] whitespace-nowrap text-text-primary">
            {average}
          </p>
        </div>

        <div className="flex flex-col items-start gap-space-1">
          <p className="text-overline uppercase text-text-muted">
            Outcomes attained
          </p>
          <p className="text-heading-lg tracking-[-0.1px] whitespace-nowrap text-text-secondary">
            {outcomesAttained}
          </p>
        </div>

        {gradeColumn ? (
          <div className="flex flex-col items-start gap-space-1">
            <p className="text-overline uppercase text-text-muted">Grade</p>
            <p className="text-display-sm tracking-[-0.3px] whitespace-nowrap text-text-primary">
              {grade}
            </p>
            {(status === "PASSED" || status === "INTERVENTION_A") &&
            !isGradeHidden ? (
              <Badge
                label="Demo value, official scale pending"
                size="sm"
                variant="Warning"
              />
            ) : null}
          </div>
        ) : null}
      </div>

      {showHiddenNote ? (
        <div className="relative flex w-full items-start gap-space-2">
          <NoteIcon
            aria-hidden
            className={cn(
              "mt-0.5 size-4 shrink-0",
              status === "UNDEFINED_AT_THRESHOLD"
                ? "text-status-warning"
                : "text-text-muted",
            )}
            strokeWidth={1.75}
          />
          <p className="min-w-0 flex-1 text-body-sm text-text-secondary">
            {resolvedNote}
          </p>
        </div>
      ) : null}

      {showWeak ? (
        <>
          <div className="relative h-px w-full bg-border-subtle" />
          <div className="relative flex w-full flex-col items-start gap-space-2">
            <p className="text-overline uppercase text-text-muted">
              Weak outcomes and plan topics
            </p>
            {(weakOutcomes ?? []).map((row) => (
              <div
                key={row.code}
                className="flex w-full items-center gap-space-3 rounded-md bg-bg-subtle px-space-3 py-space-2 text-body-sm"
              >
                <span className="shrink-0 font-mono text-mono-md whitespace-nowrap text-text-primary">
                  {row.code}
                </span>
                <span className="min-w-0 flex-1 text-text-secondary">
                  {row.topic}
                </span>
                <span className="shrink-0 text-right font-mono text-mono-md whitespace-nowrap text-text-primary">
                  {row.percent}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
