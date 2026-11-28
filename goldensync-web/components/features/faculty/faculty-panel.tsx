"use client";

// WHAT: Faculty card — instructor, college, consultation, contact hours.
// SCREEN: Subject detail (College Faculty area) on live subject pages.
// HOW: parseFaculty → view; Edit drafts → patchSubject({ faculty }).
// EDIT: readOnly hides CardEditReveal for past semesters.
// RISK: Contact hours validated client-side only before save.

/**
 * College Faculty — per-subject instructor / college / consultation.
 * FLOW: view → Edit → Save (PATCH faculty) / Cancel · Past semester read-only.
 */

import * as React from "react";

import { Card, Input } from "@/components/core";
import { CardEditReveal } from "@/components/features/shared/card-edit-reveal";
import { ApiClientError } from "@/lib/api/client";
import { patchSubject } from "@/lib/api/subjects";
import {
  formatInstructorName,
  parseFaculty,
  serializeFaculty,
  type FacultyTitle,
} from "@/lib/domain/faculty";
import { compactSelectClass } from "@/lib/ui/compact-field";
import { cn } from "@/lib/utils";

export type FacultyPanelProps = {
  subjectId: string;
  live: boolean;
  /** Past semester — hide Edit / Save. */
  readOnly?: boolean;
  faculty: unknown;
  onSaved?: () => void;
  onActivity?: (entry: {
    kind: "subject";
    title: string;
    detail: string;
  }) => void;
};

// WHAT: Show em dash when text field is empty in view mode.
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

/** Faculty card with whole-card Edit mode — one set of fields per subject. */
export function FacultyPanel({
  subjectId,
  live,
  readOnly = false,
  faculty,
  onSaved,
  onActivity,
}: FacultyPanelProps) {
  const info = React.useMemo(() => parseFaculty(faculty), [faculty]);

  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [draftTitle, setDraftTitle] = React.useState<FacultyTitle>(info.title);
  const [draftName, setDraftName] = React.useState(info.name);
  const [draftCollege, setDraftCollege] = React.useState(info.college);
  const [draftConsultation, setDraftConsultation] = React.useState(
    info.consultation,
  );
  const [draftHours, setDraftHours] = React.useState(
    info.estimatedContactHours != null
      ? String(info.estimatedContactHours)
      : "",
  );

  function hydrateDrafts() {
    setDraftTitle(info.title);
    setDraftName(info.name);
    setDraftCollege(info.college);
    setDraftConsultation(info.consultation);
    setDraftHours(
      info.estimatedContactHours != null
        ? String(info.estimatedContactHours)
        : "",
    );
  }

  function beginEdit() {
    if (!live || readOnly) return;
    setError(null);
    hydrateDrafts();
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setError(null);
  }

  async function saveAll() {
    if (!live || readOnly) return;

    const hoursTrim = draftHours.trim();
    let estimatedContactHours: number | null = null;
    if (hoursTrim !== "") {
      const n = Number(hoursTrim);
      if (!Number.isFinite(n) || n < 0) {
        setError("Contact hours must be a non-negative number.");
        return;
      }
      estimatedContactHours = n;
    }

    const next = serializeFaculty({
      title: draftTitle,
      name: draftName,
      college: draftCollege,
      consultation: draftConsultation,
      estimatedContactHours,
    });

    setSaving(true);
    setError(null);
    try {
      await patchSubject(subjectId, { faculty: next });
      setEditing(false);
      onSaved?.();
      onActivity?.({
        kind: "subject",
        title: "Faculty updated",
        detail: formatInstructorName(next) !== "—"
          ? formatInstructorName(next)
          : next.college.trim() || "Faculty details saved",
      });
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Could not save faculty details.",
      );
    } finally {
      setSaving(false);
    }
  }

  const headerAction =
    live && !readOnly ? (
      <CardEditReveal
        editing={editing}
        saving={saving}
        editAriaLabel="Edit faculty"
        onBeginEdit={beginEdit}
        onCancel={cancelEdit}
        onSave={() => void saveAll()}
      />
    ) : undefined;

  return (
    <Card
      title="Faculty"
      hasHeader
      hasHeaderBadge={Boolean(headerAction)}
      headerBadge={headerAction}
      className="h-full w-full min-w-0 [&_[data-slot=gs-card-content]]:w-full [&_[data-slot=gs-card-content]]:items-stretch"
    >
      <div className="flex w-full min-w-0 flex-col gap-space-4">
        {!live ? (
          <p className="text-caption text-text-muted">
            Sign in and open a live subject to edit faculty for that subject.
          </p>
        ) : null}

        {readOnly ? (
          <p className="text-caption text-text-muted">
            Past semester — view only.
          </p>
        ) : null}

        {error ? (
          <p className="text-body-sm text-status-error" role="alert">
            {error}
          </p>
        ) : null}

        <Row label="Instructor">
          {editing ? (
            <div className="grid w-full min-w-0 grid-cols-1 gap-space-2 sm:grid-cols-[110px_minmax(0,1fr)]">
              <label className="flex min-w-0 flex-col gap-space-1">
                <span className="text-caption text-text-muted">Title</span>
                <select
                  value={draftTitle}
                  disabled={saving}
                  onChange={(e) =>
                    setDraftTitle(e.target.value as FacultyTitle)
                  }
                  aria-label="Instructor title"
                  className={cn(compactSelectClass, "disabled:opacity-60")}
                >
                  <option value="">—</option>
                  <option value="Mr">Mr</option>
                  <option value="Ms">Ms</option>
                </select>
              </label>
              <label className="flex min-w-0 flex-col gap-space-1">
                <span className="text-caption text-text-muted">Name</span>
                <Input
                  size="Compact"
                  value={draftName}
                  disabled={saving}
                  onChange={(e) => setDraftName(e.target.value)}
                  aria-label="Instructor name"
                  placeholder="(editable)"
                  className="w-full min-w-0"
                />
              </label>
            </div>
          ) : (
            <SpecValue>{formatInstructorName(info)}</SpecValue>
          )}
        </Row>

        <Row label="College">
          {editing ? (
            <Input
              size="Compact"
              value={draftCollege}
              disabled={saving}
              onChange={(e) => setDraftCollege(e.target.value)}
              aria-label="College"
              placeholder="(editable)"
              className="w-full min-w-0"
            />
          ) : (
            <SpecValue>{dash(info.college)}</SpecValue>
          )}
        </Row>

        <Row label="Consultation">
          {editing ? (
            <Input
              size="Compact"
              value={draftConsultation}
              disabled={saving}
              onChange={(e) => setDraftConsultation(e.target.value)}
              aria-label="Consultation"
              placeholder="(editable)"
              className="w-full min-w-0"
            />
          ) : (
            <SpecValue>{dash(info.consultation)}</SpecValue>
          )}
        </Row>

        <Row label="Contact hours">
          {editing ? (
            <Input
              size="Compact"
              type="number"
              min={0}
              step="1"
              value={draftHours}
              disabled={saving}
              onChange={(e) => setDraftHours(e.target.value)}
              aria-label="Estimated contact hours"
              placeholder="(editable)"
              className="w-full min-w-0"
            />
          ) : (
            <SpecValue>
              {info.estimatedContactHours != null
                ? `${info.estimatedContactHours} hrs`
                : "—"}
            </SpecValue>
          )}
        </Row>
      </div>
    </Card>
  );
}
