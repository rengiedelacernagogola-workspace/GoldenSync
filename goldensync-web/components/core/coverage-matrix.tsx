"use client";

/**
 * CoverageMatrix — Assessment Map grid (Figma `39:1613` + Cell `39:1612`, UI-047).
 * FLOW: Overview → 8 activities × 4 outcomes (plan 9.2). Read-only.
 * RULE: Mapped=Check 16 on tint-accent-bg; False = "—" muted.
 */

import { Check } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export interface CoverageMatrixRow {
  activity: string;
  max: string;
  /** Length 4 — CO1…CO4 mapped flags. */
  mapped: readonly [boolean, boolean, boolean, boolean];
}

export interface CoverageMatrixProps
  extends React.HTMLAttributes<HTMLDivElement> {
  outcomes?: readonly string[];
  rows?: readonly CoverageMatrixRow[];
}

/** Seed coverage from Figma / plan 9.2. */
const DEFAULT_ROWS: readonly CoverageMatrixRow[] = [
  { activity: "Quiz 1", max: "50", mapped: [true, false, false, false] },
  { activity: "Quiz 2", max: "50", mapped: [true, false, false, false] },
  { activity: "Midterm Exam", max: "50", mapped: [false, true, false, false] },
  { activity: "Lab 1", max: "50", mapped: [false, true, false, false] },
  { activity: "Lab 3", max: "50", mapped: [false, false, true, false] },
  { activity: "Project Part 1", max: "50", mapped: [false, false, true, false] },
  { activity: "Project Part 2", max: "50", mapped: [false, false, false, true] },
  { activity: "Final Exam", max: "50", mapped: [false, false, false, true] },
];

const DEFAULT_OUTCOMES = ["CO1", "CO2", "CO3", "CO4"] as const;

/** One matrix cell — Mapped check or em dash. */
function CoverageMatrixCell({ mapped }: { mapped: boolean }) {
  return (
    <div
      data-slot="gs-coverage-matrix-cell"
      data-mapped={mapped ? "true" : "false"}
      className={cn(
        "flex h-[52px] w-24 shrink-0 items-center justify-center",
        mapped && "bg-tint-accent-bg",
      )}
    >
      {mapped ? (
        <Check
          aria-hidden
          className="size-4 text-accent-primary"
          strokeWidth={2}
        />
      ) : (
        <span className="text-body-sm text-text-muted">—</span>
      )}
    </div>
  );
}

/**
 * Read-only coverage table — edit rows/outcomes to match subject seed map.
 */
export function CoverageMatrix({
  className,
  outcomes = DEFAULT_OUTCOMES,
  rows = DEFAULT_ROWS,
  ...props
}: CoverageMatrixProps) {
  return (
    <div
      data-slot="gs-coverage-matrix"
      className={cn(
        "glass-sm flex w-full max-w-[720px] flex-col items-start overflow-hidden rounded-lg border border-border-subtle",
        className,
      )}
      {...props}
    >
      <div className="flex h-10 w-full shrink-0 items-center border-b border-border-default bg-bg-subtle">
        <div className="flex min-w-0 flex-1 items-center px-space-4">
          <span className="text-overline uppercase text-text-muted">
            Activity
          </span>
        </div>
        <div className="flex w-24 shrink-0 items-center justify-end px-space-4">
          <span className="text-overline uppercase text-text-muted">Max</span>
        </div>
        {outcomes.map((co) => (
          <div
            key={co}
            className="flex w-24 shrink-0 items-center justify-center px-space-4"
          >
            <span className="text-overline uppercase text-text-muted">{co}</span>
          </div>
        ))}
      </div>

      {rows.map((row) => (
        <div
          key={row.activity}
          className="flex min-h-[52px] w-full items-center border-b border-border-subtle last:border-b-0"
        >
          <div className="flex min-w-0 flex-1 items-center px-space-4">
            <span className="whitespace-nowrap text-body-sm text-text-primary">
              {row.activity}
            </span>
          </div>
          <div className="flex w-24 shrink-0 items-center justify-end px-space-4">
            <span className="font-mono text-mono-md text-text-secondary">
              {row.max}
            </span>
          </div>
          {row.mapped.map((m, i) => (
            <CoverageMatrixCell key={`${row.activity}-${i}`} mapped={m} />
          ))}
        </div>
      ))}
    </div>
  );
}
