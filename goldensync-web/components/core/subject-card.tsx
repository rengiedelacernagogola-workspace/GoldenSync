"use client";

/**
 * SubjectCard — Dashboard subject tile (Figma `32:223` + Body `32:40`, UI-040).
 * FLOW: Dashboard → click opens Overview. Active = glass-accent + BorderBeam (max one).
 * DEC-048: title clamp 2 lines · fill width in grid.
 * Progress: centered segmented ring (18 ticks) for interactive week progress.
 */

import * as React from "react";

import { Badge } from "@/components/core/badge";
import { Card } from "@/components/core/card";
import { SegmentedRingProgress } from "@/components/core/segmented-ring-progress";
import { cn } from "@/lib/utils";

export interface SubjectCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  code?: string;
  title?: string;
  semester?: string;
  units?: number;
  weeksDone?: number;
  weeksTotal?: number;
  /** Active subject on Dashboard (max one). */
  active?: boolean;
}

/** Percent for ring fill (weeksDone / weeksTotal). */
function progressValue(weeksDone: number, weeksTotal: number): number {
  if (weeksTotal <= 0) return 0;
  return Math.round((weeksDone / weeksTotal) * 100);
}

/**
 * Subject card — centered compact content + segmented progress ring.
 * RULE: Active hover uses accent-primary border; Active focus uses 2px border-focus.
 */
export const SubjectCard = React.forwardRef<HTMLDivElement, SubjectCardProps>(
  function SubjectCard(
    {
      className,
      code = "ITE 14",
      title = "Integrative Programming",
      semester = "1st Semester AY 2026–2027",
      units = 3,
      weeksDone = 11,
      weeksTotal = 18,
      active = false,
      onClick,
      ...props
    },
    ref,
  ) {
    const value = progressValue(weeksDone, weeksTotal);
    const total = Math.max(1, weeksTotal);

    return (
      <Card
        ref={ref}
        data-slot="gs-subject-card"
        data-active={active ? "true" : undefined}
        variant={active ? "Active" : "Interactive"}
        hasHeader={false}
        hasFooter={false}
        onClick={onClick}
        className={cn(
          "w-full gap-0",
          onClick && "cursor-pointer",
          active &&
            [
              "outline-none",
              "hover:border-accent-primary",
              "focus-visible:border-2 focus-visible:border-border-focus",
            ].join(" "),
          className,
        )}
        {...props}
      >
        <div
          data-slot="gs-subject-card-body"
          className="relative flex w-full flex-col items-center gap-space-3 text-center"
        >
          <div className="flex w-full items-center justify-center gap-space-2">
            <p className="min-w-0 truncate text-[11px] font-medium tracking-tight text-text-secondary antialiased font-mono">
              {code}
            </p>
            <Badge
              label={`${units} units`}
              size="sm"
              variant="Default"
              className="shrink-0 text-[10px]"
            />
          </div>

          <p className="line-clamp-2 w-full text-[13px] font-semibold leading-snug tracking-tight text-text-primary antialiased">
            {title}
          </p>

          <p className="w-full text-[11px] font-medium tracking-tight text-text-muted antialiased">
            {semester}
          </p>

          <SegmentedRingProgress
            value={value}
            segments={total}
            size={112}
            className="mt-space-1"
          />

          <p className="whitespace-nowrap text-[11px] font-medium tracking-tight text-text-muted antialiased font-mono tabular-nums">
            {weeksDone} of {weeksTotal} weeks done
          </p>
        </div>
      </Card>
    );
  },
);
