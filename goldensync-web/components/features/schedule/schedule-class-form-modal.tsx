"use client";

/**
 * WHAT: Add / Edit Class form for My Schedule.
 * HOW: Subject dropdown suggests code/title; Custom for free type; header Cancel+Save.
 * SCREEN: Form inherits Compact+float from core; right-side FieldHints stay local.
 * EDIT: Hint strings below. KEEP: validation + overlap rules.
 * RISK: Medium — form UX only; server remains source of truth for overlaps.
 */

import * as React from "react";

import { Backdrop } from "@/components/core/backdrop";
import { Button } from "@/components/core/button";
import { FormField } from "@/components/core/form-field";
import { Modal } from "@/components/core/modal";
import {
  SCHEDULE_DAY_FULL,
  findOverlapConflict,
  isEndAfterStart,
  type ScheduleDayOfWeek,
  type ScheduleModeValue,
} from "@/lib/domain/schedule";
import type { ScheduleClassDto } from "@/lib/api/schedule";
import { compactSelectClass } from "@/lib/ui/compact-field";
import { cn } from "@/lib/utils";

export type ScheduleFormValues = {
  courseCode: string;
  courseTitle: string;
  dayOfWeek: ScheduleDayOfWeek;
  startTime: string;
  endTime: string;
  location: string;
  mode: ScheduleModeValue;
};

/** WHAT: One existing subject offered in the suggest dropdown. */
export type ScheduleSubjectOption = {
  id: string;
  courseCode: string;
  title: string;
};

export interface ScheduleClassFormModalProps {
  open: boolean;
  mode: "add" | "edit";
  initial?: ScheduleClassDto | null;
  /** Live subjects — used to suggest course code / title. */
  subjects?: ScheduleSubjectOption[];
  /** All classes for overlap preview (exclude current when editing). */
  existing: ScheduleClassDto[];
  saving?: boolean;
  error?: string | null;
  onClose: () => void;
  onSave: (values: ScheduleFormValues) => void | Promise<void>;
}

const CUSTOM_VALUE = "__custom__";

/** WHAT: Compact label for native selects / radios (FormField labels come from core). */
const labelClass = "text-ui text-text-secondary";

/** WHAT: Right-side guide chip inside a field (schedule form only). */
function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <span
      data-slot="gs-schedule-field-hint"
      className="pointer-events-none select-none text-ui-sm uppercase tracking-wide text-text-muted"
    >
      {children}
    </span>
  );
}

const emptyValues = (day: ScheduleDayOfWeek = 1): ScheduleFormValues => ({
  courseCode: "",
  courseTitle: "",
  dayOfWeek: day,
  startTime: "",
  endTime: "",
  location: "",
  mode: "FACE_TO_FACE",
});

function fromDto(row: ScheduleClassDto): ScheduleFormValues {
  return {
    courseCode: row.courseCode,
    courseTitle: row.courseTitle,
    dayOfWeek: row.dayOfWeek as ScheduleDayOfWeek,
    startTime: row.startTime,
    endTime: row.endTime,
    location: row.location,
    mode: row.mode,
  };
}

function matchSubjectId(
  subjects: ScheduleSubjectOption[],
  code: string,
  title: string,
): string {
  const c = code.trim().toLowerCase();
  const t = title.trim().toLowerCase();
  const hit = subjects.find(
    (s) =>
      s.courseCode.trim().toLowerCase() === c &&
      s.title.trim().toLowerCase() === t,
  );
  return hit?.id ?? CUSTOM_VALUE;
}

export function ScheduleClassFormModal({
  open,
  mode,
  initial = null,
  subjects = [],
  existing,
  saving = false,
  error = null,
  onClose,
  onSave,
}: ScheduleClassFormModalProps) {
  const [values, setValues] = React.useState<ScheduleFormValues>(emptyValues());
  const [baseline, setBaseline] = React.useState<ScheduleFormValues>(emptyValues());
  const [subjectPick, setSubjectPick] = React.useState<string>(CUSTOM_VALUE);
  /** Last auto-filled pair — used to clear only when still matching suggestion. */
  const [suggested, setSuggested] = React.useState<{
    code: string;
    title: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<keyof ScheduleFormValues, string>>
  >({});
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const next = initial ? fromDto(initial) : emptyValues();
    setValues(next);
    setBaseline(next);
    setFieldErrors({});
    setSubmitted(false);
    const pick = matchSubjectId(subjects, next.courseCode, next.courseTitle);
    setSubjectPick(pick);
    if (pick !== CUSTOM_VALUE) {
      const s = subjects.find((x) => x.id === pick);
      setSuggested(
        s
          ? { code: s.courseCode, title: s.title }
          : { code: next.courseCode, title: next.courseTitle },
      );
    } else {
      setSuggested(null);
    }
  }, [open, initial, subjects]);

  const dirty = React.useMemo(
    () => JSON.stringify(values) !== JSON.stringify(baseline),
    [values, baseline],
  );

  function setField<K extends keyof ScheduleFormValues>(
    key: K,
    value: ScheduleFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  /**
   * WHAT: User picked a subject or Custom from the suggest dropdown.
   * HOW: Subject → fill code/title; Custom → clear only if fields still match last suggestion.
   */
  function handleSubjectPick(nextId: string) {
    setSubjectPick(nextId);
    if (nextId === CUSTOM_VALUE) {
      setValues((prev) => {
        if (
          suggested &&
          prev.courseCode === suggested.code &&
          prev.courseTitle === suggested.title
        ) {
          return { ...prev, courseCode: "", courseTitle: "" };
        }
        return prev;
      });
      setSuggested(null);
      return;
    }
    const s = subjects.find((x) => x.id === nextId);
    if (!s) return;
    setSuggested({ code: s.courseCode, title: s.title });
    setValues((prev) => ({
      ...prev,
      courseCode: s.courseCode,
      courseTitle: s.title,
    }));
  }

  function validate(v: ScheduleFormValues) {
    const errs: Partial<Record<keyof ScheduleFormValues, string>> = {};
    if (!v.courseCode.trim()) errs.courseCode = "Course code is required.";
    if (!v.courseTitle.trim()) errs.courseTitle = "Course title is required.";
    if (!v.startTime) errs.startTime = "Start time is required.";
    if (!v.endTime) errs.endTime = "End time is required.";
    if (!v.location.trim()) errs.location = "Room / location is required.";
    if (v.startTime && v.endTime && !isEndAfterStart(v.startTime, v.endTime)) {
      errs.endTime = "End time must be later than start time.";
    }
    const conflict = findOverlapConflict(
      {
        dayOfWeek: v.dayOfWeek,
        startTime: v.startTime,
        endTime: v.endTime,
        excludeId: initial?.id,
      },
      existing,
    );
    if (conflict) {
      errs.startTime = `Overlaps with ${conflict.courseCode} — ${conflict.courseTitle} (${conflict.startTime}–${conflict.endTime}).`;
    }
    return errs;
  }

  function requestClose() {
    if (saving) return;
    if (dirty) {
      const ok = window.confirm("You have unsaved changes. Discard them?");
      if (!ok) return;
    }
    onClose();
  }

  async function handleSave() {
    setSubmitted(true);
    const errs = validate(values);
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;
    await onSave({
      ...values,
      courseCode: values.courseCode.trim(),
      courseTitle: values.courseTitle.trim(),
      location: values.location.trim(),
    });
  }

  const [isNarrow, setIsNarrow] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => setIsNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  if (!open) return null;

  const title = mode === "add" ? "Add Class" : "Edit Class";
  const show = (key: keyof ScheduleFormValues) =>
    submitted ? fieldErrors[key] : undefined;

  /** WHAT: Shared compact select + room for absolute FieldHint on the right. */
  const selectClass = cn(compactSelectClass, "pr-14");

  return (
    <div data-slot="gs-schedule-class-form" className="fixed inset-0 z-50">
      <Backdrop onDismiss={requestClose} />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 flex",
          isNarrow
            ? "items-stretch justify-stretch p-0"
            : "items-center justify-center p-space-4",
        )}
      >
        <div
          className={cn(
            "pointer-events-auto flex min-h-0 w-full flex-col",
            isNarrow
              ? "h-full max-w-none"
              : "max-h-[min(90dvh,720px)] max-w-lg",
          )}
        >
          <Modal
            variant={isNarrow ? "Mobile" : "Desktop"}
            className={cn(
              isNarrow
                ? "h-full max-h-none max-w-none"
                : "max-h-full overflow-hidden",
            )}
            title={title}
            description="Pick a subject to suggest code and title, or type your own."
            onClose={requestClose}
            hasFooter={false}
            headerActions={
              <>
                {/* WHAT: Cancel + Save in header top-right (beside close). */}
                <Button
                  variant="Secondary"
                  size="sm"
                  onClick={requestClose}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  variant="Primary"
                  size="sm"
                  onClick={() => void handleSave()}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save"}
                </Button>
              </>
            }
          >
            <div className="flex w-full flex-col gap-space-3 py-space-3">
              {error ? (
                <p className="text-ui text-status-error" role="alert">
                  {error}
                </p>
              ) : null}

              {/* WHAT: Suggest from existing subjects; Custom = free type code/title. */}
              <div className="flex w-full flex-col gap-space-1">
                <label htmlFor="gs-schedule-subject" className={labelClass}>
                  Subject
                </label>
                <div className="relative w-full min-w-0">
                  <select
                    id="gs-schedule-subject"
                    className={selectClass}
                    value={subjectPick}
                    onChange={(e) => handleSubjectPick(e.target.value)}
                  >
                    <option value={CUSTOM_VALUE}>Custom — type your own</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.courseCode} — {s.title}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute top-1/2 right-space-2 -translate-y-1/2">
                    <FieldHint>Pick</FieldHint>
                  </span>
                </div>
                <p className="text-ui-sm text-text-muted">
                  Choosing a subject fills course code and title (you can still
                  edit them).
                </p>
              </div>

              <FormField
                label="Course code"
                required
                hasHelper={false}
                error={show("courseCode")}
                inputProps={{
                  value: values.courseCode,
                  onChange: (e) => setField("courseCode", e.target.value),
                  placeholder: "e.g. ITE 14",
                  autoComplete: "off",
                  hasTrailingIcon: true,
                  trailingIcon: <FieldHint>Code</FieldHint>,
                }}
              />
              <FormField
                label="Course title"
                required
                hasHelper={false}
                error={show("courseTitle")}
                inputProps={{
                  value: values.courseTitle,
                  onChange: (e) => setField("courseTitle", e.target.value),
                  placeholder: "e.g. Integrative Programming",
                  autoComplete: "off",
                  hasTrailingIcon: true,
                  trailingIcon: <FieldHint>Title</FieldHint>,
                }}
              />

              <div className="flex w-full flex-col gap-space-1">
                <label htmlFor="gs-schedule-day" className={labelClass}>
                  Day <span className="text-status-error">*</span>
                </label>
                <div className="relative w-full min-w-0">
                  <select
                    id="gs-schedule-day"
                    className={selectClass}
                    value={values.dayOfWeek}
                    onChange={(e) =>
                      setField(
                        "dayOfWeek",
                        Number(e.target.value) as ScheduleDayOfWeek,
                      )
                    }
                  >
                    {([1, 2, 3, 4, 5, 6, 7] as ScheduleDayOfWeek[]).map((d) => (
                      <option key={d} value={d}>
                        {SCHEDULE_DAY_FULL[d]}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute top-1/2 right-space-2 -translate-y-1/2">
                    <FieldHint>Day</FieldHint>
                  </span>
                </div>
              </div>

              {/*
               * WHAT: Time fields — hint in trailing slot to the RIGHT of the native clock
               * (clock stays inside the input; hint never overlaps the picker control).
               */}
              <div className="grid w-full grid-cols-1 gap-space-3 sm:grid-cols-2">
                <FormField
                  label="Start time"
                  required
                  hasHelper={false}
                  error={show("startTime")}
                  className="[&_[data-slot=gs-input]]:min-w-0 [&_[data-slot=gs-input]]:pr-1"
                  inputProps={{
                    type: "time",
                    value: values.startTime,
                    onChange: (e) => setField("startTime", e.target.value),
                    hasTrailingIcon: true,
                    trailingIcon: <FieldHint>Start</FieldHint>,
                  }}
                />
                <FormField
                  label="End time"
                  required
                  hasHelper={false}
                  error={show("endTime")}
                  className="[&_[data-slot=gs-input]]:min-w-0 [&_[data-slot=gs-input]]:pr-1"
                  inputProps={{
                    type: "time",
                    value: values.endTime,
                    onChange: (e) => setField("endTime", e.target.value),
                    hasTrailingIcon: true,
                    trailingIcon: <FieldHint>End</FieldHint>,
                  }}
                />
              </div>

              <FormField
                label="Room / location"
                required
                hasHelper={false}
                error={show("location")}
                inputProps={{
                  value: values.location,
                  onChange: (e) => setField("location", e.target.value),
                  placeholder: "e.g. Lab 3 / Meet link",
                  autoComplete: "off",
                  hasTrailingIcon: true,
                  trailingIcon: <FieldHint>Room</FieldHint>,
                }}
              />

              <fieldset className="flex w-full flex-col gap-space-2">
                <legend
                  className={cn(
                    "flex w-full items-center justify-between gap-space-2",
                    labelClass,
                  )}
                >
                  <span>
                    Mode <span className="text-status-error">*</span>
                  </span>
                  <FieldHint>Mode</FieldHint>
                </legend>
                <label
                  className={cn(
                    "flex items-center gap-space-2 text-text-primary",
                    labelClass,
                  )}
                >
                  <input
                    type="radio"
                    name="gs-schedule-mode"
                    checked={values.mode === "FACE_TO_FACE"}
                    onChange={() => setField("mode", "FACE_TO_FACE")}
                  />
                  Face-to-face
                </label>
                <label
                  className={cn(
                    "flex items-center gap-space-2 text-text-primary",
                    labelClass,
                  )}
                >
                  <input
                    type="radio"
                    name="gs-schedule-mode"
                    checked={values.mode === "ONLINE"}
                    onChange={() => setField("mode", "ONLINE")}
                  />
                  Online
                </label>
              </fieldset>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
}
