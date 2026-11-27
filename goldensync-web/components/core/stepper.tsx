"use client";

// WHAT: Horizontal step dots/labels for multi-step forms (1 of 5, etc.).
// SCREEN: Add Subject manual flow and similar wizards.
// HOW: Parent passes steps[] with id, label, and state Upcoming|Active|Done.
// KEEP: Step machine logic stays in feature pages — this only renders UI.
// EDIT: Spacing and check icon for Done state here.
// RISK: Low

/**
 * Stepper — multi-step form progress (Figma `27:297` / Step `27:81`, UI-034).
 * Flow: Subject form steps 1–5. Active = accent; Done = check; Upcoming muted.
 */

import { Check } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export type StepState = "Upcoming" | "Active" | "Done";

export interface StepperStep {
  id: string;
  label: string;
  state: StepState;
}

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: StepperStep[];
}

/** Horizontal step list for Add Subject / Subject form. */
export function Stepper({ className, steps, ...props }: StepperProps) {
  return (
    <div
      data-slot="gs-stepper"
      className={cn(
        "flex w-full min-w-0 items-center gap-space-1 overflow-x-auto pb-0.5 sm:gap-space-2",
        className,
      )}
      {...props}
    >
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          {index > 0 ? (
            <div
              aria-hidden
              className="h-px min-w-2 flex-1 bg-border-subtle sm:min-w-space-4"
            />
          ) : null}
          <div
            data-slot="gs-step"
            data-state={step.state}
            className="flex shrink-0 items-center gap-space-1.5 sm:gap-space-2"
          >
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full text-caption font-medium",
                step.state === "Active" &&
                  "bg-accent-primary text-text-inverse",
                step.state === "Done" &&
                  "bg-tint-success-bg text-status-success",
                step.state === "Upcoming" &&
                  "border border-border-default bg-bg-subtle text-text-muted",
              )}
            >
              {step.state === "Done" ? (
                <Check className="size-3.5" aria-hidden strokeWidth={2.5} />
              ) : (
                index + 1
              )}
            </span>
            <span
              className={cn(
                "text-[11px] font-medium whitespace-nowrap sm:text-body-sm",
                step.state === "Active" && "text-text-primary",
                step.state === "Done" && "text-text-secondary",
                step.state === "Upcoming" && "text-text-muted",
              )}
            >
              {step.label}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
