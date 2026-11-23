"use client";

/**
 * WeekRow — Checklist / Plan week row (Figma `37:1249`, UI-044).
 * FLOW: Checklist → tick Done toggles Status=Completed only (never changes results).
 * RULE: No class → muted dashes + disabled checkbox; Plan hides Done (DEC-067).
 * RULE: selected = 2 px accent left border, no tint (DEC-080a · Week 13).
 * Compact 11px sharp type · balanced column track spacing.
 */

import * as React from "react";

import { Checkbox } from "@/components/core/checkbox";
import {
  StatusChip,
  type StatusChipStatus,
} from "@/components/core/status-chip";
import { cn } from "@/lib/utils";

export type WeekRowStatus =
  | "In progress"
  | "Done"
  | "Not started"
  | "No class";

export interface WeekRowProps extends React.HTMLAttributes<HTMLDivElement> {
  week?: string;
  topic?: string;
  outcome?: string;
  activities?: string;
  status?: WeekRowStatus;
  /** Controlled Done checkbox (parent syncs StatusChip). */
  done?: boolean;
  onDoneChange?: (done: boolean) => void;
  /** Checklist shows Done; Plan hides it (DEC-067). */
  showDone?: boolean;
  /** Current week accent bar (Plan Week 13). */
  selected?: boolean;
}

export interface WeekTableHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  showDone?: boolean;
}

const cellLabel =
  "text-[11px] font-medium leading-snug tracking-tight antialiased";
const headLabel =
  "text-[10px] font-semibold leading-snug tracking-tight antialiased uppercase text-text-muted";

/** Shared balanced tracks — Week · Topic · Outcome · Activities · (Done) · Status */
function rowGridClass(showDone: boolean) {
  return cn(
    "grid w-full min-w-[760px] items-center gap-x-space-3 px-space-3",
    showDone
      ? "grid-cols-[minmax(3rem,0.7fr)_minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.1fr)_minmax(3rem,0.55fr)_minmax(0,1.15fr)]"
      : "grid-cols-[minmax(3rem,0.7fr)_minmax(0,2.2fr)_minmax(0,1.1fr)_minmax(0,1.2fr)_minmax(0,1.15fr)]",
  );
}

const colPad = "min-w-0 py-space-1";

/** Map WeekRow status → StatusChip status. */
function toChipStatus(status: WeekRowStatus): StatusChipStatus {
  if (status === "Done") return "Completed";
  if (status === "In progress") return "In Progress";
  return "Not Started";
}

/** Column labels matching WeekRow grid. */
export function WeekTableHeader({
  className,
  showDone = true,
  ...props
}: WeekTableHeaderProps) {
  return (
    <div
      data-slot="gs-week-table-header"
      role="row"
      className={cn(
        "h-8 border-b border-border-default bg-bg-subtle",
        rowGridClass(showDone),
        className,
      )}
      {...props}
    >
      <div className={cn(colPad, "flex items-center")}>
        <span className={headLabel}>Week</span>
      </div>
      <div className={cn(colPad, "flex items-center")}>
        <span className={headLabel}>Topic</span>
      </div>
      <div className={cn(colPad, "flex items-center")}>
        <span className={headLabel}>Outcome</span>
      </div>
      <div className={cn(colPad, "flex items-center")}>
        <span className={headLabel}>Activities</span>
      </div>
      {showDone ? (
        <div className={cn(colPad, "flex items-center justify-center")}>
          <span className={headLabel}>Done</span>
        </div>
      ) : null}
      <div className={cn(colPad, "flex items-center justify-end")}>
        <span className={headLabel}>Status</span>
      </div>
    </div>
  );
}

/**
 * One week row — edit topic/outcome/activities; Done never drives Calculator.
 */
export function WeekRow({
  className,
  week = "13",
  topic = "Secure session handling",
  outcome = "CO3",
  activities = "Lab 3",
  status = "In progress",
  done,
  onDoneChange,
  showDone = true,
  selected = false,
  ...props
}: WeekRowProps) {
  const isNoClass = status === "No class";
  const isDone = done ?? status === "Done";

  return (
    <div
      data-slot="gs-week-row"
      data-status={status}
      data-selected={selected ? "true" : undefined}
      role="row"
      className={cn(
        "relative min-h-8 border-b border-border-subtle",
        rowGridClass(showDone),
        className,
      )}
      {...props}
    >
      {selected ? (
        <span
          data-slot="gs-week-row-selected-accent"
          aria-hidden
          className="absolute top-0 bottom-0 left-0 w-0.5 bg-accent-primary"
        />
      ) : null}

      <div className={cn(colPad, "flex items-center")}>
        <span
          className={cn(
            cellLabel,
            "font-mono tabular-nums text-text-secondary",
          )}
        >
          {week}
        </span>
      </div>

      <div className={cn(colPad, "flex items-center")}>
        <span
          className={cn(
            cellLabel,
            "min-w-0 truncate",
            isNoClass ? "text-text-muted" : "font-semibold text-text-primary",
          )}
        >
          {isNoClass ? "No class" : topic}
        </span>
      </div>

      <div className={cn(colPad, "flex items-center")}>
        <span
          className={cn(
            cellLabel,
            "min-w-0 truncate font-mono tabular-nums",
            isNoClass ? "text-text-muted" : "text-text-secondary",
          )}
        >
          {isNoClass ? "—" : outcome}
        </span>
      </div>

      <div className={cn(colPad, "flex items-center")}>
        <span
          className={cn(
            cellLabel,
            "min-w-0 truncate",
            isNoClass ? "text-text-muted" : "text-text-secondary",
          )}
        >
          {isNoClass ? "—" : activities}
        </span>
      </div>

      {showDone ? (
        <div className={cn(colPad, "flex items-center justify-center")}>
          <Checkbox
            hasLabel={false}
            checked={isDone}
            disabled={isNoClass}
            className={cn(
              "[&_[data-slot=gs-checkbox-control]>span]:size-7",
              "[&_[data-slot=gs-checkbox-root]]:size-4 [&_[data-slot=gs-checkbox-root]]:rounded-sm",
              "[&_svg]:size-2.5",
            )}
            /* FLOW: tick → parent sets status Done; never feeds ResultCard */
            onCheckedChange={(checked) => {
              onDoneChange?.(checked === true);
            }}
            aria-label={
              isNoClass ? `Week ${week} no class` : `Mark week ${week} done`
            }
          />
        </div>
      ) : null}

      <div className={cn(colPad, "flex items-center justify-end")}>
        {isNoClass ? (
          <span className={cn(cellLabel, "text-text-muted")}>—</span>
        ) : (
          <StatusChip
            status={toChipStatus(status)}
            className="h-5 gap-0.5 px-space-1.5 text-[11px] font-medium leading-none tracking-tight antialiased [&_svg]:size-3"
          />
        )}
      </div>
    </div>
  );
}
