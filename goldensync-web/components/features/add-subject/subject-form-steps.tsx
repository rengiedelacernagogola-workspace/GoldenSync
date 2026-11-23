"use client";

/**
 * SubjectFormSteps — Add Subject Steps 1–5 (Figma `90:5086`+, UI-075/076).
 * FLOW: after PDF Complete or Manual → Step1…Step5 → Confirm.
 * RULE: FlaggedField for doubtful PDF values; validation disables Confirm.
 */

import * as React from "react";

import { FlaggedField } from "@/components/core/flagged-field";
import { FormField } from "@/components/core/form-field";
import { Stepper, type StepperStep } from "@/components/core/stepper";
import { Textarea } from "@/components/core/textarea";
import { goldenSyncSeed } from "@/data/seed";
import type { FacultyTitle } from "@/lib/domain/faculty";

export type SubjectFormStepIndex = 1 | 2 | 3 | 4 | 5;

export interface SubjectFormValues {
  code: string;
  title: string;
  units: string;
  prerequisite: string;
  effectivity: string;
  peos: string;
  pos: string;
  grading: string;
  policies: string;
  facultyTitle: FacultyTitle;
  facultyName: string;
  facultyCollege: string;
  facultyConsultation: string;
  estimatedContactHours: string;
}

export interface SubjectFormStepsProps {
  step: SubjectFormStepIndex;
  values: SubjectFormValues;
  onChange: (patch: Partial<SubjectFormValues>) => void;
  /** PDF path shows FlaggedField on prerequisite. */
  fromPdf?: boolean;
  showValidation?: boolean;
}

const STEP_META: { id: string; label: string }[] = [
  { id: "1", label: "Basics" },
  { id: "2", label: "Outcomes" },
  { id: "3", label: "Plan" },
  { id: "4", label: "Grading" },
  { id: "5", label: "Policies" },
];

/** Default form values from seed / empty manual. */
export function defaultSubjectFormValues(
  fromPdf: boolean,
): SubjectFormValues {
  if (!fromPdf) {
    return {
      code: "",
      title: "",
      units: "3",
      prerequisite: "",
      effectivity: "",
      peos: "",
      pos: "",
      grading: "",
      policies: "",
      facultyTitle: "",
      facultyName: "",
      facultyCollege: "",
      facultyConsultation: "",
      estimatedContactHours: "",
    };
  }
  const d = goldenSyncSeed.activeSubject;
  const c = goldenSyncSeed.subjects[0]!;
  return {
    code: c.code,
    title: c.title,
    units: String(c.units),
    prerequisite: d.prerequisite,
    effectivity: d.effectivity,
    peos: d.peos.join(", "),
    pos: d.pos.join(", "),
    grading: d.gradingBlurb,
    policies: d.policiesBlurb,
    facultyTitle: "",
    facultyName: d.facultyBlurb,
    facultyCollege: "",
    facultyConsultation: "",
    estimatedContactHours: "54",
  };
}

/** Build Stepper states for current step index. */
function toStepperSteps(step: SubjectFormStepIndex): StepperStep[] {
  return STEP_META.map((s, i) => {
    const n = (i + 1) as SubjectFormStepIndex;
    let state: StepperStep["state"] = "Upcoming";
    if (n < step) state = "Done";
    if (n === step) state = "Active";
    return { id: s.id, label: s.label, state };
  });
}

/**
 * Multi-step subject form body — parent owns step index + Confirm.
 */
export function SubjectFormSteps({
  step,
  values,
  onChange,
  fromPdf = false,
  showValidation = false,
}: SubjectFormStepsProps) {
  const set = (key: keyof SubjectFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ [key]: e.target.value });

  return (
    <div
      data-slot="gs-subject-form-steps"
      className="flex w-full flex-col gap-space-6"
    >
      <Stepper steps={toStepperSteps(step)} className="w-full" />

      {step === 1 ? (
        <div className="flex w-full flex-col gap-space-4">
          <FormField
            label="Subject code"
            required
            error={
              showValidation && !values.code.trim()
                ? "Enter a subject code"
                : undefined
            }
            inputProps={{
              value: values.code,
              onChange: set("code"),
              placeholder: "e.g. ITE 14",
            }}
          />
          <FormField
            label="Title"
            required
            error={
              showValidation && !values.title.trim()
                ? "Enter a title"
                : undefined
            }
            inputProps={{
              value: values.title,
              onChange: set("title"),
              placeholder: "Subject title",
            }}
          />
          <FormField
            label="Units"
            required
            inputProps={{
              value: values.units,
              onChange: set("units"),
              inputMode: "numeric",
            }}
          />
          {fromPdf ? (
            <FlaggedField
              label="Prerequisite"
              value={values.prerequisite}
              onChange={set("prerequisite")}
            />
          ) : (
            <FormField
              label="Prerequisite"
              inputProps={{
                value: values.prerequisite,
                onChange: set("prerequisite"),
                placeholder: "e.g. ITE 13",
              }}
            />
          )}
          <FormField
            label="Effectivity"
            inputProps={{
              value: values.effectivity,
              onChange: set("effectivity"),
              placeholder: "AY 2026–2027",
            }}
          />
        </div>
      ) : null}

      {step === 2 ? (
        <div className="flex w-full flex-col gap-space-4">
          <label className="flex w-full flex-col gap-space-2">
            <span className="text-body-sm font-medium text-text-secondary">
              PEOs
            </span>
            <Textarea
              value={values.peos}
              onChange={set("peos")}
              placeholder="PEO1, PEO2…"
            />
          </label>
          <label className="flex w-full flex-col gap-space-2">
            <span className="text-body-sm font-medium text-text-secondary">
              POs
            </span>
            <Textarea
              value={values.pos}
              onChange={set("pos")}
              placeholder="PO a, PO b…"
            />
          </label>
        </div>
      ) : null}

      {step === 3 ? (
        <p className="text-body-sm text-text-muted">
          Learning plan rows sync from the PDF or Checklist. Edit weeks after
          the subject is created.
        </p>
      ) : null}

      {step === 4 ? (
        <label className="flex w-full flex-col gap-space-2">
          <span className="text-body-sm font-medium text-text-secondary">
            Grading
          </span>
          <Textarea
            value={values.grading}
            onChange={set("grading")}
            placeholder="Grading breakdown"
          />
        </label>
      ) : null}

      {step === 5 ? (
        <div className="flex w-full flex-col gap-space-4">
          <label className="flex w-full flex-col gap-space-2">
            <span className="text-body-sm font-medium text-text-secondary">
              Policies
            </span>
            <Textarea
              value={values.policies}
              onChange={set("policies")}
            />
          </label>
          <div className="grid grid-cols-[110px_1fr] gap-space-3">
            <label className="flex flex-col gap-space-2">
              <span className="text-body-sm font-medium text-text-secondary">
                Title
              </span>
              <select
                value={values.facultyTitle}
                onChange={(e) =>
                  onChange({
                    facultyTitle: e.target.value as FacultyTitle,
                  })
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
                value: values.facultyName,
                onChange: set("facultyName"),
              }}
            />
          </div>
          <FormField
            label="College"
            inputProps={{
              value: values.facultyCollege,
              onChange: set("facultyCollege"),
            }}
          />
          <FormField
            label="Consultation time"
            inputProps={{
              value: values.facultyConsultation,
              onChange: set("facultyConsultation"),
              placeholder: "e.g. Mon 1–3 PM",
            }}
          />
          <FormField
            label="Estimated contact hours"
            helper="Remaining hours count down with the semester calendar."
            inputProps={{
              type: "number",
              min: 0,
              value: values.estimatedContactHours,
              onChange: set("estimatedContactHours"),
              placeholder: "e.g. 54",
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
