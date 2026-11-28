"use client";

/**
 * WHAT: My Schedule day tabs, heading, class cards, empty state, live status.
 * HOW: Tabs Mon–Sun with counts; today default; cards sorted by start; status every minute.
 * SCREEN: Full-width main column on /my-schedule — phone through wide desktop.
 * EDIT: Status colors via status-* tokens below.
 * KEEP: Duration/status computed — never stored. RISK: Medium
 */

import { Pencil, Plus, Trash2 } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/core/button";
import { EmptyState } from "@/components/core/empty-state";
import {
  SCHEDULE_DAY_FULL,
  SCHEDULE_DAY_LABELS,
  classStatusForNow,
  dateLabelForDayOfWeek,
  dayOfWeekFromDate,
  formatDuration,
  formatNextIn,
  nowMinutesInZone,
  pickNextClassId,
  scheduleModeLabel,
  type ScheduleDayOfWeek,
} from "@/lib/domain/schedule";
import { limits } from "@/lib/config/limits";
import type { ScheduleClassDto } from "@/lib/api/schedule";
import { cn } from "@/lib/utils";

export interface SchedulePanelProps {
  classes: ScheduleClassDto[];
  loading?: boolean;
  onAdd: () => void;
  onEdit: (row: ScheduleClassDto) => void;
  onDelete: (row: ScheduleClassDto) => void;
}

const DAYS = [1, 2, 3, 4, 5, 6, 7] as ScheduleDayOfWeek[];

/** Short single-letter labels for narrow phones. */
const DAY_LETTER: Record<ScheduleDayOfWeek, string> = {
  1: "M",
  2: "T",
  3: "W",
  4: "T",
  5: "F",
  6: "S",
  7: "S",
};

export function SchedulePanel({
  classes,
  loading = false,
  onAdd,
  onEdit,
  onDelete,
}: SchedulePanelProps) {
  const todayDow = dayOfWeekFromDate(new Date(), limits.TIME_ZONE);
  const [selectedDay, setSelectedDay] =
    React.useState<ScheduleDayOfWeek>(todayDow);
  const [nowMinutes, setNowMinutes] = React.useState(() =>
    nowMinutesInZone(new Date(), limits.TIME_ZONE),
  );

  React.useEffect(() => {
    setSelectedDay(todayDow);
  }, [todayDow]);

  // WHAT: Refresh “now” at least every minute for Ongoing / Next status.
  React.useEffect(() => {
    const tick = () =>
      setNowMinutes(nowMinutesInZone(new Date(), limits.TIME_ZONE));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  const counts = React.useMemo(() => {
    const map: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
    };
    for (const row of classes) {
      map[row.dayOfWeek] = (map[row.dayOfWeek] ?? 0) + 1;
    }
    return map;
  }, [classes]);

  const dayClasses = React.useMemo(() => {
    return classes
      .filter((c) => c.dayOfWeek === selectedDay)
      .slice()
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [classes, selectedDay]);

  const isToday = selectedDay === todayDow;
  const nextId = isToday ? pickNextClassId(dayClasses, nowMinutes) : null;

  const headingDate = dateLabelForDayOfWeek(
    selectedDay,
    new Date(),
    limits.TIME_ZONE,
  );

  if (loading) {
    return (
      <p className="text-body-sm text-text-muted">Loading schedule…</p>
    );
  }

  return (
    <div
      data-slot="gs-schedule-panel"
      className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-space-4 sm:gap-space-6"
    >
      {/* WHAT: Header stacks on phone; Add Class full-width under title. */}
      <div className="flex w-full min-w-0 shrink-0 flex-col gap-space-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-space-1">
          <h1 className="text-heading-md text-text-primary lg:text-heading-lg">
            My Schedule
          </h1>
          <p className="max-w-2xl text-body-sm text-text-secondary">
            Classes you add stay on your account across devices.
          </p>
        </div>
        <Button
          variant="Primary"
          size="md"
          onClick={onAdd}
          className="w-full shrink-0 sm:w-auto"
        >
          <Plus className="size-4" aria-hidden />
          Add Class
        </Button>
      </div>

      {/* WHAT: 7 equal day tabs across full width; taller hit targets on large screens. */}
      <div
        role="tablist"
        aria-label="Days of the week"
        className="grid w-full min-w-0 shrink-0 grid-cols-7 gap-1 sm:gap-space-2 lg:gap-space-3"
      >
        {DAYS.map((d) => {
          const selected = d === selectedDay;
          const isTod = d === todayDow;
          return (
            <button
              key={d}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-label={`${SCHEDULE_DAY_FULL[d]}${isTod ? " (today)" : ""}, ${counts[d]} classes`}
              onClick={() => setSelectedDay(d)}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center rounded-md border px-0.5 py-space-2 text-center transition-colors sm:py-space-3 lg:py-space-4",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus",
                selected
                  ? "border-border-focus bg-bg-muted text-text-primary"
                  : "border-border-subtle bg-bg-elevated/40 text-text-secondary hover:border-border-default hover:bg-bg-muted/60",
                isTod && !selected && "border-accent-primary/40",
              )}
            >
              <span className="text-[10px] font-semibold leading-tight tracking-tight sm:hidden">
                {DAY_LETTER[d]}
              </span>
              <span className="hidden text-caption font-semibold sm:inline lg:text-body-sm">
                {SCHEDULE_DAY_LABELS[d]}
              </span>
              {isTod ? (
                <span className="mt-0.5 size-1 rounded-full bg-accent-primary sm:mt-1" />
              ) : (
                <span className="mt-0.5 size-1 sm:mt-1" aria-hidden />
              )}
              <span className="text-[10px] leading-none text-text-muted tabular-nums sm:text-caption">
                {counts[d]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex w-full min-w-0 shrink-0 flex-col gap-space-1">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-space-2 gap-y-1">
          <h2 className="text-heading-sm text-text-primary lg:text-heading-md">
            {SCHEDULE_DAY_FULL[selectedDay]}
          </h2>
          {isToday ? (
            <span className="text-caption font-medium text-accent-primary">
              Today
            </span>
          ) : null}
        </div>
        <p className="break-words text-body-sm text-text-secondary">
          <span className="hidden sm:inline">{headingDate} · </span>
          {dayClasses.length}{" "}
          {dayClasses.length === 1 ? "class" : "classes"}
        </p>
      </div>

      {dayClasses.length === 0 ? (
        <EmptyState
          className="flex min-h-[min(50dvh,28rem)] flex-1 justify-center border border-dashed border-border-subtle bg-bg-elevated/30 px-space-4 py-space-8 sm:px-space-8"
          title={`No classes on ${SCHEDULE_DAY_FULL[selectedDay]}`}
          body="Add a class to build your weekly timetable."
          actionLabel="Add Class"
          onAction={onAdd}
        />
      ) : (
        <ul className="flex w-full min-w-0 flex-1 flex-col gap-space-3">
          {dayClasses.map((row) => {
            const duration = formatDuration(row.startTime, row.endTime);
            let statusLabel: string | null = null;
            let statusTone: "ongoing" | "next" | "neutral" = "neutral";

            if (isToday) {
              const st = classStatusForNow(
                row.startTime,
                row.endTime,
                nowMinutes,
              );
              if (st.kind === "ongoing") {
                statusLabel = "Ongoing";
                statusTone = "ongoing";
              } else if (st.kind === "next" && row.id === nextId) {
                statusLabel = formatNextIn(st.minutesUntil);
                statusTone = "next";
              } else if (st.kind === "finished") {
                statusLabel = "Finished";
              } else {
                statusLabel = "Later";
              }
            }

            return (
              <li
                key={row.id}
                className="flex w-full min-w-0 flex-col gap-space-3 rounded-lg border border-border-subtle bg-bg-muted p-space-3 sm:flex-row sm:items-start sm:justify-between sm:p-space-4 lg:px-space-5 lg:py-space-4"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-space-1">
                  <div className="flex min-w-0 flex-wrap items-center gap-x-space-2 gap-y-1">
                    <p className="text-body-sm font-medium tabular-nums text-text-primary">
                      {row.startTime} – {row.endTime}
                      {duration ? (
                        <span className="text-text-muted"> · {duration}</span>
                      ) : null}
                    </p>
                    {statusLabel ? (
                      <span
                        className={cn(
                          "rounded-sm px-space-1 text-caption font-medium",
                          statusTone === "ongoing" &&
                            "bg-tint-success-bg text-status-success",
                          statusTone === "next" &&
                            "bg-tint-warning-bg text-status-warning",
                          statusTone === "neutral" && "text-text-muted",
                        )}
                      >
                        {statusLabel}
                      </span>
                    ) : null}
                  </div>
                  <p className="min-w-0 break-words text-heading-sm text-text-primary">
                    <span className="font-semibold">{row.courseCode}</span>
                    <span className="font-normal text-text-secondary">
                      {" "}
                      — {row.courseTitle}
                    </span>
                  </p>
                  <p className="min-w-0 break-words text-body-sm text-text-secondary">
                    {row.location} · {scheduleModeLabel(row.mode)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-space-1 self-end sm:self-start">
                  <Button
                    variant="Ghost"
                    size="sm"
                    aria-label={`Edit ${row.courseCode}`}
                    onClick={() => onEdit(row)}
                    className="min-w-9"
                  >
                    <Pencil className="size-4" aria-hidden />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <Button
                    variant="Ghost"
                    size="sm"
                    aria-label={`Delete ${row.courseCode}`}
                    onClick={() => onDelete(row)}
                    className="min-w-9"
                  >
                    <Trash2 className="size-4" aria-hidden />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
