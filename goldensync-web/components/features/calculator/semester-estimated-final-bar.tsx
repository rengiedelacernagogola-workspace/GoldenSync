"use client";

/**
 * Semester Estimated Final grade — progress bar from CO-weighted finalAverage.
 */

import * as React from "react";

import { Card } from "@/components/core";
import {
  formatPct,
  type CalculatorSnapshot,
} from "@/lib/domain/co-grade-calculator";
import { cn } from "@/lib/utils";

export type SemesterEstimatedFinalBarProps = {
  snapshot: CalculatorSnapshot;
  subjectCode: string;
  subjectTitle: string;
};

function clampPercent(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

/** Bottom bar: subject name + numeric estimate + fill from finalAverage. */
export function SemesterEstimatedFinalBar({
  snapshot,
  subjectCode,
  subjectTitle,
}: SemesterEstimatedFinalBarProps) {
  const pct = clampPercent(snapshot.finalAverage);
  const hasScores = snapshot.anyScoreEntered;
  const subjectLabel = [subjectCode.trim(), subjectTitle.trim()]
    .filter(Boolean)
    .join(" — ");

  return (
    <Card
      title="Semester Estimated Final grade"
      hasHeader
      className="w-full min-w-0"
    >
      <div className="flex w-full min-w-0 flex-col gap-space-4">
        <p className="text-body-sm text-text-secondary">
          {subjectLabel || "—"}
        </p>

        <div className="flex flex-wrap items-end justify-between gap-space-3">
          <div className="flex flex-col gap-space-1">
            <span className="text-caption uppercase tracking-wide text-text-muted">
              Estimated average
            </span>
            <p className="text-heading-lg tabular-nums text-text-primary">
              {hasScores ? `${formatPct(pct)}%` : "—"}
            </p>
          </div>
          {hasScores && snapshot.grade ? (
            <p className="text-body-sm tabular-nums text-text-secondary">
              Scale grade{" "}
              <span className="font-semibold text-text-primary">
                {snapshot.grade.numerical} ({snapshot.grade.letter})
              </span>
            </p>
          ) : (
            <p className="text-caption text-text-muted">
              Enter scores to estimate
            </p>
          )}
        </div>

        <div
          className="h-3 w-full overflow-hidden rounded-full bg-bg-muted"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={hasScores ? Math.round(pct) : 0}
          aria-label="Semester estimated final grade progress"
        >
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-300 ease-out",
              "bg-gradient-to-r from-accent-tertiary to-accent-primary",
            )}
            style={{ width: `${hasScores ? pct : 0}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
