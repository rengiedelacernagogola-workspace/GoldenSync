"use client";

// WHAT: Step list + progress bar for PDF upload pipeline stages.
// SCREEN: Add Subject while PDF is Uploading → Extracting → Parsing → Complete.
// HOW: step prop drives check/spinner per row; ProgressBar at 0/33/66/100.
// KEEP: Parent advances step from ingest polling — no API calls here.
// EDIT: Step labels and progress mapping here.
// RISK: Low

/**
 * PdfStepIndicator — PDF sync progress (Figma `40:1519`, UI-049).
 * FLOW: Add Subject PDF → Uploading → Extracting → Parsing → Complete (plan 10).
 * RULE: ProgressBar size 8 at 0/33/66/100. Spinner = Loader (CSS spin approx).
 */

import { Check, Loader } from "lucide-react";
import * as React from "react";

import { ProgressBar } from "@/components/core/progress-bar";
import { cn } from "@/lib/utils";

export type PdfStepState =
  | "Uploading"
  | "Extracting"
  | "Parsing"
  | "Complete";

export interface PdfStepIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  state?: PdfStepState;
}

const STEPS = [
  { key: "Uploading", label: "Uploading" },
  { key: "Extracting", label: "Extracting text" },
  { key: "Parsing", label: "Parsing syllabus" },
] as const;

const STATE_INDEX: Record<PdfStepState, number> = {
  Uploading: 0,
  Extracting: 1,
  Parsing: 2,
  Complete: 3,
};

const STATE_VALUE: Record<PdfStepState, number> = {
  Uploading: 0,
  Extracting: 33,
  Parsing: 66,
  Complete: 100,
};

/** Meta line left side for current state. */
function metaLabel(state: PdfStepState): string {
  if (state === "Complete") return "3 of 3 steps done";
  return `Step ${STATE_INDEX[state] + 1} of 3`;
}

/**
 * PDF pipeline steps + bar — drive `state` from Proto / upload flow.
 */
export function PdfStepIndicator({
  className,
  state = "Uploading",
  ...props
}: PdfStepIndicatorProps) {
  const current = STATE_INDEX[state];
  const value = STATE_VALUE[state];

  return (
    <div
      data-slot="gs-pdf-step-indicator"
      data-state={state}
      className={cn(
        "flex w-full max-w-[480px] flex-col items-start gap-space-4",
        className,
      )}
      {...props}
    >
      <div className="flex w-full flex-col items-start gap-space-3">
        {STEPS.map((step, index) => {
          const done = index < current || state === "Complete";
          const active = index === current && state !== "Complete";
          const todo = index > current;

          return (
            <div
              key={step.key}
              data-slot="gs-pdf-step"
              data-step={step.key}
              className="flex items-center gap-space-3"
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full border",
                  done &&
                    "border-tint-accent-border bg-tint-accent-bg",
                  active && "border-2 border-accent-primary",
                  todo && "border-border-default",
                )}
              >
                {done ? (
                  <Check
                    aria-hidden
                    className="size-3.5 text-accent-primary"
                    strokeWidth={2}
                  />
                ) : null}
                {active ? (
                  <Loader
                    aria-hidden
                    className="size-3.5 animate-spin text-accent-primary motion-reduce:animate-none"
                    strokeWidth={1.75}
                  />
                ) : null}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-body-sm",
                  active && "font-medium text-text-primary",
                  done && "font-normal text-text-secondary",
                  todo && "font-normal text-text-muted",
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex w-full flex-col items-start gap-space-2">
        <ProgressBar value={value} size={8} className="w-full" />
        <div className="flex w-full items-center justify-between text-[12px] leading-[1.4]">
          <span className="text-caption text-text-muted">{metaLabel(state)}</span>
          <span className="font-mono text-mono-sm text-text-secondary">
            {value}%
          </span>
        </div>
      </div>
    </div>
  );
}
