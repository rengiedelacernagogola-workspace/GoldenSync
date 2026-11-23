"use client";

/**
 * ActivityRow — Calculator score row (Figma `36:1182`, UI-043).
 * FLOW: Calculator → Score field opens EditScore popover. Empty "—" = not taken.
 * RULE: Error/Conflict always pair with Appendix A Banner (never alone).
 */

import { CircleAlert, TriangleAlert } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export type ActivityRowState =
  | "Default"
  | "Hover"
  | "Active"
  | "Focus"
  | "Error"
  | "Conflict"
  | "Empty";

export interface ActivityRowProps extends React.HTMLAttributes<HTMLDivElement> {
  activity?: string;
  outcome?: string;
  score?: string;
  max?: string;
  percent?: string;
  state?: ActivityRowState;
  /** Score field click — parent opens EditScore. */
  onScoreClick?: () => void;
}

/** Score field shell styles by interactive / error state. */
function scoreFieldClass(state: ActivityRowState): string {
  switch (state) {
    case "Hover":
      return "border-border-strong bg-bg-muted";
    case "Active":
      return "border-accent-glass-border bg-accent-glass-bg";
    case "Focus":
      return "border-2 border-border-focus";
    case "Error":
      return "border-status-error bg-tint-error-bg";
    case "Conflict":
      return "border-status-warning";
    default:
      return "border-border-subtle";
  }
}

/**
 * One activity score row — edit score via onScoreClick; parent owns Banner.
 */
export function ActivityRow({
  className,
  activity = "Quiz 1",
  outcome = "CO1",
  score = "45",
  max = "50",
  percent = "90%",
  state = "Default",
  onScoreClick,
  ...props
}: ActivityRowProps) {
  const isEmpty = state === "Empty";
  const isError = state === "Error";
  const isConflict = state === "Conflict";

  return (
    <div
      data-slot="gs-activity-row"
      data-state={state}
      className={cn(
        "flex min-h-[52px] w-full min-w-[720px] items-center border-b border-border-subtle",
        isConflict && "bg-tint-warning-bg",
        className,
      )}
      {...props}
    >
      <div className="flex h-full min-w-0 flex-1 items-center py-space-2 pr-space-4 pl-space-8">
        <span className="min-w-0 flex-1 text-body-sm text-text-primary">
          {activity}
        </span>
      </div>

      <div className="flex h-full w-24 shrink-0 items-center px-space-4">
        <span className="whitespace-nowrap font-mono text-mono-md text-text-secondary">
          {outcome}
        </span>
      </div>

      <div className="flex h-full w-28 shrink-0 items-center justify-end px-space-4">
        <button
          type="button"
          data-slot="gs-activity-row-score"
          onClick={onScoreClick}
          className={cn(
            "inline-flex min-w-16 items-center justify-end gap-space-1",
            "rounded-md border px-space-2 py-space-1 outline-none",
            "font-mono text-mono-md whitespace-nowrap",
            scoreFieldClass(state),
            isEmpty ? "text-text-muted" : "text-text-primary",
          )}
        >
          {isError ? (
            <CircleAlert
              aria-hidden
              className="size-3.5 shrink-0 text-status-error"
              strokeWidth={1.75}
            />
          ) : null}
          {isConflict ? (
            <TriangleAlert
              aria-hidden
              className="size-3.5 shrink-0 text-status-warning"
              strokeWidth={1.75}
            />
          ) : null}
          {isEmpty ? "—" : score}
        </button>
      </div>

      <div className="flex h-full w-24 shrink-0 items-center justify-end px-space-4">
        <span className="whitespace-nowrap font-mono text-mono-md text-text-secondary">
          {max}
        </span>
      </div>

      <div className="flex h-full w-24 shrink-0 items-center justify-end px-space-4">
        <span
          className={cn(
            "whitespace-nowrap font-mono text-mono-md",
            isEmpty ? "text-text-muted" : "text-text-primary",
          )}
        >
          {isEmpty ? "—" : percent}
        </span>
      </div>
    </div>
  );
}
