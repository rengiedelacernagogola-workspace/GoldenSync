"use client";

/**
 * Outcomes — syllabus Part II: Vision / Mission / GA / IOs / PEO·PO·CO.
 * FLOW: view → Edit → Save (policies.outcomesSyllabus + Outcome rows) / Cancel.
 */

import { Pencil, Plus, Trash2 } from "lucide-react";
import * as React from "react";

import { Button, Card, Input, Textarea } from "@/components/core";
import { ApiClientError } from "@/lib/api/client";
import { replaceOutcomes, patchSubject } from "@/lib/api/subjects";
import {
  parsePoliciesDoc,
  serializePoliciesDoc,
} from "@/lib/domain/course-spec";
import {
  cloneOutcomesSyllabus,
  resolveOutcomesSyllabus,
  serializeOutcomesSyllabus,
  type OutcomesListItem,
  type OutcomesSyllabusDoc,
} from "@/lib/domain/outcomes-syllabus";
import { cn } from "@/lib/utils";

export type OutcomesSyllabusPanelProps = {
  subjectId: string;
  live: boolean;
  policies: unknown;
  outcomes: Array<{
    kind: string;
    code: string;
    description: string;
    position: number;
  }>;
  onSaved?: () => void;
  onActivity?: (entry: {
    kind: "subject";
    title: string;
    detail: string;
  }) => void;
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-body-sm font-semibold uppercase tracking-wide text-text-muted">
      {children}
    </h3>
  );
}

function ProseBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-space-2">
      <SectionHeading>{label}</SectionHeading>
      <p className="whitespace-pre-wrap text-body-sm text-text-primary">
        {value.trim() || "—"}
      </p>
    </div>
  );
}

function ListBlock({
  title,
  items,
}: {
  title: string;
  items: OutcomesListItem[];
}) {
  return (
    <div className="flex flex-col gap-space-3">
      <SectionHeading>{title}</SectionHeading>
      {items.length === 0 ? (
        <p className="text-body-sm text-text-muted">—</p>
      ) : (
        <ol className="flex list-none flex-col gap-space-3 p-0">
          {items.map((item) => (
            <li key={`${item.code}-${item.description.slice(0, 24)}`} className="flex flex-col gap-space-1">
              <span className="text-body-sm font-semibold text-text-primary">
                {item.code}
              </span>
              <span className="text-body-sm text-text-primary">
                {item.description.trim() || "—"}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function EditableProse({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-space-2">
      <SectionHeading>{label}</SectionHeading>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        aria-label={label}
      />
    </div>
  );
}

function EditableList({
  title,
  items,
  onChange,
  codePlaceholder,
}: {
  title: string;
  items: OutcomesListItem[];
  onChange: (next: OutcomesListItem[]) => void;
  codePlaceholder: string;
}) {
  function updateAt(index: number, patch: Partial<OutcomesListItem>) {
    onChange(
      items.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  function removeAt(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addRow() {
    onChange([...items, { code: "", description: "" }]);
  }

  return (
    <div className="flex flex-col gap-space-3">
      <div className="flex items-center justify-between gap-space-2">
        <SectionHeading>{title}</SectionHeading>
        <Button variant="Ghost" size="sm" type="button" onClick={addRow}>
          <Plus className="size-3.5" aria-hidden />
          Add
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-caption text-text-muted">No items yet. Add one.</p>
      ) : (
        <ul className="flex list-none flex-col gap-space-3 p-0">
          {items.map((item, index) => (
            <li
              key={`edit-${title}-${index}`}
              className="flex flex-col gap-space-2 rounded-md border border-border-subtle p-space-3"
            >
              <div className="flex items-start gap-space-2">
                <Input
                  size="Compact"
                  value={item.code}
                  onChange={(e) => updateAt(index, { code: e.target.value })}
                  aria-label={`${title} code ${index + 1}`}
                  placeholder={codePlaceholder}
                  className="max-w-[8rem]"
                />
                <Button
                  variant="Ghost"
                  size="sm"
                  type="button"
                  aria-label={`Remove ${title} row ${index + 1}`}
                  onClick={() => removeAt(index)}
                >
                  <Trash2 className="size-3.5" aria-hidden />
                </Button>
              </div>
              <Textarea
                value={item.description}
                onChange={(e) =>
                  updateAt(index, { description: e.target.value })
                }
                rows={3}
                aria-label={`${title} description ${index + 1}`}
                placeholder="Description"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function toOutcomeRows(doc: OutcomesSyllabusDoc) {
  const rows: Array<{
    kind: "PEO" | "PO" | "CO";
    code: string;
    description: string;
    position: number;
  }> = [];
  let position = 0;
  for (const item of doc.peos) {
    if (!item.code.trim() && !item.description.trim()) continue;
    rows.push({
      kind: "PEO",
      code: item.code.trim() || `PEO${position + 1}`,
      description: item.description.trim(),
      position: position++,
    });
  }
  for (const item of doc.pos) {
    if (!item.code.trim() && !item.description.trim()) continue;
    rows.push({
      kind: "PO",
      code: item.code.trim() || `PO${position + 1}`,
      description: item.description.trim(),
      position: position++,
    });
  }
  for (const item of doc.cos) {
    if (!item.code.trim() && !item.description.trim()) continue;
    rows.push({
      kind: "CO",
      code: item.code.trim() || `CO${position + 1}`,
      description: item.description.trim(),
      position: position++,
    });
  }
  return rows;
}

export function OutcomesSyllabusPanel({
  subjectId,
  live,
  policies,
  outcomes,
  onSaved,
  onActivity,
}: OutcomesSyllabusPanelProps) {
  const resolved = React.useMemo(
    () => resolveOutcomesSyllabus({ policiesRaw: policies, outcomes }),
    [policies, outcomes],
  );

  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState<OutcomesSyllabusDoc>(() =>
    cloneOutcomesSyllabus(resolved),
  );
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!editing) {
      setDraft(cloneOutcomesSyllabus(resolved));
    }
  }, [resolved, editing]);

  function beginEdit() {
    setDraft(cloneOutcomesSyllabus(resolved));
    setError(null);
    setEditing(true);
  }

  function cancelEdit() {
    setDraft(cloneOutcomesSyllabus(resolved));
    setError(null);
    setEditing(false);
  }

  async function saveAll() {
    if (!live) return;
    setSaving(true);
    setError(null);
    try {
      const cleaned = serializeOutcomesSyllabus(draft);
      const existing = parsePoliciesDoc(policies);
      const nextPolicies = serializePoliciesDoc({
        classPolicies: existing.classPolicies,
        courseSpec: existing.courseSpec,
        outcomesSyllabus: cleaned,
      });

      await patchSubject(subjectId, { policies: nextPolicies });
      await replaceOutcomes(subjectId, toOutcomeRows(cleaned));

      setEditing(false);
      onSaved?.();
      onActivity?.({
        kind: "subject",
        title: "Outcomes syllabus updated",
        detail: "Vision, mission, IOs, PEO, PO, and CO saved",
      });
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Could not save outcomes syllabus.",
      );
    } finally {
      setSaving(false);
    }
  }

  const headerAction = live ? (
    editing ? (
      <div className="flex items-center gap-space-2">
        <Button
          variant="Primary"
          size="sm"
          disabled={saving}
          onClick={() => void saveAll()}
        >
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button
          variant="Ghost"
          size="sm"
          disabled={saving}
          onClick={cancelEdit}
        >
          Cancel
        </Button>
      </div>
    ) : (
      <Button
        variant="Secondary"
        size="sm"
        onClick={beginEdit}
        aria-label="Edit outcomes syllabus"
      >
        <Pencil className="size-3.5" aria-hidden />
        Edit
      </Button>
    )
  ) : undefined;

  const view = editing ? draft : resolved;

  return (
    <Card
      title="Program & course outcomes"
      hasHeader
      hasHeaderBadge={Boolean(headerAction)}
      headerBadge={headerAction}
      className="w-full"
    >
      <div className={cn("flex flex-col gap-space-6")}>
        {!live ? (
          <p className="text-caption text-text-muted">
            Sign in and open a live subject to edit. Seed content shown for
            reference.
          </p>
        ) : null}

        {error ? (
          <p className="text-body-sm text-status-error" role="alert">
            {error}
          </p>
        ) : null}

        {editing ? (
          <>
            <EditableProse
              label="Vision"
              value={draft.vision}
              onChange={(vision) => setDraft((d) => ({ ...d, vision }))}
              rows={3}
            />
            <EditableProse
              label="Mission"
              value={draft.mission}
              onChange={(mission) => setDraft((d) => ({ ...d, mission }))}
              rows={3}
            />
            <EditableProse
              label="Graduate attributes"
              value={draft.graduateAttributes}
              onChange={(graduateAttributes) =>
                setDraft((d) => ({ ...d, graduateAttributes }))
              }
              rows={3}
            />
            <EditableList
              title="Institutional outcomes"
              items={draft.institutionalOutcomes}
              codePlaceholder="IO1"
              onChange={(institutionalOutcomes) =>
                setDraft((d) => ({ ...d, institutionalOutcomes }))
              }
            />
            <EditableList
              title="Program educational objectives (PEO)"
              items={draft.peos}
              codePlaceholder="PEO1"
              onChange={(peos) => setDraft((d) => ({ ...d, peos }))}
            />
            <EditableList
              title="Program outcomes (PO)"
              items={draft.pos}
              codePlaceholder="PO-1"
              onChange={(pos) => setDraft((d) => ({ ...d, pos }))}
            />
            <EditableList
              title="Course outcomes (CO)"
              items={draft.cos}
              codePlaceholder="CO1"
              onChange={(cos) => setDraft((d) => ({ ...d, cos }))}
            />
          </>
        ) : (
          <>
            <ProseBlock label="Vision" value={view.vision} />
            <ProseBlock label="Mission" value={view.mission} />
            <ProseBlock
              label="Graduate attributes"
              value={view.graduateAttributes}
            />
            <ListBlock
              title="Institutional outcomes"
              items={view.institutionalOutcomes}
            />
            <ListBlock
              title="Program educational objectives (PEO)"
              items={view.peos}
            />
            <ListBlock title="Program outcomes (PO)" items={view.pos} />
            <ListBlock title="Course outcomes (CO)" items={view.cos} />
          </>
        )}
      </div>
    </Card>
  );
}
