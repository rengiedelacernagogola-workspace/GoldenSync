"use client";

// WHAT: One course-outcome summary row in Grade Calculator with attainment %.
// SCREEN: Calculator CO groups — progress bar + attained icon/text.
// HOW: Parent passes percent and labels; >60% counts as attained (with text).
// KEEP: Numbers right-aligned mono (KL-01); never color-only attainment.
// EDIT: Row grid and icons here — scores from parent state.
// RISK: Medium — pairing with ActivityRow for detail scores.

/**
 * OutcomeRow — Calculator outcome group header (Figma `35:1080`, UI-042).
 * FLOW: Calculator → one row per CO. Attained = percent > 60. Never color alone.
 * RULE: numbers mono + right-aligned (KL-01). Excluded = "Other activities".
 */

import { AlertTriangle, Check } from "lucide-react";
import * as React from "react";

import { ProgressBar } from "@/components/core/progress-bar";
import { cn } from "@/lib/utils";

export type OutcomeRowStatus =
  | "Attained"
  | "Not attained"
  | "No scores"
  | "Excluded";

export interface OutcomeRowProps extends React.HTMLAttributes<HTMLDivElement> {
  code?: string;
  description?: string;
  status?: OutcomeRowStatus;
  percent?: string;
  scored?: string;
  /** Show scored-activities ProgressBar (INCOMPLETE path). */
  hasProgress?: boolean;
  progressValue?: number;
}

/** Status cell: icon + text (a11y — never color alone). */
function StatusCell({ status }: { status: OutcomeRowStatus }) {
  if (status === "Attained") {
    return (
      <>
        <Check
          aria-hidden
          className="size-4 shrink-0 text-status-success"
          strokeWidth={2}
        />
        <span className="text-body-sm text-text-secondary">Attained</span>
      </>
    );
  }
  if (status === "Not attained") {
    return (
      <>
        <AlertTriangle
          aria-hidden
          className="size-4 shrink-0 text-status-warning"
          strokeWidth={1.75}
        />
        <span className="text-body-sm text-text-secondary">Not attained</span>
      </>
    );
  }
  if (status === "No scores") {
    return (
      <span className="text-body-sm text-text-muted">No scores yet</span>
    );
  }
  return null;
}

/**
 * One outcome table row — edit status/percent/scored for Calculator seed.
 * Excluded swaps description for "Other activities" blurb and hides progress.
 */
export function OutcomeRow({
  className,
  code = "CO1",
  description = "Describe integration concepts and data formats",
  status = "Attained",
  percent = "85%",
  scored = "2 of 2 scored",
  hasProgress = false,
  progressValue,
  ...props
}: OutcomeRowProps) {
  const isExcluded = status === "Excluded";
  const showProgress =
    hasProgress &&
    (status === "Attained" ||
      status === "Not attained" ||
      status === "No scores");
  const barValue =
    progressValue ??
    (status === "No scores" ? 0 : status === "Attained" ? 100 : 50);

  return (
    <div
      data-slot="gs-outcome-row"
      data-status={status}
      className={cn(
        "flex min-h-[52px] w-full min-w-[720px] items-center border-b border-border-subtle bg-surface-glass",
        className,
      )}
      {...props}
    >
      {!isExcluded ? (
        <div className="flex h-full w-20 shrink-0 items-center px-space-4">
          <span className="whitespace-nowrap font-mono text-mono-md text-text-primary">
            {code}
          </span>
        </div>
      ) : null}

      <div
        className={cn(
          "flex h-full min-w-0 flex-1 px-space-4",
          isExcluded
            ? "flex-col items-start justify-center gap-space-1 py-space-2"
            : "items-center",
        )}
      >
        {isExcluded ? (
          <>
            <span className="text-body-sm font-medium whitespace-nowrap text-text-primary">
              Other activities
            </span>
            <span className="text-caption whitespace-nowrap text-text-muted">
              Excluded from the result.
            </span>
          </>
        ) : (
          <span className="min-w-0 flex-1 text-body-sm text-text-secondary">
            {description}
          </span>
        )}
      </div>

      {showProgress ? (
        <div className="flex h-full w-40 shrink-0 flex-col items-start justify-center gap-space-1 px-space-4">
          <ProgressBar value={barValue} size={4} className="w-full" />
          <span className="whitespace-nowrap font-mono text-mono-sm text-text-muted">
            {scored}
          </span>
        </div>
      ) : null}

      <div
        className={cn(
          "flex h-full w-36 shrink-0 items-center px-space-4",
          !isExcluded && "gap-space-1",
        )}
      >
        <StatusCell status={status} />
      </div>

      <div className="flex h-full w-24 shrink-0 items-center justify-end px-space-4">
        {isExcluded || status === "No scores" ? (
          <span className="font-mono text-mono-md text-text-muted">—</span>
        ) : (
          <span className="whitespace-nowrap font-mono text-mono-md text-text-primary">
            {percent}
          </span>
        )}
      </div>
    </div>
  );
}
