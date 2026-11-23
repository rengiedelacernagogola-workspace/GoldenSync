"use client";

/**
 * SubjectCardEditModal — edit card fields (title, prereq, faculty, hours…).
 * FLOW: Dashboard card Edit → PATCH /api/subjects/:id → refresh grid.
 */

import * as React from "react";

import { Backdrop } from "@/components/core/backdrop";
import { Banner } from "@/components/core/banner";
import { Button } from "@/components/core/button";
import { FormField } from "@/components/core/form-field";
import { Modal } from "@/components/core/modal";
import { ApiClientError } from "@/lib/api/client";
import { patchSubject } from "@/lib/api/subjects";
import {
  parseFaculty,
  serializeFaculty,
  type FacultyInfo,
  type FacultyTitle,
} from "@/lib/domain/faculty";

export type SubjectCardEditValues = {
  title: string;
  units: string;
  prerequisite: string;
  effectivity: string;
  faculty: FacultyInfo;
};

export interface SubjectCardEditModalProps {
  open?: boolean;
  subjectId: string;
  courseCode: string;
  initial: SubjectCardEditValues;
  onClose?: () => void;
  onSaved?: () => void;
}

export function SubjectCardEditModal({
  open = false,
  subjectId,
  courseCode,
  initial,
  onClose,
  onSaved,
}: SubjectCardEditModalProps) {
  const [title, setTitle] = React.useState(initial.title);
  const [units, setUnits] = React.useState(initial.units);
  const [prerequisite, setPrerequisite] = React.useState(initial.prerequisite);
  const [effectivity, setEffectivity] = React.useState(initial.effectivity);
  const [facultyTitle, setFacultyTitle] = React.useState<FacultyTitle>(
    initial.faculty.title,
  );
  const [facultyName, setFacultyName] = React.useState(initial.faculty.name);
  const [college, setCollege] = React.useState(initial.faculty.college);
  const [consultation, setConsultation] = React.useState(
    initial.faculty.consultation,
  );
  const [hours, setHours] = React.useState(
    initial.faculty.estimatedContactHours != null
      ? String(initial.faculty.estimatedContactHours)
      : "",
  );
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const handle = window.setTimeout(() => {
      setTitle(initial.title);
      setUnits(initial.units);
      setPrerequisite(initial.prerequisite);
      setEffectivity(initial.effectivity);
      setFacultyTitle(initial.faculty.title);
      setFacultyName(initial.faculty.name);
      setCollege(initial.faculty.college);
      setConsultation(initial.faculty.consultation);
      setHours(
        initial.faculty.estimatedContactHours != null
          ? String(initial.faculty.estimatedContactHours)
          : "",
      );
      setError(null);
    }, 0);
    return () => window.clearTimeout(handle);
  }, [open, initial]);

  if (!open) return null;

  async function handleSave() {
    setError(null);
    const unitsNum = Number(units);
    if (!title.trim()) {
      setError("Subject name is required.");
      return;
    }
    if (!Number.isFinite(unitsNum) || unitsNum <= 0) {
      setError("Units must be a positive number.");
      return;
    }
    let estimatedContactHours: number | null = null;
    if (hours.trim() !== "") {
      const h = Number(hours);
      if (!Number.isFinite(h) || h < 0) {
        setError("Contact hours must be zero or a positive number.");
        return;
      }
      estimatedContactHours = h;
    }

    const faculty = serializeFaculty({
      title: facultyTitle,
      name: facultyName,
      college,
      consultation,
      estimatedContactHours,
    });

    setSaving(true);
    try {
      await patchSubject(subjectId, {
        title: title.trim(),
        units: unitsNum,
        prerequisite: prerequisite.trim() || null,
        effectivity: effectivity.trim() || null,
        faculty,
      });
      onSaved?.();
      onClose?.();
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Could not save subject details.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div data-slot="gs-subject-card-edit-modal" className="fixed inset-0 z-50">
      <Backdrop onDismiss={onClose} />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-space-4">
        <div className="pointer-events-auto w-full max-w-lg">
          <Modal
            title={`Edit ${courseCode}`}
            description="Update details shown on the subject card."
            onClose={onClose}
            footer={
              <>
                <Button variant="Secondary" size="md" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="Primary"
                  size="md"
                  disabled={saving}
                  onClick={() => void handleSave()}
                >
                  {saving ? "Saving…" : "Save"}
                </Button>
              </>
            }
          >
            <div className="flex max-h-[60vh] w-full flex-col gap-space-4 overflow-y-auto">
              {error ? (
                <Banner
                  variant="Error"
                  message={error}
                  hasAction={false}
                  className="w-full"
                />
              ) : null}
              <FormField
                label="Subject name"
                required
                inputProps={{
                  value: title,
                  onChange: (e) => setTitle(e.target.value),
                }}
              />
              <FormField
                label="Units"
                required
                inputProps={{
                  type: "number",
                  min: 0,
                  step: "0.5",
                  value: units,
                  onChange: (e) => setUnits(e.target.value),
                }}
              />
              <FormField
                label="Prerequisite"
                inputProps={{
                  value: prerequisite,
                  placeholder: "e.g. ITE 13",
                  onChange: (e) => setPrerequisite(e.target.value),
                }}
              />
              <FormField
                label="Effectivity label"
                helper="Optional label (semester dates come from the semester)."
                inputProps={{
                  value: effectivity,
                  placeholder: "e.g. AY 2026–2027",
                  onChange: (e) => setEffectivity(e.target.value),
                }}
              />
              <div className="grid grid-cols-[110px_1fr] gap-space-3">
                <label className="flex flex-col gap-space-2">
                  <span className="text-body-sm font-medium text-text-secondary">
                    Title
                  </span>
                  <select
                    value={facultyTitle}
                    onChange={(e) =>
                      setFacultyTitle(e.target.value as FacultyTitle)
                    }
                    className="h-11 w-full rounded-md border border-border-default bg-bg-subtle px-space-2 text-body-sm text-text-primary"
                  >
                    <option value="">—</option>
                    <option value="Mr">Mr</option>
                    <option value="Ms">Ms</option>
                  </select>
                </label>
                <FormField
                  label="Instructor name"
                  inputProps={{
                    value: facultyName,
                    onChange: (e) => setFacultyName(e.target.value),
                  }}
                />
              </div>
              <FormField
                label="College"
                inputProps={{
                  value: college,
                  onChange: (e) => setCollege(e.target.value),
                }}
              />
              <FormField
                label="Consultation time"
                inputProps={{
                  value: consultation,
                  placeholder: "e.g. Mon 1–3 PM",
                  onChange: (e) => setConsultation(e.target.value),
                }}
              />
              <FormField
                label="Estimated contact hours"
                helper="Remaining hours count down with the semester calendar."
                inputProps={{
                  type: "number",
                  min: 0,
                  step: "1",
                  value: hours,
                  placeholder: "e.g. 54",
                  onChange: (e) => setHours(e.target.value),
                }}
              />
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
}

/** Build initial modal values from subject detail / list row. */
export function cardEditValuesFromDetail(input: {
  title: string;
  units: string | number;
  prerequisite?: string | null;
  effectivity?: string | null;
  faculty?: unknown;
}): SubjectCardEditValues {
  return {
    title: input.title,
    units: String(input.units),
    prerequisite: input.prerequisite ?? "",
    effectivity: input.effectivity ?? "",
    faculty: parseFaculty(input.faculty),
  };
}
