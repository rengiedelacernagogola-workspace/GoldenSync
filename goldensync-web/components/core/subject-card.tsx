"use client";

/**
 * SubjectCard — Dashboard subject tile (Figma `32:223` + Body `32:40`, UI-040).
 * FLOW: Dashboard → click opens Overview. Top-right Edit/Delete (stopPropagation).
 * Shows prerequisite, semester dates, checklist task, instructor, CO count, hours.
 */

import { Eye, Pencil, Trash2 } from "lucide-react";
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
  /** From Grade Calculator scores (local) + grading template. */
  estimatedGradePercent?: number | null;
  estimatedGradeLabel?: string | null;
  estimatedGradeScale?: string | null;
  estimatedGradeHasScores?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
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
 * Subject card — progress ring + rich subject details + edit/delete affordances.
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
      estimatedGradePercent = null,
      estimatedGradeLabel = null,
      estimatedGradeScale = null,
      estimatedGradeHasScores = false,
      onEdit,
      onDelete,
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

    const [editRevealed, setEditRevealed] = React.useState(false);
    const actionsRef = React.useRef<HTMLDivElement>(null);
    const eyeRef = React.useRef<HTMLButtonElement>(null);
    const editRef = React.useRef<HTMLButtonElement>(null);

    function collapseEditReveal(opts?: { restoreEye?: boolean }) {
      setEditRevealed(false);
      if (opts?.restoreEye) {
        window.setTimeout(() => eyeRef.current?.focus(), 0);
      }
    }

    React.useEffect(() => {
      if (!editRevealed) return;

      function onPointerDown(e: PointerEvent) {
        const el = actionsRef.current;
        if (!el) return;
        if (e.target instanceof Node && el.contains(e.target)) return;
        collapseEditReveal({ restoreEye: true });
      }

      function onKeyDown(e: KeyboardEvent) {
        if (e.key === "Escape") collapseEditReveal({ restoreEye: true });
      }

      document.addEventListener("pointerdown", onPointerDown);
      document.addEventListener("keydown", onKeyDown);
      return () => {
        document.removeEventListener("pointerdown", onPointerDown);
        document.removeEventListener("keydown", onKeyDown);
      };
    }, [editRevealed]);

    React.useEffect(() => {
      if (!editRevealed) return;
      window.setTimeout(() => editRef.current?.focus(), 0);
    }, [editRevealed]);

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
          {onEdit || onDelete ? (
            <div
              ref={actionsRef}
              className="absolute top-0 right-0 z-10 flex items-center gap-px"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              {onEdit ? (
                <div className="relative inline-flex size-8 items-center justify-center">
                  <Button
                    ref={eyeRef}
                    type="button"
                    variant="Ghost"
                    size="sm"
                    tabIndex={editRevealed ? -1 : 0}
                    aria-hidden={editRevealed}
                    aria-label={`Show edit for ${code}`}
                    title="Show edit"
                    className={cn(
                      "absolute inset-0 min-h-8 min-w-8 px-space-2 text-text-muted hover:text-text-primary",
                      "transition-opacity duration-150 ease-out",
                      editRevealed
                        ? "pointer-events-none opacity-0"
                        : "opacity-100",
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditRevealed(true);
                    }}
                  >
                    <Eye className="size-3.5" aria-hidden />
                  </Button>
                  <Button
                    ref={editRef}
                    type="button"
                    variant="Ghost"
                    size="sm"
                    tabIndex={editRevealed ? 0 : -1}
                    aria-hidden={!editRevealed}
                    aria-label={`Edit ${code}`}
                    className={cn(
                      "absolute inset-0 min-h-8 min-w-8 px-space-2 text-text-muted hover:text-text-primary",
                      "transition-opacity duration-150 ease-out",
                      editRevealed
                        ? "opacity-100"
                        : "pointer-events-none opacity-0",
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                      setEditRevealed(false);
                    }}
                  >
                    <Pencil className="size-3.5" aria-hidden />
                  </Button>
                </div>
              ) : null}
              {onDelete ? (
                <Button
                  type="button"
                  variant="Ghost"
                  size="sm"
                  aria-label={`Delete ${code}`}
                  className="min-h-8 min-w-8 px-space-2 text-text-muted hover:text-status-error"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <Trash2 className="size-3.5" aria-hidden />
                </Button>
              ) : null}
            </div>
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

          <div className="mt-space-2 flex w-full flex-col gap-space-2 border-t border-border-subtle pt-space-3 text-left">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
              Estimated Subjects Grade
            </p>
            <div className="flex items-end justify-between gap-space-2">
              <p className="text-[15px] font-semibold tabular-nums tracking-tight text-text-primary">
                {estimatedGradeLabel?.trim() ||
                  (estimatedGradeHasScores && estimatedGradePercent != null
                    ? `${estimatedGradePercent.toFixed(2)}%`
                    : "—")}
              </p>
              {estimatedGradeHasScores && estimatedGradeScale ? (
                <p className="text-[10px] font-medium tabular-nums text-text-secondary">
                  Scale {estimatedGradeScale}
                </p>
              ) : (
                <p className="text-[10px] text-text-muted">No scores yet</p>
              )}
            </div>
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-bg-muted"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={
                estimatedGradeHasScores && estimatedGradePercent != null
                  ? Math.round(estimatedGradePercent)
                  : 0
              }
              aria-label="Estimated subject grade"
            >
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-300 ease-out",
                  "bg-gradient-to-r from-accent-tertiary to-accent-primary",
                )}
                style={{
                  width: `${
                    estimatedGradeHasScores && estimatedGradePercent != null
                      ? Math.max(0, Math.min(100, estimatedGradePercent))
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </Card>
    );
  },
);
