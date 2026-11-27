"use client";

// WHAT: Free-text class policies for one subject.
// SCREEN: Subject policies area (Class policies card).
// HOW: parsePoliciesDoc → edit draft textarea → merge into full policies JSON on save.
// EDIT: Other policy sections (course spec, outcomes) preserved via serializePoliciesDoc spread.
// KEEP: Same CardEditReveal pattern as FacultyPanel.

/**
 * Class policies — per-subject free-text policies.
 * FLOW: view → Edit → Save (PATCH policies.classPolicies) / Cancel · Past semester read-only.
 */

import * as React from "react";

import { Card, Textarea } from "@/components/core";
import { CardEditReveal } from "@/components/features/shared/card-edit-reveal";
import { ApiClientError } from "@/lib/api/client";
import { patchSubject } from "@/lib/api/subjects";
import {
  parsePoliciesDoc,
  serializePoliciesDoc,
} from "@/lib/domain/course-spec";

export type ClassPoliciesPanelProps = {
  subjectId: string;
  live: boolean;
  /** Past semester — hide Edit / Save. */
  readOnly?: boolean;
  policies: unknown;
  onSaved?: () => void;
  onActivity?: (entry: {
    kind: "subject";
    title: string;
    detail: string;
  }) => void;
};

/** Class policies card with whole-card Edit mode. */
export function ClassPoliciesPanel({
  subjectId,
  live,
  readOnly = false,
  policies,
  onSaved,
  onActivity,
}: ClassPoliciesPanelProps) {
  const doc = React.useMemo(() => parsePoliciesDoc(policies), [policies]);
  const saved = doc.classPolicies;

  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState(saved);

  function beginEdit() {
    if (!live || readOnly) return;
    setError(null);
    setDraft(saved);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setError(null);
  }

  async function saveAll() {
    if (!live || readOnly) return;

    const nextDoc = serializePoliciesDoc({
      ...doc,
      classPolicies: draft,
    });

    setSaving(true);
    setError(null);
    try {
      await patchSubject(subjectId, { policies: nextDoc });
      setEditing(false);
      onSaved?.();
      onActivity?.({
        kind: "subject",
        title: "Class policies updated",
        detail: "Class policies saved for this subject",
      });
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Could not save class policies.",
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
        editAriaLabel="Edit class policies"
        onBeginEdit={beginEdit}
        onCancel={cancelEdit}
        onSave={() => void saveAll()}
      />
    ) : undefined;

  const viewText = saved.trim() || "—";

  return (
    <Card
      title="Class policies"
      hasHeader
      hasHeaderBadge={Boolean(headerAction)}
      headerBadge={headerAction}
      className="h-full w-full min-w-0 [&_[data-slot=gs-card-content]]:w-full [&_[data-slot=gs-card-content]]:items-stretch"
    >
      <div className="flex w-full min-w-0 flex-col gap-space-4">
        {!live ? (
          <p className="text-caption text-text-muted">
            Sign in and open a live subject to edit class policies.
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

        {editing ? (
          <Textarea
            rows={12}
            value={draft}
            disabled={saving}
            onChange={(e) => setDraft(e.target.value)}
            aria-label="Class policies"
            placeholder="(editable)"
            className="w-full min-w-0"
          />
        ) : (
          <p className="whitespace-pre-wrap text-body-sm text-text-secondary">
            {viewText}
          </p>
        )}
      </div>
    </Card>
  );
}
