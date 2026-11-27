"use client";

/**
 * Overview Course specification — header Edit opens whole-card edit mode.
 * FLOW: view → Edit → all fields → Save (PATCH) / Cancel · Semester read-only.
 */

import * as React from "react";

import { Card, Input, Textarea } from "@/components/core";
import { CardEditReveal } from "@/components/features/shared/card-edit-reveal";
import { ApiClientError } from "@/lib/api/client";
import { patchSubject } from "@/lib/api/subjects";
import {
  formatSplitHours,
  formatSplitUnits,
  parseOptionalNumber,
  parsePoliciesDoc,
  serializePoliciesDoc,
  totalContactHours,
  totalUnits,
} from "@/lib/domain/course-spec";
import {
  parseFaculty,
  serializeFaculty,
} from "@/lib/domain/faculty";
import { cn } from "@/lib/utils";

export type CourseSpecCardProps = {
  subjectId: string;
  live: boolean;
  /** Past semester — hide Edit / Save. */
  readOnly?: boolean;
  code: string;
  title: string;
  units: string;
  prerequisite: string;
  effectivity: string;
  semesterLabel: string;
  policies: unknown;
  faculty: unknown;
  onSaved?: () => void;
  onActivity?: (entry: {
    kind: "subject";
    title: string;
    detail: string;
  }) => void;
};

function dash(value: string | null | undefined): string {
  const t = (value ?? "").trim();
  return t || "—";
}

function SpecLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-body-sm text-text-muted">{children}</span>;
}

function SpecValue({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("text-body-sm text-text-primary", className)}>
      {children}
    </span>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid w-full min-w-0 grid-cols-1 items-start gap-space-1 sm:grid-cols-[minmax(120px,180px)_minmax(0,1fr)] sm:gap-space-4">
      <SpecLabel>{label}</SpecLabel>
      <div className="min-w-0 w-full">{children}</div>
    </div>
  );
}

/** Course specification card with whole-card Edit mode. */
export function CourseSpecCard({
  subjectId,
  live,
  readOnly = false,
  code,
  title,
  units,
  prerequisite,
  effectivity,
  semesterLabel,
  policies,
  faculty,
  onSaved,
  onActivity,
}: CourseSpecCardProps) {
  const doc = React.useMemo(() => parsePoliciesDoc(policies), [policies]);
  const facultyInfo = React.useMemo(() => parseFaculty(faculty), [faculty]);
  const spec = doc.courseSpec;

  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [draftCode, setDraftCode] = React.useState(code);
  const [draftTitle, setDraftTitle] = React.useState(title);
  const [draftLectureUnits, setDraftLectureUnits] = React.useState("");
  const [draftLabUnits, setDraftLabUnits] = React.useState("");
  const [draftPrereq, setDraftPrereq] = React.useState(prerequisite);
  const [draftCoreq, setDraftCoreq] = React.useState(spec.corequisite);
  const [draftLectureHours, setDraftLectureHours] = React.useState("");
  const [draftLabHours, setDraftLabHours] = React.useState("");
  const [draftEffectivity, setDraftEffectivity] = React.useState(effectivity);
  const [draftModality, setDraftModality] = React.useState(
    spec.learningModality,
  );
  const [draftResources, setDraftResources] = React.useState(
    spec.learningResources,
  );
  const [draftEvidence, setDraftEvidence] = React.useState(
    spec.outcomesBasedEvidence,
  );
  const [draftDescription, setDraftDescription] = React.useState(
    spec.courseDescription,
  );

  function hydrateDrafts() {
    setDraftCode(code);
    setDraftTitle(title);
    setDraftLectureUnits(
      spec.lectureUnits != null ? String(spec.lectureUnits) : "",
    );
    setDraftLabUnits(spec.labUnits != null ? String(spec.labUnits) : "");
    setDraftPrereq(prerequisite);
    setDraftCoreq(spec.corequisite);
    setDraftLectureHours(
      spec.lectureHours != null ? String(spec.lectureHours) : "",
    );
    setDraftLabHours(spec.labHours != null ? String(spec.labHours) : "");
    setDraftEffectivity(effectivity);
    setDraftModality(spec.learningModality);
    setDraftResources(spec.learningResources);
    setDraftEvidence(spec.outcomesBasedEvidence);
    setDraftDescription(spec.courseDescription);
  }

  function beginEdit() {
    if (!live) return;
    setError(null);
    hydrateDrafts();
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setError(null);
  }

  async function saveAll() {
    if (!live) return;
    const nextCode = draftCode.trim();
    const nextTitle = draftTitle.trim();
    if (!nextCode || !nextTitle) {
      setError("Course code and name are required.");
      return;
    }

    const lectureUnits = parseOptionalNumber(draftLectureUnits);
    const labUnits = parseOptionalNumber(draftLabUnits);
    const lectureHours = parseOptionalNumber(draftLectureHours);
    const labHours = parseOptionalNumber(draftLabHours);
    const hoursSum = totalContactHours(lectureHours, labHours);
    const unitsSum = totalUnits(lectureUnits, labUnits);

    const nextDoc = serializePoliciesDoc({
      classPolicies: doc.classPolicies,
      courseSpec: {
        lectureUnits,
        labUnits,
        corequisite: draftCoreq.trim(),
        lectureHours,
        labHours,
        learningModality: draftModality.trim(),
        learningResources: draftResources.trim(),
        outcomesBasedEvidence: draftEvidence.trim(),
        courseDescription: draftDescription.trim(),
      },
      outcomesSyllabus: doc.outcomesSyllabus,
    });

    setSaving(true);
    setError(null);
    try {
      await patchSubject(subjectId, {
        courseCode: nextCode,
        title: nextTitle,
        units: unitsSum != null ? unitsSum : units.trim() || "3",
        prerequisite: draftPrereq.trim() || null,
        effectivity: draftEffectivity.trim() || null,
        policies: nextDoc,
        faculty: serializeFaculty({
          ...facultyInfo,
          estimatedContactHours:
            hoursSum != null ? hoursSum : facultyInfo.estimatedContactHours,
        }),
      });
      setEditing(false);
      onSaved?.();
      onActivity?.({
        kind: "subject",
        title: "Course specification updated",
        detail: `${nextCode} — ${nextTitle}`,
      });
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Could not save course specification.",
      );
    } finally {
      setSaving(false);
    }
  }

  const unitsDisplay =
    spec.lectureUnits != null || spec.labUnits != null
      ? formatSplitUnits(spec.lectureUnits, spec.labUnits)
      : dash(units);

  const hoursDisplay = formatSplitHours(spec.lectureHours, spec.labHours);

  const headerAction =
    live && !readOnly ? (
      <CardEditReveal
        editing={editing}
        saving={saving}
        editAriaLabel="Edit course specification"
        onBeginEdit={beginEdit}
        onCancel={cancelEdit}
        onSave={() => void saveAll()}
      />
    ) : undefined;

  return (
    <Card
      title="Course specification"
      hasHeader
      hasHeaderBadge={Boolean(headerAction)}
      headerBadge={headerAction}
      className="w-full min-w-0 [&_[data-slot=gs-card-content]]:w-full [&_[data-slot=gs-card-content]]:items-stretch"
    >
      <div className="flex w-full min-w-0 flex-col gap-space-4">
        {!live ? (
          <p className="text-caption text-text-muted">
            Sign in and open a live subject to edit.
          </p>
        ) : null}

        {error ? (
          <p className="text-body-sm text-status-error" role="alert">
            {error}
          </p>
        ) : null}

        <Row label="Course code & name">
          {editing ? (
            <div className="flex w-full min-w-0 flex-col gap-space-2">
              <Input
                size="Compact"
                value={draftCode}
                onChange={(e) => setDraftCode(e.target.value)}
                aria-label="Course code"
                placeholder="e.g. CSC 106"
                className="w-full min-w-0"
              />
              <Input
                size="Compact"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                aria-label="Course name"
                placeholder="Course name"
                className="w-full min-w-0"
              />
            </div>
          ) : (
            <SpecValue>
              {dash(code)}
              {title.trim() ? ` — ${title.trim()}` : ""}
            </SpecValue>
          )}
        </Row>

        <Row label="Credit units">
          {editing ? (
            <div className="grid w-full min-w-0 grid-cols-1 gap-space-2 sm:grid-cols-2">
              <label className="flex min-w-0 flex-col gap-space-1">
                <span className="text-caption text-text-muted">Lecture</span>
                <Input
                  size="Compact"
                  type="number"
                  min={0}
                  step="0.5"
                  value={draftLectureUnits}
                  onChange={(e) => setDraftLectureUnits(e.target.value)}
                  aria-label="Lecture units"
                  placeholder="e.g. 2"
                  className="w-full min-w-0"
                />
              </label>
              <label className="flex min-w-0 flex-col gap-space-1">
                <span className="text-caption text-text-muted">Laboratory</span>
                <Input
                  size="Compact"
                  type="number"
                  min={0}
                  step="0.5"
                  value={draftLabUnits}
                  onChange={(e) => setDraftLabUnits(e.target.value)}
                  aria-label="Laboratory units"
                  placeholder="e.g. 1"
                  className="w-full min-w-0"
                />
              </label>
            </div>
          ) : (
            <SpecValue>{unitsDisplay}</SpecValue>
          )}
        </Row>

        <Row label="Pre-req / Co-req">
          {editing ? (
            <div className="grid w-full min-w-0 grid-cols-1 gap-space-2 sm:grid-cols-2">
              <label className="flex min-w-0 flex-col gap-space-1">
                <span className="text-caption text-text-muted">
                  Pre-requisite
                </span>
                <Input
                  size="Compact"
                  value={draftPrereq}
                  onChange={(e) => setDraftPrereq(e.target.value)}
                  aria-label="Pre-requisite"
                  placeholder="e.g. ITE 13"
                  className="w-full min-w-0"
                />
              </label>
              <label className="flex min-w-0 flex-col gap-space-1">
                <span className="text-caption text-text-muted">
                  Co-requisite
                </span>
                <Input
                  size="Compact"
                  value={draftCoreq}
                  onChange={(e) => setDraftCoreq(e.target.value)}
                  aria-label="Co-requisite"
                  placeholder="NONE"
                  className="w-full min-w-0"
                />
              </label>
            </div>
          ) : (
            <SpecValue>
              Pre-req: {dash(prerequisite)}
              {" · "}
              Co-req: {dash(spec.corequisite)}
            </SpecValue>
          )}
        </Row>

        <Row label="Contact hours">
          {editing ? (
            <div className="grid w-full min-w-0 grid-cols-1 gap-space-2 sm:grid-cols-2">
              <label className="flex min-w-0 flex-col gap-space-1">
                <span className="text-caption text-text-muted">Lecture</span>
                <Input
                  size="Compact"
                  type="number"
                  min={0}
                  step="1"
                  value={draftLectureHours}
                  onChange={(e) => setDraftLectureHours(e.target.value)}
                  aria-label="Lecture contact hours"
                  placeholder="e.g. 54"
                  className="w-full min-w-0"
                />
              </label>
              <label className="flex min-w-0 flex-col gap-space-1">
                <span className="text-caption text-text-muted">Laboratory</span>
                <Input
                  size="Compact"
                  type="number"
                  min={0}
                  step="1"
                  value={draftLabHours}
                  onChange={(e) => setDraftLabHours(e.target.value)}
                  aria-label="Laboratory contact hours"
                  placeholder="e.g. 36"
                  className="w-full min-w-0"
                />
              </label>
            </div>
          ) : (
            <SpecValue>{hoursDisplay}</SpecValue>
          )}
        </Row>

        <Row label="Effectivity">
          {editing ? (
            <Input
              size="Compact"
              value={draftEffectivity}
              onChange={(e) => setDraftEffectivity(e.target.value)}
              aria-label="Effectivity"
              placeholder="e.g. 2nd Semester A.Y. 2025-2026"
              className="w-full min-w-0"
            />
          ) : (
            <SpecValue>{dash(effectivity)}</SpecValue>
          )}
        </Row>

        <Row label="Learning modality">
          {editing ? (
            <Input
              size="Compact"
              value={draftModality}
              onChange={(e) => setDraftModality(e.target.value)}
              aria-label="Learning modality"
              placeholder="e.g. Onsite / Online"
              className="w-full min-w-0"
            />
          ) : (
            <SpecValue>{dash(spec.learningModality)}</SpecValue>
          )}
        </Row>

        <Row label="Learning resources">
          {editing ? (
            <Input
              size="Compact"
              value={draftResources}
              onChange={(e) => setDraftResources(e.target.value)}
              aria-label="Learning resources needed"
              placeholder="e.g. Classroom, Audio-visual, laptop, internet"
              className="w-full min-w-0"
            />
          ) : (
            <SpecValue>{dash(spec.learningResources)}</SpecValue>
          )}
        </Row>

        <Row label="Outcomes-based evidence">
          {editing ? (
            <Input
              size="Compact"
              value={draftEvidence}
              onChange={(e) => setDraftEvidence(e.target.value)}
              aria-label="Outcomes-based evidence"
              placeholder="e.g. At least 80% of the class attain ≥ 60% on all CO"
              className="w-full min-w-0"
            />
          ) : (
            <SpecValue>{dash(spec.outcomesBasedEvidence)}</SpecValue>
          )}
        </Row>

        <Row label="Course description">
          {editing ? (
            <Textarea
              rows={6}
              value={draftDescription}
              onChange={(e) => setDraftDescription(e.target.value)}
              aria-label="Course description"
              placeholder="Course description…"
              className="w-full min-w-0"
            />
          ) : (
            <SpecValue className="whitespace-pre-wrap">
              {dash(spec.courseDescription)}
            </SpecValue>
          )}
        </Row>

        <Row label="Semester">
          <SpecValue>{dash(semesterLabel)}</SpecValue>
        </Row>
      </div>
    </Card>
  );
}
