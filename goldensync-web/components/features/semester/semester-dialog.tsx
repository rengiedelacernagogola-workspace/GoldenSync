"use client";

/**
 * SemesterDialog — New semester (Figma `72:2721`+, UI-071).
 * FLOW: Dashboard NoSemester / SemesterPicker → label + start/end dates · conflict check.
 */

import * as React from "react";

import { useAuth } from "@clerk/nextjs";

import { Backdrop } from "@/components/core/backdrop";
import { Banner } from "@/components/core/banner";
import { Button } from "@/components/core/button";
import { Chip } from "@/components/core/chip";
import { FormField } from "@/components/core/form-field";
import { Modal } from "@/components/core/modal";
import { useLiveData } from "@/hooks/use-live-data";
import { ApiClientError } from "@/lib/api/client";
import { createSemester } from "@/lib/api/semesters";
import {
  findConflictingSemester,
  isValidSemesterRange,
  parseSemesterDate,
} from "@/lib/domain/semester-dates";
import { useProtoActions } from "@/state";

export interface SemesterDialogProps {
  open?: boolean;
  onClose?: () => void;
  onCreated?: (label: string) => void;
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

/** New semester form — start/end dates required; skipped weeks via Chip multi-select. */
export function SemesterDialog({
  open = false,
  onClose,
  onCreated,
}: SemesterDialogProps) {
  const { isSignedIn } = useAuth();
  const live = useLiveData();
  const { setHasSemester } = useProtoActions();
  const [label, setLabel] = React.useState("1st Semester AY 2026–2027");
  const [startDate, setStartDate] = React.useState(defaultStartDate);
  const [endDate, setEndDate] = React.useState(defaultEndDate);
  const [fieldError, setFieldError] = React.useState<string | null>(null);
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [skipped, setSkipped] = React.useState<number[]>([9]);

  React.useEffect(() => {
    if (!open) return;
    const handle = window.setTimeout(() => {
      setFieldError(null);
      setApiError(null);
      setStartDate(defaultStartDate());
      setEndDate(defaultEndDate());
    }, 0);
    return () => window.clearTimeout(handle);
  }, [open]);

  if (!open) return null;

  function toggleWeek(w: number) {
    setSkipped((prev) =>
      prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w].sort(),
    );
  }

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
        await createSemester({
          label: label.trim(),
          startDate,
          endDate,
          skippedWeeks: skipped,
        });
        setHasSemester(true);
        onCreated?.(label.trim());
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

    setHasSemester(true);
    onCreated?.(label.trim());
    onClose?.();
  }

  return (
    <div data-slot="gs-semester-dialog" className="fixed inset-0 z-50">
      <Backdrop onDismiss={onClose} />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-space-4">
        <div className="pointer-events-auto w-full max-w-lg">
          <Modal
            title="New semester"
            hasDescription={false}
            onClose={onClose}
            footer={
              <>
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
              </>
            }
          >
            <div className="flex w-full flex-col gap-space-4">
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
              <div className="flex flex-col gap-space-2">
                <p className="text-body-sm font-medium text-text-secondary">
                  Skipped weeks
                </p>
                <div className="flex flex-wrap gap-space-2">
                  {[8, 9, 10, 11, 12].map((w) => (
                    <Chip
                      key={w}
                      label={`Week ${w}`}
                      selected={skipped.includes(w)}
                      onClick={() => toggleWeek(w)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
}
