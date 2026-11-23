"use client";

/**
 * SubjectCard — Dashboard subject tile (Figma `32:223` + Body `32:40`, UI-040).
 * FLOW: Dashboard → click opens Overview. Edit opens modal (stopPropagation).
 * Shows prerequisite, semester dates, checklist task, instructor, CO count, hours.
 */

import { Pencil } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/core/badge";
import { Button } from "@/components/core/button";
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
  prerequisite?: string;
  semesterStartLabel?: string;
  semesterEndLabel?: string;
  latestTask?: string;
  instructorLabel?: string;
  college?: string;
  consultation?: string;
  courseOutcomeCount?: number;
  contactHoursTotal?: number | null;
  contactHoursRemaining?: number | null;
  onEdit?: () => void;
}

/** Percent for ring fill (weeksDone / weeksTotal). */
function progressValue(weeksDone: number, weeksTotal: number): number {
  if (weeksTotal <= 0) return 0;
  return Math.round((weeksDone / weeksTotal) * 100);
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid w-full grid-cols-[88px_1fr] gap-space-2 text-left">
      <span className="text-[10px] font-medium tracking-tight text-text-muted">
        {label}
      </span>
      <span className="min-w-0 truncate text-[11px] font-medium tracking-tight text-text-secondary">
        {value}
      </span>
    </div>
  );
}

/**
 * Subject card — progress ring + rich subject details + edit affordance.
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
      prerequisite,
      semesterStartLabel,
      semesterEndLabel,
      latestTask,
      instructorLabel,
      college,
      consultation,
      courseOutcomeCount,
      contactHoursTotal,
      contactHoursRemaining,
      onEdit,
      onClick,
      ...props
    },
    ref,
  ) {
    const value = progressValue(weeksDone, weeksTotal);
    const total = Math.max(1, weeksTotal);
    const hoursLabel =
      contactHoursTotal == null
        ? "—"
        : contactHoursRemaining == null
          ? `${contactHoursTotal} hrs`
          : contactHoursRemaining <= 0
            ? `0 / ${contactHoursTotal} hrs — semester ended`
            : `${contactHoursRemaining} / ${contactHoursTotal} hrs left`;

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
          {onEdit ? (
            <Button
              type="button"
              variant="Ghost"
              size="sm"
              aria-label={`Edit ${code}`}
              className="absolute top-0 right-0 z-10 min-h-8 px-space-2"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Pencil className="size-3.5" aria-hidden />
              Edit
            </Button>
          ) : null}

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

          <div className="mt-space-1 flex w-full flex-col gap-space-1.5 border-t border-border-subtle pt-space-3">
            <DetailRow
              label="Prerequisite"
              value={(prerequisite ?? "").trim() || "—"}
            />
            <DetailRow
              label="Starts"
              value={semesterStartLabel?.trim() || "—"}
            />
            <DetailRow
              label="Ends"
              value={semesterEndLabel?.trim() || "—"}
            />
            <DetailRow
              label="Ongoing"
              value={(latestTask ?? "").trim() || "—"}
            />
            <DetailRow
              label="Instructor"
              value={(instructorLabel ?? "").trim() || "—"}
            />
            <DetailRow label="College" value={(college ?? "").trim() || "—"} />
            <DetailRow
              label="Consult"
              value={(consultation ?? "").trim() || "—"}
            />
            <DetailRow
              label="Outcomes"
              value={
                courseOutcomeCount == null
                  ? "—"
                  : `${courseOutcomeCount} course outcome${courseOutcomeCount === 1 ? "" : "s"}`
              }
            />
            <DetailRow label="Hours" value={hoursLabel} />
          </div>
        </div>
      </Card>
    );
  },
);
