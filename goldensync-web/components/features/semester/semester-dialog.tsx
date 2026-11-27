"use client";

// WHAT: Form to create a semester (label, year level, start/end dates).
// SCREEN: Anchored panel under semester switcher — not a centered modal.
// HOW: Validates dates locally, then POST createSemester when signed in.

/**
 * SemesterCreatePanel — New semester form (anchored under SemesterSwitcher).
 * FLOW: SemesterPicker → New semester… → panel under trigger · conflict check.
 */

import * as React from "react";

import { useAuth } from "@clerk/nextjs";

import { Banner } from "@/components/core/banner";
import { Button } from "@/components/core/button";
import { FormField } from "@/components/core/form-field";
import { useLiveData } from "@/hooks/use-live-data";
import { ApiClientError } from "@/lib/api/client";
import {
  createSemester,
  type SemesterDto,
} from "@/lib/api/semesters";
import {
  findConflictingSemester,
  isValidSemesterRange,
  parseSemesterDate,
} from "@/lib/domain/semester-dates";
import {
  YEAR_LEVEL_MAX,
  YEAR_LEVEL_MIN,
  yearLevelName,
} from "@/lib/domain/semester-year";
import { cn } from "@/lib/utils";
import { useProtoActions } from "@/state";

export interface SemesterCreatePanelProps {
  open?: boolean;
  onClose?: () => void;
  onCreated?: (semester: { id?: string; label: string }) => void;
  className?: string;
}

function defaultStartDate(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function defaultEndDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 4);
  return d.toISOString().slice(0, 10);
}

/** New semester form panel — no centered modal; parent anchors position. */
export function SemesterCreatePanel({
  open = false,
  onClose,
  onCreated,
  className,
}: SemesterCreatePanelProps) {
  const { isSignedIn } = useAuth();
  const live = useLiveData();
  const { setHasSemester } = useProtoActions();
  const [label, setLabel] = React.useState("1st Semester AY 2026–2027");
  const [yearLevel, setYearLevel] = React.useState(1);
  const [startDate, setStartDate] = React.useState(defaultStartDate);
  const [endDate, setEndDate] = React.useState(defaultEndDate);
  const [fieldError, setFieldError] = React.useState<string | null>(null);
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const handle = window.setTimeout(() => {
      setFieldError(null);
      setApiError(null);
      setYearLevel(1);
      setStartDate(defaultStartDate());
      setEndDate(defaultEndDate());
    }, 0);
    return () => window.clearTimeout(handle);
  }, [open]);

  if (!open) return null;

  // WHAT: Client-side checks before API call (required fields, date order, overlap).
  function validateLocal(): string | null {
    if (!label.trim()) return "Semester label is required.";
    if (label.trim().length > 80) return "Label must be at most 80 characters.";
    if (!startDate || !endDate) return "Start date and end date are required.";
    const start = parseSemesterDate(startDate);
    const end = parseSemesterDate(endDate);
    if (!start || !end) return "Enter valid start and end dates.";
    if (!isValidSemesterRange(start, end)) {
      return "End date must be after start date.";
    }
    if (isSignedIn && live.semesters.length > 0) {
      const conflict = findConflictingSemester(start, end, live.semesters);
      if (conflict) {
        return `Date range overlaps existing semester “${conflict.label}” (${conflict.startDate} → ${conflict.endDate}).`;
      }
    }
    return null;
  }

  async function handleCreate() {
    const localError = validateLocal();
    if (localError) {
      setFieldError(localError);
      setApiError(null);
      return;
    }
    setFieldError(null);
    setApiError(null);

    if (isSignedIn) {
      setSaving(true);
      try {
        const created: SemesterDto = await createSemester({
          label: label.trim(),
          yearLevel,
          startDate,
          endDate,
          skippedWeeks: [],
        });
        setHasSemester(true);
        onCreated?.({ id: created.id, label: created.label });
        onClose?.();
      } catch (err) {
        setApiError(
          err instanceof ApiClientError
            ? err.message
            : "Could not create semester.",
        );
      } finally {
        setSaving(false);
      }
      return;
    }

    // WHAT: Unsigned / demo path — no API; only proto flag hasSemester.
    setHasSemester(true);
    onCreated?.({ label: label.trim() });
    onClose?.();
  }

  return (
    <div
      data-slot="gs-semester-create-panel"
      role="dialog"
      aria-label="New semester"
      className={cn(
        "flex max-h-[min(70vh,560px)] w-[min(100vw-1.5rem,360px)] flex-col",
        "overflow-hidden rounded-md border border-border-default bg-bg-elevated shadow-lg",
        className,
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-space-2 border-b border-border-subtle px-space-3 py-space-2">
        <h2 className="text-heading-sm text-text-primary">New semester</h2>
        <Button variant="Ghost" size="sm" onClick={onClose} aria-label="Close">
          Cancel
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-space-3 py-space-3">
        <div className="flex w-full flex-col gap-space-3">
          {fieldError ? (
            <Banner
              variant="Error"
              message={fieldError}
              hasAction={false}
              className="w-full"
            />
          ) : null}
          {apiError ? (
            <Banner
              variant="Error"
              message={apiError}
              hasAction={false}
              className="w-full"
            />
          ) : null}
          <FormField
            label="Semester label"
            required
            inputProps={{
              value: label,
              maxLength: 80,
              onChange: (e) => setLabel(e.target.value),
            }}
          />
          <div className="flex w-full min-w-0 flex-col items-start gap-space-2">
            <div className="flex w-full items-start gap-space-1 text-body-sm font-medium">
              <label
                htmlFor="gs-semester-year-level"
                className="text-text-secondary"
              >
                Year level
              </label>
              <span className="text-status-error" aria-hidden>
                *
              </span>
            </div>
            <select
              id="gs-semester-year-level"
              value={yearLevel}
              onChange={(e) => setYearLevel(Number(e.target.value))}
              className="h-11 w-full rounded-md border border-border-default bg-bg-subtle px-space-3 text-body-sm text-text-primary outline-none focus-visible:border-2 focus-visible:border-border-focus"
            >
              {Array.from(
                { length: YEAR_LEVEL_MAX - YEAR_LEVEL_MIN + 1 },
                (_, i) => YEAR_LEVEL_MIN + i,
              ).map((n) => (
                <option key={n} value={n}>
                  {yearLevelName(n)}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-space-3 sm:grid-cols-2">
            <FormField
              label="Start date"
              required
              inputProps={{
                type: "date",
                value: startDate,
                onChange: (e) => setStartDate(e.target.value),
              }}
            />
            <FormField
              label="End date"
              required
              inputProps={{
                type: "date",
                value: endDate,
                onChange: (e) => setEndDate(e.target.value),
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex shrink-0 justify-end gap-space-2 border-t border-border-subtle px-space-3 py-space-2">
        <Button variant="Secondary" size="md" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="Primary"
          size="md"
          onClick={() => void handleCreate()}
          disabled={saving}
        >
          {saving ? "Creating…" : "Create semester"}
        </Button>
      </div>
    </div>
  );
}

/** @deprecated Use SemesterCreatePanel — kept name for older imports. */
export const SemesterDialog = SemesterCreatePanel;
